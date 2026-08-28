import bpy
import math
import os
import sys
import traceback

PROJECT_ROOT = os.path.abspath(sys.argv[sys.argv.index("--") + 1])
SOURCE_ROOT = os.path.join(PROJECT_ROOT, "assets-source", "cc0-auto", "quaternius-stylized-nature-megakit")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "assets-source", "blender-working", "runtime-raw", "TYX_NAT_Quaternius_Set_A.glb")
MODELS = [
    ("bush-a.glb", "Quaternius_Bush_A"),
    ("bush-flowers-a.glb", "Quaternius_Bush_Flowers_A"),
    ("plant-big-a.glb", "Quaternius_Plant_Big_A"),
    ("tree-a.glb", "Quaternius_Tree_A"),
    ("tree-b.glb", "Quaternius_Tree_B"),
    ("grass-a.glb", "Quaternius_Grass_A"),
    ("fern-a.glb", "Quaternius_Fern_A"),
    ("rock-a.glb", "Quaternius_Rock_A"),
    ("rock-b.glb", "Quaternius_Rock_B"),
    ("rock-c.glb", "Quaternius_Rock_C"),
]


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.cameras, bpy.data.lights):
        for item in list(collection):
            if item.users == 0:
                collection.remove(item)


def image_size(value):
    if value <= 4:
        return 4
    return min(1024, 2 ** round(math.log(value, 2)))


def normalize_images():
    for image in bpy.data.images:
        width, height = image.size
        if width <= 0 or height <= 0:
            continue
        target_width = image_size(width)
        target_height = image_size(height)
        if width != target_width or height != target_height:
            print(f"Scaling {image.name}: {width}x{height} -> {target_width}x{target_height}")
            image.scale(target_width, target_height)


def main():
    reset_scene()
    library = bpy.data.objects.new("TYX_NAT_Quaternius_Set_A", None)
    bpy.context.scene.collection.objects.link(library)
    for filename, node_name in MODELS:
        source = os.path.join(SOURCE_ROOT, filename)
        if not os.path.exists(source):
            raise RuntimeError("Missing Quaternius source model: " + source)
        before = set(bpy.context.scene.objects)
        bpy.ops.import_scene.gltf(filepath=source)
        imported = [obj for obj in bpy.context.scene.objects if obj not in before and obj != library]
        root = bpy.data.objects.new(node_name, None)
        bpy.context.scene.collection.objects.link(root)
        root.parent = library
        for obj in imported:
            if obj.parent is None:
                obj.parent = root
        for obj in imported:
            if obj.type in {"CAMERA", "LIGHT"}:
                bpy.data.objects.remove(obj, do_unlink=True)
    normalize_images()
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    bpy.context.view_layer.objects.active = library
    library.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_PATH,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_yup=True,
        export_copyright="Quaternius Stylized Nature MegaKit, CC0 1.0; see docs/assets/cc0-nature.json",
    )
    print("Generated " + OUTPUT_PATH)


try:
    main()
except Exception:
    traceback.print_exc()
    sys.exit(1)
