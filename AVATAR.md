# El avatar en 3D

El selector corre en HTML con Three.js: una plataforma, el personaje y las
piezas de ropa que se eligen por slot. No hay motor de juego de por medio.

El contenido sale de **Cozy Citizens** (PixeliusVita), un pack de Unity. De
ahí se extraen el cuerpo, las 214 piezas de ropa y la animación de reposo a
un único GLB de 3 MB.

## Preparar los archivos

Son binarios que no se versionan. Para generarlos hace falta el pack y
Blender instalado:

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background \
  --python herramientas/extraer-avatar.py -- \
  "<ruta>/Assets/CozyKit2026/HumanModular" public/avatar/modelos
```

Eso deja `avatar.glb`. Después, a mano:

```bash
# la paleta de colores, que comparten todas las piezas
cp "<ruta>/PixeliusVita_Share/GP.png" public/avatar/modelos/paleta.png

# los iconos del vestuario, que ya vienen renderizados
mkdir -p public/avatar/iconos && cp "<ruta>/Wardrobe/Icons/"*.png public/avatar/iconos/

# el decodificador de Draco, para no depender de un CDN ajeno
mkdir -p public/draco && cp node_modules/three/examples/jsm/libs/draco/gltf/* public/draco/
```

## Cómo está armado

**Todo vive en un archivo**: el cuerpo, las 214 prendas, un solo esqueleto y
la animación de reposo. Repartirlo por slot obligaría a cada archivo a traer
su propio esqueleto, y entonces la ropa se deformaría respecto del cuerpo.
Como las prendas que no se llevan puestas quedan invisibles, nunca llegan a
la tarjeta gráfica.

**El personaje respira**, no se queda en cruz: la animación `Idle01` del pack
se pega al esqueleto y la mueve un `AnimationMixer`. Tres trampas al
extraerla, las tres silenciosas:

- Desde Blender 4.4 las acciones van por ranuras: hay que elegir una
  (`animation_data.action_slot`) o la acción queda asignada pero inerte, ni
  se mueve ni se exporta.
- **No hay que poner el rig en `REST`** para exportar. Parece prudente —las
  matrices de enlace saldrían de la pose de descanso— pero el exportador
  muestrea la pose evaluada fotograma a fotograma: con el rig en reposo
  escribe los 192 canales con el mismo valor en todos. La animación sale,
  pesa, y no mueve nada.
- **glTF descarta la matriz de las mallas con esqueleto** (lo dice la
  especificación). Cada FBX del pack viene en su marco —el cuerpo a 0,01 y
  el vestuario a 1—, así que al juntarlos la prenda pierde justo la matriz
  que la ponía en su sitio y se desploma a los pies. Por eso `colgar_de`
  hornea la diferencia en los vértices y deja la prenda con la misma matriz
  que el cuerpo: así no hay nada que perder.

**Todas comparten un material**: una textura paleta de 2048×2048 donde cada
celda es un color. El filtro va en `NearestFilter` a propósito, porque si
interpola, los colores se mezclan en los bordes de cada celda.

**Y se dibuja a dos caras.** Las piezas del pack son láminas sin grosor: el
pelo, una manga o la copa de una gorra no tienen cara interior. Con el
descarte de caras traseras por defecto, mirarlas desde dentro no dibuja
nada y se ve el fondo a través. Cuesta algo de relleno, porque ya no se
descarta la mitad de los triángulos, pero es lo que hace que una gorra
parezca una gorra y no una cáscara.

**No hay catálogo de piezas.** La lista sale del propio GLB: cada nodo se
llama `Top_GamerCitizen_20`, igual que su icono, así que el modelo y su
imagen se enlazan solos.

**El icono decide qué entra.** El vestuario modular son 214 piezas y todas
tienen icono; las demás mallas pertenecen a Boy 01, Boy 02 y Girl 01, que son
modelos clásicos con atuendo fijo y no se combinan. Por eso el script sólo
exporta las que tienen icono, y el resultado da 214 exactas: Hair 53,
Headwear 18, Top 60, Bottom 40, Shoes 43.

**La polera y el pantalón no se pueden sacar.** La guía del pack dice que un
citizen nunca queda sin ropa: `Top_Basic` y `Bottom_Basic` son el atuendo de
partida y esos dos slots no ofrecen «Ninguno». Las dos piezas básicas viven
en `Wardrobe/Basic/BasicOutfit.fbx`, aparte de los citizens.

## Lo que se guarda

En Firestore, dentro del perfil del usuario: qué pieza lleva en cada slot,
más una foto de 128×128 sacada del propio lienzo al guardar. Esa foto es la
que se ve en la cabecera, para no cargar el 3D en toda la app.

## Los colores

8 tonos de piel y 15 de ropa, que salen del propio pack
(`herramientas/` los vuelca a `src/lib/paleta.ts`). Cambiar de color es
mover las UV de la pieza a otra celda de la paleta, conservando la altura
dentro de la celda, que es donde vive el sombreado (`src/lib/uv.ts`).

La celda que se reemplaza es la que más superficie ocupa en la malla, y
para medirla sólo cuentan los triángulos enteros dentro de una celda, para
no confundirse con los que cruzan de un color a otro.

El tono de piel se aplica a **todas** las piezas, no sólo al cuerpo, porque
las prendas incluyen brazos y cuello. Donde ambas coinciden manda la ropa.

## El calce

Las prendas se meten unas bajo otras como en el pack (`src/lib/calce.ts`):
a cada vértice de la prenda interior se le tira un rayo desde el cuerpo
hacia él, y si en el camino aparece la prenda exterior, el vértice se queda
justo por dentro. Así el pantalón entra en la polera y el pelo bajo el
gorro, sin cruzarse.

**El rayo va a dos caras**, y no es un detalle menor: sale de dentro del
cuerpo, así que lo primero que encuentra es la cara *interior* de la prenda,
que para el raycaster es una cara trasera. Mirando sólo las de frente ese
choque no existe, no se encontraba ninguno y el calce entero no hacía nada.

**Y se mete dos centímetros, no dos milímetros.** Con una bota alta, que va
pegada a la pierna, dos milímetros dejaban el pantalón justo sobre la caña y
asomaba a jirones. Los zapatos bajos no cambian, porque sólo se mueve lo que
el rayo encuentra tapado.

Lo que el calce no arregla son los pelos sueltos que nacen bajo el borde del
gorro y se curvan por delante: su rayo no llega a cruzar la tela, así que no
hay nada que corregir. Hundirlos por su propia normal tampoco sirve —una
mecha fina tiene normales opuestas en cada cara y sólo se aplasta sobre sí
misma—; haría falta recogerlos hacia el cuero cabelludo, y eso también
recogería el pelo que legítimamente asoma bajo el ala.

Buscar el punto del cuerpo del que nace cada vértice es lo caro, pero no
cambia nunca y se guarda. Los rayos van por BVH (`three-mesh-bvh`), porque
sin él cada uno recorrería miles de triángulos.

**A la piel se le quita lo que la ropa tapa** (`recortar`). Hace falta
porque piel y tela tienen pesos de esqueleto distintos: al animarse se
deforman cada una por su lado y la piel asoma por el hombro, por el muslo o
por la costura. Empujarla hacia dentro no sirve —hundirla lo justo para que
no asome un muslo le abre un cráter en la cintura, y hundirla poco la deja
asomando—, pero lo que no existe no puede atravesar nada.

Tapado es que el rayo encuentre tela en esa dirección, delante o detrás del
propio vértice: delante significa que la piel ya se está saliendo, detrás
que la tela la cubre. Las anclas no salen de otra malla sino de la propia
piel, metiendo cada vértice 5 cm hacia dentro por su normal
(`anclasDentro`). Un triángulo se va sólo si sus tres vértices están
tapados, así que el agujero queda siempre por dentro del borde de la prenda.

Los triángulos del borde, con algún vértice tapado y otro no, sobreviven a
propósito y se acomodan con el mismo calce de las prendas, pero de
milímetros: dos centímetros, que es lo que se usa entre prendas, le abrirían
ese cráter a la silueta.

Entre las dos pasadas son unos 25 ms al cambiar de prenda, y el cuerpo
vestido baja de 3.992 a unos 3.100 triángulos.

## Las reglas entre prendas

No hacen falta marcas en los datos, salvo una:

- Un vestido o un overol viene marcado `onePiece` en el pack, y entonces no
  lleva pantalón; al elegir uno, la polera vuelve a ser normal.
- Lo demás se deduce del tamaño de la prenda, igual que en el pack: un top
  que llega a la cabeza trae capucha y tapa el gorro, y uno que llega al
  suelo trae botas y tapa los zapatos.
