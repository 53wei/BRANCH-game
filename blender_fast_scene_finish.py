import bpy
import bmesh
import json
import math
import os
from collections import deque
from mathutils import Matrix, Vector


WORKSPACE = r"E:\C_Projects\game"
MASTER = os.path.join(WORKSPACE, "TingYuXuan_Master.blend")
CHECKPOINT = os.path.join(WORKSPACE, "TingYuXuan_Phase1_Positioned.blend")
FINAL_COLLECTION = "08_FAST_FINAL_ASSEMBLY"
TREE_SOURCE_NAMES = ("20b9b240.o", "20b95ba8.o")
ROCK_SOURCE_NAME = "20d86268.o"
PAVING_SOURCE_NAME = "20ecc1c0.o"
PAVING_COMPONENT_SEED = 1629


def world_bbox(obj):
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector(tuple(min(point[axis] for point in points) for axis in range(3)))
    maximum = Vector(tuple(max(point[axis] for point in points) for axis in range(3)))
    return minimum, maximum


def combined_center(objects):
    bounds = [world_bbox(obj) for obj in objects]
    minimum = Vector(tuple(min(bound[0][axis] for bound in bounds) for axis in range(3)))
    maximum = Vector(tuple(max(bound[1][axis] for bound in bounds) for axis in range(3)))
    return (minimum + maximum) * 0.5


def clear_previous_fast_assembly():
    collection = bpy.data.collections.get(FINAL_COLLECTION)
    if collection:
        for obj in list(collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(collection)
    collection = bpy.data.collections.new(FINAL_COLLECTION)
    bpy.context.scene.collection.children.link(collection)
    return collection


def component_vertices(mesh, seed):
    if seed < 0 or seed >= len(mesh.vertices):
        raise RuntimeError(f"Invalid component seed {seed} for {mesh.name}")
    adjacency = [[] for _ in mesh.vertices]
    for edge in mesh.edges:
        a, b = edge.vertices
        adjacency[a].append(b)
        adjacency[b].append(a)
    visited = {seed}
    queue = deque([seed])
    while queue:
        current = queue.popleft()
        for neighbor in adjacency[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return visited


def keep_only_vertices(obj, keep_indices):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    remove = [vertex for vertex in bm.verts if vertex.index not in keep_indices]
    bmesh.ops.delete(bm, geom=remove, context="VERTS")
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


def set_origin_to_geometry(obj):
    minimum, maximum = world_bbox(obj)
    center_world = (minimum + maximum) * 0.5
    old_matrix = obj.matrix_world.copy()
    center_local = old_matrix.inverted() @ center_world
    for vertex in obj.data.vertices:
        vertex.co -= center_local
    obj.matrix_world = old_matrix @ Matrix.Translation(center_local)
    obj.data.update()


def extract_paving_asset(collection):
    source = bpy.data.objects.get(PAVING_SOURCE_NAME)
    if source is None:
        raise RuntimeError(f"Missing paving source: {PAVING_SOURCE_NAME}")
    keep = component_vertices(source.data, PAVING_COMPONENT_SEED)
    asset = source.copy()
    asset.data = source.data.copy()
    asset.name = "CONN_SourcePavingTile"
    collection.objects.link(asset)
    asset.parent = None
    asset.matrix_world = source.matrix_world.copy()
    keep_only_vertices(asset, keep)
    set_origin_to_geometry(asset)
    asset.hide_viewport = True
    asset.hide_render = True
    return asset


def paving_piece(asset, collection, name, location, dimensions_xy, rotation_y=0.0):
    obj = asset.copy()
    obj.data = asset.data.copy()
    obj.name = name
    collection.objects.link(obj)
    obj.hide_viewport = False
    obj.hide_render = False
    obj.parent = None
    obj.rotation_mode = "XYZ"
    obj.rotation_euler = (0.0, rotation_y, 0.0)
    current = obj.dimensions.copy()
    if current.x > 0.0001:
        obj.scale.x *= dimensions_xy[0] / current.x
    if current.y > 0.0001:
        obj.scale.y *= dimensions_xy[1] / current.y
    obj.location = location
    obj["TYX_source_asset"] = PAVING_SOURCE_NAME
    return obj


def move_route_vegetation(collection):
    source_names = ("20bea480.o", "20bef4a0.o", "20b60158.o")
    region_min = Vector((-300.8, -4.2, -10.8))
    region_max = Vector((-293.0, 4.8, 5.5))
    relocation = Vector((-10.0, 13.0, 0.0))
    moved = []
    for source_name in source_names:
        source = bpy.data.objects.get(source_name)
        if source is None or source.get("TYX_route_components_moved"):
            continue
        mesh = source.data
        matrix = source.matrix_world
        adjacency = [[] for _ in mesh.vertices]
        for edge in mesh.edges:
            a, b = edge.vertices
            adjacency[a].append(b)
            adjacency[b].append(a)
        visited = set()
        selected = set()
        for seed in range(len(mesh.vertices)):
            if seed in visited:
                continue
            component = set()
            queue = deque([seed])
            visited.add(seed)
            while queue:
                current = queue.popleft()
                component.add(current)
                for neighbor in adjacency[current]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            points = [matrix @ mesh.vertices[index].co for index in component]
            minimum = Vector(tuple(min(point[axis] for point in points) for axis in range(3)))
            maximum = Vector(tuple(max(point[axis] for point in points) for axis in range(3)))
            center = (minimum + maximum) * 0.5
            dimensions = maximum - minimum
            in_route = all(region_min[axis] <= center[axis] <= region_max[axis] for axis in range(3))
            if in_route and dimensions.z > 0.75:
                selected.update(component)
        if not selected:
            continue
        relocated = source.copy()
        relocated.data = source.data.copy()
        relocated.name = f"CONN_Relocated_{source_name}"
        collection.objects.link(relocated)
        relocated.parent = None
        relocated.matrix_world = source.matrix_world.copy()
        keep_only_vertices(relocated, selected)
        relocated.matrix_world.translation += relocation

        bm = bmesh.new()
        bm.from_mesh(source.data)
        bm.verts.ensure_lookup_table()
        remove = [vertex for vertex in bm.verts if vertex.index in selected]
        bmesh.ops.delete(bm, geom=remove, context="VERTS")
        bm.to_mesh(source.data)
        bm.free()
        source.data.update()
        source["TYX_route_components_moved"] = True
        moved.append(relocated.name)
    return moved


def duplicate_group(sources, collection, target, angle, scale, prefix):
    center = combined_center(sources)
    transform = (
        Matrix.Translation(Vector(target))
        @ Matrix.Rotation(angle, 4, "Z")
        @ Matrix.Diagonal((scale, scale, scale, 1.0))
        @ Matrix.Translation(-center)
    )
    created = []
    for index, source in enumerate(sources):
        obj = source.copy()
        obj.data = source.data
        obj.name = f"{prefix}_{index:02d}"
        collection.objects.link(obj)
        obj.parent = None
        obj.matrix_world = transform @ source.matrix_world
        created.append(obj)
    return created


def add_tree_ring(collection):
    sources = [bpy.data.objects.get(name) for name in TREE_SOURCE_NAMES]
    sources = [source for source in sources if source is not None]
    if len(sources) != len(TREE_SOURCE_NAMES):
        raise RuntimeError("Tree source group is incomplete")
    targets = [
        (-350, -38, -10.2), (-310, -40, -10.2), (-270, -39, -10.2), (-230, -36, -10.2), (-190, -28, -10.2),
        (-168, 2, -10.2), (-162, 35, -10.2), (-160, 70, -10.2), (-165, 105, -10.2), (-182, 135, -10.2),
        (-215, 143, -10.2), (-250, 147, -10.2), (-285, 144, -10.2), (-320, 137, -10.2), (-350, 120, -10.2),
        (-372, 95, -10.2), (-378, 62, -10.2), (-376, 30, -10.2), (-370, 2, -10.2), (-365, -24, -10.2),
    ]
    created = []
    for index, target in enumerate(targets):
        angle = math.radians((index * 47) % 360)
        scale = 0.88 + (index % 5) * 0.07
        created.extend(duplicate_group(sources, collection, target, angle, scale, f"TREE_RING_{index:02d}"))
    return created


def add_rock_hills(collection):
    source = bpy.data.objects.get(ROCK_SOURCE_NAME)
    if source is None:
        raise RuntimeError(f"Missing rock source: {ROCK_SOURCE_NAME}")
    targets = [
        ((-382, -28, -12.0), 3.4, 1.8),
        ((-300, -53, -12.0), 3.8, 2.1),
        ((-205, -42, -12.0), 3.2, 1.9),
        ((-145, 62, -12.0), 4.0, 2.4),
        ((-215, 157, -12.0), 3.6, 2.2),
        ((-305, 158, -12.0), 4.2, 2.5),
        ((-397, 72, -12.0), 3.8, 2.2),
    ]
    created = []
    source_center = combined_center([source])
    for index, (target, xy_scale, z_scale) in enumerate(targets):
        obj = source.copy()
        obj.data = source.data
        obj.name = f"ROCK_HILL_{index:02d}"
        collection.objects.link(obj)
        obj.parent = None
        transform = (
            Matrix.Translation(Vector(target))
            @ Matrix.Rotation(math.radians(index * 41), 4, "Z")
            @ Matrix.Diagonal((xy_scale, xy_scale * (0.82 + (index % 2) * 0.12), z_scale, 1.0))
            @ Matrix.Translation(-source_center)
        )
        obj.matrix_world = transform @ source.matrix_world
        created.append(obj)
    return created


def point_camera(camera, target):
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


def render_reviews():
    scene = bpy.context.scene
    original = {
        "camera": scene.camera,
        "engine": scene.render.engine,
        "filepath": scene.render.filepath,
        "x": scene.render.resolution_x,
        "y": scene.render.resolution_y,
        "pct": scene.render.resolution_percentage,
        "format": scene.render.image_settings.file_format,
    }
    data = bpy.data.cameras.new("TYX_FastFinal_Review_Data")
    camera = bpy.data.objects.new("TYX_FastFinal_Review", data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 75

    data.type = "ORTHO"
    data.ortho_scale = 215.0
    camera.location = (-270.0, 53.0, 230.0)
    camera.rotation_euler = (0.0, 0.0, 0.0)
    top = os.path.join(WORKSPACE, "TYX_FastFinal_Top.jpg")
    scene.render.filepath = top
    bpy.ops.render.render(write_still=True)

    data.type = "PERSP"
    data.lens = 52.0
    camera.location = (-425.0, -105.0, 105.0)
    point_camera(camera, (-270.0, 45.0, -6.0))
    aerial = os.path.join(WORKSPACE, "TYX_FastFinal_Aerial.jpg")
    scene.render.filepath = aerial
    bpy.ops.render.render(write_still=True)

    data.lens = 44.0
    camera.location = (-309.0, -4.7, -7.55)
    point_camera(camera, (-294.0, 5.2, -9.0))
    connection = os.path.join(WORKSPACE, "TYX_FastFinal_Connection.jpg")
    scene.render.filepath = connection
    bpy.ops.render.render(write_still=True)

    bpy.data.objects.remove(camera, do_unlink=True)
    bpy.data.cameras.remove(data)
    scene.camera = original["camera"]
    scene.render.engine = original["engine"]
    scene.render.filepath = original["filepath"]
    scene.render.resolution_x = original["x"]
    scene.render.resolution_y = original["y"]
    scene.render.resolution_percentage = original["pct"]
    scene.render.image_settings.file_format = original["format"]
    return [top, aerial, connection]


if not os.path.exists(CHECKPOINT):
    bpy.ops.wm.save_as_mainfile(filepath=CHECKPOINT, copy=True)

collection = clear_previous_fast_assembly()
asset = extract_paving_asset(collection)
ramp = paving_piece(
    asset,
    collection,
    "CONN_ExistingPaving_Ramp",
    (-300.75, -4.65, -9.8275),
    (2.9, 2.7),
    math.atan2(0.701, 2.9),
)
court = paving_piece(
    asset,
    collection,
    "CONN_ExistingPaving_SmallCourt",
    (-297.75, -2.55, -10.178),
    (4.6, 4.8),
)
walk = paving_piece(
    asset,
    collection,
    "CONN_ExistingPaving_TurnWalk",
    (-296.65, 2.55, -10.178),
    (2.9, 5.7),
)
moved_route_assets = move_route_vegetation(collection)
trees = add_tree_ring(collection)
rocks = add_rock_hills(collection)
bpy.context.scene["TYX_phase"] = "fast_final_assembly"
bpy.context.scene["TYX_connection_route"] = "A_existing_gate_to_B_side_opening_y5_6"
bpy.context.view_layer.update()
renders = render_reviews()
bpy.ops.wm.save_as_mainfile(filepath=MASTER)

print(
    json.dumps(
        {
            "saved": MASTER,
            "checkpoint": CHECKPOINT,
            "connection_objects": [ramp.name, court.name, walk.name],
            "relocated_route_assets": moved_route_assets,
            "tree_objects_added": len(trees),
            "rock_hills_added": len(rocks),
            "renders": renders,
        },
        ensure_ascii=False,
    )
)
