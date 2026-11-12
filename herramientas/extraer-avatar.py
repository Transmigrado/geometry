"""
Saca del pack de Unity el cuerpo y las piezas de ropa, y las deja como GLB
estáticos: uno por slot, con cada pieza adentro nombrada igual que su icono.
"""

import os
import sys

import bpy

ORIGEN, DESTINO = sys.argv[-2], sys.argv[-1]
SLOTS = ["Hair", "Headwear", "Top", "Bottom", "Shoes"]


def limpiar():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def soltar(malla):
    """Deja la malla suelta, sin esqueleto ni padre, en su pose de reposo."""
    for modificador in list(malla.modifiers):
        if modificador.type == "ARMATURE":
            malla.modifiers.remove(modificador)

    bpy.ops.object.select_all(action="DESELECT")
    malla.select_set(True)
    bpy.context.view_layer.objects.active = malla
    if malla.parent:
        bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)


def exportar(objetos, salida):
    bpy.ops.object.select_all(action="DESELECT")
    for objeto in objetos:
        objeto.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=salida,
        export_format="GLB",
        use_selection=True,
        export_draco_mesh_compression_enable=True,
        export_animations=False,
        export_skins=False,
        export_materials="NONE",
    )


# 1. el cuerpo, que es el mismo para todos
limpiar()
bpy.ops.import_scene.fbx(filepath=os.path.join(ORIGEN, "H01_Base.fbx"))
cuerpos = [o for o in bpy.data.objects if o.type == "MESH"]
for cuerpo in cuerpos:
    soltar(cuerpo)
    cuerpo.name = "Cuerpo"
exportar(cuerpos, os.path.join(DESTINO, "cuerpo.glb"))
print("LISTO cuerpo")

# 2. las piezas, agrupadas por slot
carpeta = os.path.join(ORIGEN, "Model")
archivos = sorted(f for f in os.listdir(carpeta) if f.endswith(".fbx"))

for slot in SLOTS:
    limpiar()
    piezas = []

    for archivo in archivos:
        citizen = archivo[:-4]
        bpy.ops.import_scene.fbx(filepath=os.path.join(carpeta, archivo))

        recien = [o for o in bpy.context.selected_objects if o.type == "MESH"]
        for malla in recien:
            # las mallas vienen como LC20_Top, LC20_Hair, LC20_Body...
            if not malla.name.split("_")[-1] == slot:
                bpy.data.objects.remove(malla, do_unlink=True)
                continue
            soltar(malla)
            # el nombre del icono es Top_GamerCitizen_20.png
            malla.name = f"{slot}_{citizen}"
            piezas.append(malla)

        for sobra in list(bpy.data.objects):
            if sobra.type != "MESH" and sobra not in piezas:
                bpy.data.objects.remove(sobra, do_unlink=True)

    if piezas:
        exportar(piezas, os.path.join(DESTINO, f"{slot.lower()}.glb"))
    print(f"LISTO {slot} {len(piezas)}")
