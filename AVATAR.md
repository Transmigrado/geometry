# El avatar en 3D

El selector corre en HTML con Three.js: una plataforma, el personaje y las
piezas de ropa que se eligen por slot. No hay motor de juego de por medio.

El contenido sale de **Cozy Citizens** (PixeliusVita), un pack de Unity. De
ahí se extraen el cuerpo y las 244 piezas a archivos GLB.

## Preparar los archivos

Son binarios que no se versionan. Para generarlos hace falta el pack y
Blender instalado:

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background \
  --python herramientas/extraer-avatar.py -- \
  "<ruta>/Assets/CozyKit2026/HumanModular" public/avatar/modelos
```

Eso deja `cuerpo.glb` y un GLB por slot. Después, a mano:

```bash
# la paleta de colores, que comparten todas las piezas
cp "<ruta>/PixeliusVita_Share/GP.png" public/avatar/modelos/paleta.png

# los iconos del vestuario, que ya vienen renderizados
mkdir -p public/avatar/iconos && cp "<ruta>/Wardrobe/Icons/"*.png public/avatar/iconos/

# el decodificador de Draco, para no depender de un CDN ajeno
mkdir -p public/draco && cp node_modules/three/examples/jsm/libs/draco/gltf/* public/draco/
```

## Cómo está armado

**Las piezas se exportan sin esqueleto**, en su pose de reposo. El personaje
está quieto en una plataforma, así que el rig no hace falta y su ausencia
quita de encima todo el riesgo de animación.

**Todas comparten un material**: una textura paleta de 2048×2048 donde cada
celda es un color. El filtro va en `NearestFilter` a propósito, porque si
interpola, los colores se mezclan en los bordes de cada celda.

**No hay catálogo de piezas.** La lista sale de los propios GLB: cada nodo se
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

## Pendiente

**Los colores.** El pack ofrece 8 tonos de piel y 15 colores de ropa, y los
aplica desplazando las UV de la pieza a otra celda de la misma paleta
(`SetColor` en `CitizenOutfit.cs`). Es replicable aquí: hay que encontrar la
celda dominante de la malla y moverla a la celda elegida, leyendo la lista de
celdas desde `Wardrobe/CitizenWardrobe.asset`.

**El calce entre piezas.** El pack deforma los vértices para meter la prenda
interior bajo la exterior: el pantalón dentro de la polera y los zapatos, el
pelo dentro de los gorros. Aquí no está replicado, así que alguna combinación
puede cruzarse.

**Las reglas de combinación**, que tampoco están: los gorros se ocultan con
un top con capucha, los atuendos con botas anulan el slot de zapatos, y los
overoles son conjunto completo.
