import bpy
import json
import os
from mathutils import Vector


WORKSPACE = r"E:\C_Projects\game"


def point_camera(camera, target):
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


scene = bpy.context.scene
original = {
    "camera": scene.camera,
    "engine": scene.render.engine,
    "filepath": scene.render.filepath,
    "resolution_x": scene.render.resolution_x,
    "resolution_y": scene.render.resolution_y,
    "resolution_percentage": scene.render.resolution_percentage,
    "file_format": scene.render.image_settings.file_format,
    "film_transparent": scene.render.film_transparent,
}

camera_data = bpy.data.cameras.new("TYX_Phase1_CloseReview_Data")
camera = bpy.data.objects.new("TYX_Phase1_CloseReview", camera_data)
scene.collection.objects.link(camera)
scene.camera = camera
scene.render.engine = "BLENDER_WORKBENCH"
scene.render.resolution_x = 960
scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "JPEG"
scene.render.image_settings.quality = 70
scene.render.film_transparent = False

reviews = [
    ("TYX_Phase1_Close_Top.jpg", "ORTHO", (-295.0, 8.0, 110.0), (-295.0, 8.0, -9.0), 92.0, 50.0),
    ("TYX_Phase1_Close_Oblique.jpg", "PERSP", (-342.0, -48.0, 28.0), (-286.0, 15.0, -7.5), 0.0, 52.0),
    ("TYX_Phase1_Close_Gameplay_A.jpg", "PERSP", (-304.0, -6.0, -6.75), (-295.0, 3.0, -8.6), 0.0, 46.0),
    ("TYX_Phase1_Close_Gameplay_B.jpg", "PERSP", (-292.0, 5.0, -7.55), (-303.0, -5.0, -8.6), 0.0, 46.0),
]

rendered = []
for filename, camera_type, location, target, ortho_scale, lens in reviews:
    camera_data.type = camera_type
    camera.location = location
    point_camera(camera, target)
    if camera_type == "ORTHO":
        camera_data.ortho_scale = ortho_scale
    else:
        camera_data.lens = lens
    path = os.path.join(WORKSPACE, filename)
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    rendered.append(path)

terrain = bpy.data.objects.get("211955d8.o")
terrain_was_hidden = terrain.hide_render if terrain else None
if terrain:
    terrain.hide_render = True
camera_data.type = "PERSP"
camera_data.lens = 46.0
camera.location = (-304.0, -6.0, -6.75)
point_camera(camera, (-295.0, 3.0, -8.6))
debug_path = os.path.join(WORKSPACE, "TYX_Phase1_Close_Gameplay_A_NoTerrain.jpg")
scene.render.filepath = debug_path
bpy.ops.render.render(write_still=True)
rendered.append(debug_path)
if terrain:
    terrain.hide_render = terrain_was_hidden

bpy.data.objects.remove(camera, do_unlink=True)
bpy.data.cameras.remove(camera_data)
scene.camera = original["camera"]
scene.render.engine = original["engine"]
scene.render.filepath = original["filepath"]
scene.render.resolution_x = original["resolution_x"]
scene.render.resolution_y = original["resolution_y"]
scene.render.resolution_percentage = original["resolution_percentage"]
scene.render.image_settings.file_format = original["file_format"]
scene.render.film_transparent = original["film_transparent"]

print(json.dumps({"rendered": rendered}))
