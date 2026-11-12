"""
Saca del pack de Unity el cuerpo y las piezas de ropa y las deja como GLB.

Sale un único avatar.glb con el cuerpo, las 214 piezas de ropa, un solo
esqueleto y la animación de reposo. Va todo junto a propósito: repartirlo en
varios archivos obliga a cada uno a traer su propio esqueleto, y entonces la
ropa se deforma respecto del cuerpo.
"""

import os
import sys

import bpy

ORIGEN, DESTINO = sys.argv[-2], sys.argv[-1]
SLOTS = ["Hair", "Headwear", "Top", "Bottom", "Shoes"]

# El vestuario modular son 214 piezas, y cada una tiene su icono. Las demás
# son de los tres modelos clásicos, que llevan un atuendo fijo y no se
# combinan: si no hay icono, la pieza no va.
ICONOS = os.path.join(ORIGEN, "Wardrobe", "Icons")

# la polera y el pantalón básicos viven aparte, y son los que evitan que un
# citizen quede sin ropa; sus mallas se llaman al revés: Basic_Top
BASICO = os.path.join(ORIGEN, "Wardrobe", "Basic", "BasicOutfit.fbx")

REPOSO = os.path.join(ORIGEN, "Animation", "Idle01.fbx")

def del_vestuario(nombre):
    return os.path.exists(os.path.join(ICONOS, f"{nombre}.png"))


def importar(archivo):
    """Trae un FBX y devuelve lo que entró: mallas y esqueleto."""
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.import_scene.fbx(filepath=archivo)
    entraron = list(bpy.context.selected_objects)
    return (
        [o for o in entraron if o.type == "MESH"],
        next((o for o in entraron if o.type == "ARMATURE"), None),
    )


def enganchadas(accion, esqueleto):
    """Cuántas curvas de la animación dan con un hueso de verdad."""
    huesos = set(esqueleto.data.bones.keys())
    return sum(
        1
        for curva in accion.fcurves
        for partes in [curva.data_path.split('"')]
        if len(partes) > 2 and partes[1] in huesos
    )


def colgar_de(malla, molde, esqueleto):
    """
    Pasa la malla al esqueleto común, dejándola en el mismo marco que el
    cuerpo (el molde). Cada FBX trae su armadura y su escala —el cuerpo a
    0,01 y el vestuario a 1—, y aunque en el mundo coinciden, glTF descarta
    la matriz de las mallas con esqueleto: se queda con la del cuerpo y le
    aplica esa a todas. Por eso la diferencia se hornea en los vértices, y
    así no hay matriz que perder. Los grupos de vértices van por nombre de
    hueso, y los nombres ya coinciden.
    """
    malla.data.transform(molde.matrix_world.inverted() @ malla.matrix_world)

    for modificador in list(malla.modifiers):
        if modificador.type == "ARMATURE":
            malla.modifiers.remove(modificador)

    malla.parent = esqueleto
    malla.matrix_parent_inverse = esqueleto.matrix_world.inverted()
    malla.matrix_basis = molde.matrix_world

    modificador = malla.modifiers.new("Esqueleto", "ARMATURE")
    modificador.object = esqueleto


def exportar(objetos, salida, con_animacion=False):
    bpy.ops.object.select_all(action="DESELECT")
    for objeto in objetos:
        objeto.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=salida,
        export_format="GLB",
        use_selection=True,
        export_draco_mesh_compression_enable=True,
        export_animations=con_animacion,
        export_skins=True,
        export_materials="NONE",
        export_yup=True,
    )


bpy.ops.wm.read_factory_settings(use_empty=True)

# 1. el esqueleto común sale del cuerpo base, que comparten los 63 citizens
cuerpos, rig = importar(os.path.join(ORIGEN, "H01_Base.fbx"))
for cuerpo in cuerpos:
    cuerpo.name = "Cuerpo"

# 2. la animación de reposo, que viene en su propio archivo
_, portador = importar(REPOSO)
if portador and portador.animation_data and portador.animation_data.action:
    reposo = portador.animation_data.action
    print("CURVAS enganchadas:", enganchadas(reposo, rig), "de", len(reposo.fcurves))
    rig.animation_data_create()
    rig.animation_data.action = reposo
    # desde Blender 4.4 las acciones van por ranuras, y sin elegir una la
    # acción queda asignada pero inerte: ni anima ni se exporta
    if hasattr(rig.animation_data, "action_slot") and reposo.slots:
        rig.animation_data.action_slot = reposo.slots[0]
    reposo.name = "Reposo"
    reposo.use_fake_user = True

    # la escena dura lo que dure la animación, que es lo que se exporta
    inicio, fin = reposo.frame_range
    bpy.context.scene.frame_start = int(inicio)
    bpy.context.scene.frame_end = int(fin)
if portador:
    bpy.data.objects.remove(portador, do_unlink=True)

# 3. las piezas, agrupadas por slot y colgadas del mismo esqueleto
carpeta = os.path.join(ORIGEN, "Model")
archivos = sorted(f for f in os.listdir(carpeta) if f.endswith(".fbx"))

vestuario = []

for slot in SLOTS:
    piezas = []
    extras = archivos + ([os.path.basename(BASICO)] if slot in ("Top", "Bottom") else [])

    for archivo in extras:
        esBasico = archivo == os.path.basename(BASICO)
        citizen = "Basic" if esBasico else archivo[:-4]
        mallas, suyo = importar(BASICO if esBasico else os.path.join(carpeta, archivo))

        for malla in mallas:
            # el nombre del icono es Top_GamerCitizen_20.png
            nombre = f"{slot}_{citizen}"
            es_suya = (
                malla.name.startswith(f"Basic_{slot}")
                if esBasico
                else malla.name.split("_")[-1] == slot
            )
            if not es_suya or not del_vestuario(nombre):
                bpy.data.objects.remove(malla, do_unlink=True)
                continue

            colgar_de(malla, cuerpos[0], rig)
            malla.name = nombre
            piezas.append(malla)

            # que la prenda siga enganchada al esqueleto no se nota hasta
            # verla puesta, así que conviene que se note aquí
            sueltos = [
                g.name
                for g in malla.vertex_groups
                if g.name not in rig.data.bones
            ]
            if sueltos:
                print("SUELTOS", nombre, len(sueltos), sueltos[:3])

        if suyo:
            bpy.data.objects.remove(suyo, do_unlink=True)

    vestuario += piezas
    print(f"LISTO {slot} {len(piezas)}")

# 4. todo junto: un archivo, un esqueleto, una animación
exportar(
    [rig] + cuerpos + vestuario,
    os.path.join(DESTINO, "avatar.glb"),
    con_animacion=True,
)
print("LISTO avatar", len(vestuario) + 1, "mallas")
