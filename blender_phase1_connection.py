import bpy
import json
import math
import os
from mathutils import Vector


WORKSPACE = r"E:\C_Projects\game"
MASTER = os.path.join(WORKSPACE, "TingYuXuan_Master.blend")
CHECKPOINT = os.path.join(WORKSPACE, "TingYuXuan_Phase0_PreConnection.blend")
TOP_RENDER = os.path.join(WORKSPACE, "TYX_Phase1_Connection_Top.png")
GAMEPLAY_RENDER = os.path.join(WORKSPACE, "TYX_Phase1_Connection_Gameplay.png")
B_ROOT_NAME = "B_CoreGarden_Primary"
B_DELTA = Vector((-12.0, -16.0, 0.0))
TREE_NAMES = ("20b9b240.o", "20b95ba8.o")
TREE_DELTA = Vector((-9.0, 7.0, 0.0))


def descendants(root):
    return {root, *root.children_recursive}


def world_bbox(obj):
    corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector(tuple(min(p[i] for p in corners) for i in range(3)))
    maximum = Vector(tuple(max(p[i] for p in corners) for i in range(3)))
    return minimum, maximum


def visible_subject_meshes():
    result = []
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or obj.hide_render or not obj.visible_get():
            continue
        if any(collection.hide_render for collection in obj.users_collection):
            continue
        result.append(obj)
    return result


def combined_bbox(objects):
    bounds = [world_bbox(obj) for obj in objects]
    minimum = Vector(tuple(min(pair[0][i] for pair in bounds) for i in range(3)))
    maximum = Vector(tuple(max(pair[1][i] for pair in bounds) for i in range(3)))
    return minimum, maximum


def ensure_checkpoint():
    if not os.path.exists(CHECKPOINT):
        bpy.ops.wm.save_as_mainfile(filepath=CHECKPOINT, copy=True)


def hide_superseded_additions():
    for name in ("04_ASSEMBLED_BOUNDARY", "07_TRANSITION_PLANTING"):
        collection = bpy.data.collections.get(name)
        if collection:
            collection.hide_viewport = True
            collection.hide_render = True


def move_b_root():
    root = bpy.data.objects.get(B_ROOT_NAME)
    if root is None:
        raise RuntimeError(f"Required root not found: {B_ROOT_NAME}")
    key = "TYX_phase1_origin_location"
    if key not in root:
        root[key] = list(root.location)
    target = Vector(root[key]) + B_DELTA
    root.location = target
    root["TYX_phase1_delta"] = list(B_DELTA)
    return root


def relocate_blocking_tree_group():
    moved = []
    missing = []
    for name in TREE_NAMES:
        obj = bpy.data.objects.get(name)
        if obj is None:
            missing.append(name)
            continue
        key = "TYX_phase1_origin_world_translation"
        if key not in obj:
            obj[key] = list(obj.matrix_world.translation)
        matrix = obj.matrix_world.copy()
        matrix.translation = Vector(obj[key]) + TREE_DELTA
        obj.matrix_world = matrix
        obj["TYX_phase1_delta"] = list(TREE_DELTA)
        moved.append(name)
    return moved, missing


def connection_obstacle_audit(b_root):
    b_members = descendants(b_root)
    region_min = Vector((-309.0, -9.0, -10.8))
    region_max = Vector((-291.0, 7.0, -4.8))
    records = []
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or obj in b_members or obj.hide_render:
            continue
        minimum, maximum = world_bbox(obj)
        intersects = all(maximum[i] >= region_min[i] and minimum[i] <= region_max[i] for i in range(3))
        if intersects:
            records.append(
                {
                    "name": obj.name,
                    "min": [round(v, 3) for v in minimum],
                    "max": [round(v, 3) for v in maximum],
                    "materials": [slot.material.name for slot in obj.material_slots if slot.material][:6],
                }
            )
    records.sort(key=lambda row: row["name"])
    return records


def point_camera(camera, target):
    direction = Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_reviews():
    scene = bpy.context.scene
    original = {
        "camera": scene.camera,
        "engine": scene.render.engine,
        "filepath": scene.render.filepath,
        "resolution_x": scene.render.resolution_x,
        "resolution_y": scene.render.resolution_y,
        "resolution_percentage": scene.render.resolution_percentage,
        "film_transparent": scene.render.film_transparent,
    }
    camera_data = bpy.data.cameras.new("TYX_Phase1_Review_Camera_Data")
    camera = bpy.data.objects.new("TYX_Phase1_Review_Camera", camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False

    subjects = visible_subject_meshes()
    minimum, maximum = combined_bbox(subjects)
    center = (minimum + maximum) * 0.5
    width = maximum.x - minimum.x
    depth = maximum.y - minimum.y

    camera_data.type = "ORTHO"
    camera_data.ortho_scale = max(depth * 1.1, width / 1.5 * 1.1)
    camera.location = (center.x, center.y, maximum.z + max(width, depth) * 1.1)
    camera.rotation_euler = (0.0, 0.0, 0.0)
    scene.render.filepath = TOP_RENDER
    bpy.ops.render.render(write_still=True)

    camera_data.type = "PERSP"
    camera_data.lens = 42.0
    camera.location = (-311.0, -13.0, -7.15)
    point_camera(camera, (-295.0, 3.0, -8.85))
    scene.render.filepath = GAMEPLAY_RENDER
    bpy.ops.render.render(write_still=True)

    bpy.data.objects.remove(camera, do_unlink=True)
    bpy.data.cameras.remove(camera_data)
    scene.camera = original["camera"]
    scene.render.engine = original["engine"]
    scene.render.filepath = original["filepath"]
    scene.render.resolution_x = original["resolution_x"]
    scene.render.resolution_y = original["resolution_y"]
    scene.render.resolution_percentage = original["resolution_percentage"]
    scene.render.film_transparent = original["film_transparent"]


ensure_checkpoint()
hide_superseded_additions()
b_root = move_b_root()
moved_trees, missing_trees = relocate_blocking_tree_group()
bpy.context.view_layer.update()
obstacles = connection_obstacle_audit(b_root)
render_reviews()
bpy.context.scene["TYX_phase"] = "phase1_connection_positioned"
bpy.context.scene["TYX_phase1_b_delta"] = list(B_DELTA)
bpy.context.scene["TYX_phase1_tree_delta"] = list(TREE_DELTA)
bpy.ops.wm.save_as_mainfile(filepath=MASTER)

print(
    json.dumps(
        {
            "saved": MASTER,
            "checkpoint": CHECKPOINT,
            "b_root_location": [round(v, 3) for v in b_root.location],
            "moved_trees": moved_trees,
            "missing_trees": missing_trees,
            "connection_obstacles": obstacles,
            "renders": [TOP_RENDER, GAMEPLAY_RENDER],
        },
        ensure_ascii=False,
    )
)
