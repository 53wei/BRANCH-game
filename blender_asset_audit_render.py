import bpy
import math
from mathutils import Vector


OUTPUT_DIR = r"E:\C_Projects\game"


def descendants(root):
    return [root, *list(root.children_recursive)]


def set_only_visible(objects):
    visible = {obj.name for obj in objects}
    for obj in bpy.context.scene.objects:
        obj.hide_render = obj.name not in visible and obj.type not in {"CAMERA", "LIGHT"}


scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1500
scene.render.resolution_y = 1000
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"

world = scene.world or bpy.data.worlds.new("AuditWorld")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.045, 0.055, 0.065, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.55

camera_data = bpy.data.cameras.new("AuditCameraData")
camera = bpy.data.objects.new("AuditCamera", camera_data)
scene.collection.objects.link(camera)
scene.camera = camera
camera.data.type = "ORTHO"

sun_data = bpy.data.lights.new("AuditSunData", "SUN")
sun = bpy.data.objects.new("AuditSun", sun_data)
scene.collection.objects.link(sun)
sun.rotation_euler = (math.radians(28), math.radians(-22), math.radians(-35))
sun.data.energy = 2.2

fill_data = bpy.data.lights.new("AuditFillData", "AREA")
fill = bpy.data.objects.new("AuditFill", fill_data)
scene.collection.objects.link(fill)
fill.location = (-250, 70, 160)
fill.data.energy = 2000
fill.data.size = 180


def top_render(path, center, scale, objects):
    set_only_visible(objects)
    camera.location = (center[0], center[1], 300)
    camera.rotation_euler = (0, 0, 0)
    camera.data.ortho_scale = scale
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


pivot = bpy.data.objects["Pivot"]
garden_b = bpy.data.objects["Sketchfab_model.003"]

top_render(
    OUTPUT_DIR + r"\AUDIT_ModelA_Full_Top.png",
    (-181.24, 173.48),
    540,
    descendants(pivot),
)
top_render(
    OUTPUT_DIR + r"\AUDIT_ModelA_Core_Top.png",
    (-352.56, 1.0),
    175,
    descendants(pivot),
)
top_render(
    OUTPUT_DIR + r"\AUDIT_ModelB_Top.png",
    (-121.0, 83.75),
    195,
    descendants(garden_b),
)

wall_names = {
    "214fd810.o",
    "1d63e338.o",
    "20b4d8a8.o",
    "1d767260.o",
    "1d7625c0.o",
    "1d757588.o",
    "214b9790.o",
    "214b32a0.o",
    "214afe40.o",
}
wall_objects = [bpy.data.objects[name] for name in wall_names if name in bpy.data.objects]
top_render(
    OUTPUT_DIR + r"\AUDIT_ModelA_WallCandidates_Top.png",
    (-352.56, 1.0),
    175,
    wall_objects,
)

flat_names = {
    "20ecc1c0.o",
    "20c3f3b8.o",
    "20c482d8.o",
    "20ba30d8.o",
    "20d0bbf0.o",
    "20c3bc28.o",
    "20d1d4d0.o",
    "20ba6558.o",
    "20aac010.o",
}
flat_objects = [bpy.data.objects[name] for name in flat_names if name in bpy.data.objects]
top_render(
    OUTPUT_DIR + r"\AUDIT_ModelA_FlatCandidates_Top.png",
    (-352.56, 1.0),
    175,
    flat_objects,
)

print("TYX_AUDIT_RENDER_COMPLETE")
