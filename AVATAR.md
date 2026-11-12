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
imagen se enlazan solos. De las 244 piezas, 32 no traen icono en el pack: esas
se muestran por su nombre.

## Lo que se guarda

En Firestore, dentro del perfil del usuario: qué pieza lleva en cada slot,
más una foto de 128×128 sacada del propio lienzo al guardar. Esa foto es la
que se ve en la cabecera, para no cargar el 3D en toda la app.

## Pendiente

El pack trae un ajuste que deforma los vértices de una prenda para que calce
en cuerpos distintos. Aquí no está replicado, porque todas las piezas usan el
mismo cuerpo base. Si alguna combinación se cruza, el cambio de color por
paleta también está sin hacer: en el pack es un desplazamiento de las UV
sobre esa misma textura.
