import json
import math
import os
import sys
import time
import traceback

import bpy
from mathutils import Vector


def project_argument():
    if "--" not in sys.argv:
        raise RuntimeError("Project root argument is required after --")
    return os.path.abspath(sys.argv[sys.argv.index("--") + 1])


PROJECT_ROOT = project_argument()
SOURCE_ROOT = os.path.join(PROJECT_ROOT, "assets-source", "manual-downloads")
WORKING_ROOT = os.path.join(PROJECT_ROOT, "assets-source", "blender-working")
RAW_ROOT = os.path.join(WORKING_ROOT, "runtime-raw")
REPORT_PATH = os.path.join(WORKING_ROOT, "blender-processing-report.json")
os.makedirs(RAW_ROOT, exist_ok=True)


SOURCES = {
    "house": os.path.join(SOURCE_ROOT, "ancient-chinese-courtyard-house", "ancient_chinese_courtyard_house.glb"),
    "park": os.path.join(SOURCE_ROOT, "ancient-chinese-courtyard-park", "ancient_chinese_courtyard_park.glb"),
    "pavilion": os.path.join(SOURCE_ROOT, "chinese-pavilion-memoriam", "chinese_pavilion_memoriam.glb"),
    "pavilion_b": os.path.join(SOURCE_ROOT, "chinese-pavilion", "chinese_pavilion.glb"),
    "bridge": os.path.join(SOURCE_ROOT, "low-bridge", "low_bridge.glb"),
    "siheyuan": os.path.join(SOURCE_ROOT, "traditional-chinese-siheyuan-courtyard", "traditional_chinese_siheyuan_courtyard.glb"),
}

REPORT = {"blender": bpy.app.version_string, "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "outputs": []}


def reset_scene(purge=True):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)
    if purge:
        for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.cameras, bpy.data.lights, bpy.data.materials, bpy.data.images):
            for datablock in list(datablocks):
                datablocks.remove(datablock)


def import_glb(file_path):
    if not os.path.isfile(file_path):
        raise RuntimeError("Missing source: " + file_path)
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=file_path)
    return [obj for obj in bpy.data.objects if obj not in before]


def mesh_objects(objects):
    return [obj for obj in objects if obj.type == "MESH" and not obj.hide_get()]


def world_bounds(objects):
    points = []
    for obj in mesh_objects(objects):
        points.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    if not points:
        return Vector((0, 0, 0)), Vector((1, 1, 1))
    return (
        Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points))),
        Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points))),
    )


def create_root(name, objects):
    root = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(root)
    object_set = set(objects)
    for obj in objects:
        if obj.parent not in object_set:
            matrix = obj.matrix_world.copy()
            obj.parent = root
            obj.matrix_world = matrix
    return root


def normalize_root(root, objects, target_width=None):
    minimum, maximum = world_bounds(objects)
    horizontal = max(maximum.x - minimum.x, maximum.y - minimum.y)
    scale = target_width / horizontal if target_width and horizontal > 0 else 1.0
    root.scale = (scale, scale, scale)
    bpy.context.view_layer.update()
    minimum, maximum = world_bounds(objects)
    root.location += Vector((-(minimum.x + maximum.x) / 2, -(minimum.y + maximum.y) / 2, -minimum.z))
    bpy.context.view_layer.update()
    return scale


def select_hierarchy(root):
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for child in root.children_recursive:
        child.select_set(True)
    bpy.context.view_layer.objects.active = root


def export_root(root, file_name, source, notes):
    select_hierarchy(root)
    output_path = os.path.join(RAW_ROOT, file_name)
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_copyright="Derived for 游园惊梦; see docs/assets/license-ledger.md",
    )
    minimum, maximum = world_bounds([root] + list(root.children_recursive))
    REPORT["outputs"].append({
        "file": file_name,
        "source": source,
        "objects": len(root.children_recursive),
        "boundsBlenderZUp": {
            "min": [round(value, 4) for value in minimum],
            "max": [round(value, 4) for value in maximum],
        },
        "notes": notes,
    })


def remove_matching(objects, tokens):
    for obj in list(objects):
        lowered = obj.name.lower()
        if any(token in lowered for token in tokens):
            bpy.data.objects.remove(obj, do_unlink=True)


def material(name, color, roughness=0.7, metallic=0.0):
    existing = bpy.data.materials.get(name)
    if existing:
        return existing
    result = bpy.data.materials.new(name)
    result.diffuse_color = (*color, 1.0)
    result.use_nodes = True
    principled = result.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = (*color, 1.0)
    principled.inputs["Roughness"].default_value = roughness
    principled.inputs["Metallic"].default_value = metallic
    return result


def source_material(tokens, fallback_name, color, roughness=0.7):
    for candidate in bpy.data.materials:
        lowered = candidate.name.lower()
        if any(token.lower() in lowered for token in tokens):
            return candidate
    return material(fallback_name, color, roughness)


def link_to_parent(obj, parent):
    obj.parent = parent
    return obj


def add_box(name, dimensions, location, mat, parent, bevel=0.025, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        modifier = obj.modifiers.new("EdgeSoftening", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
    obj.data.materials.append(mat)
    return link_to_parent(obj, parent)


def add_cylinder(name, radius, depth, location, mat, parent, vertices=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return link_to_parent(obj, parent)


def add_module_root(name, library):
    root = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(root)
    root.parent = library
    return root


def roof_pair(prefix, width, length, height, z, mat, parent):
    angle = math.radians(17)
    panel_width = width * 0.58
    offset = width * 0.23
    add_box(prefix + "_Roof_L", (panel_width, length + 0.5, 0.16), (-offset, 0, z), mat, parent, 0.035, (0, angle, 0))
    add_box(prefix + "_Roof_R", (panel_width, length + 0.5, 0.16), (offset, 0, z), mat, parent, 0.035, (0, -angle, 0))
    add_box(prefix + "_Ridge", (0.15, length + 0.62, 0.18), (0, 0, z + height), mat, parent, 0.025)


def corridor(name, length, wall_mat, wood_mat, roof_mat, library):
    root = add_module_root(name, library)
    add_box(name + "_Floor", (3.2, length, 0.16), (0, 0, 0.08), wall_mat, root, 0.015)
    for x in (-1.42, 1.42):
        for y in (-length / 2 + 0.18, length / 2 - 0.18):
            add_cylinder(name + "_Pillar", 0.12, 2.8, (x, y, 1.55), wood_mat, root)
    add_box(name + "_Beam_L", (0.18, length, 0.18), (-1.42, 0, 2.85), wood_mat, root)
    add_box(name + "_Beam_R", (0.18, length, 0.18), (1.42, 0, 2.85), wood_mat, root)
    roof_pair(name, 3.7, length, 0.08, 3.1, roof_mat, root)
    return root


def build_fallback_kit():
    reset_scene()
    # Project-authored geometry is retained only as an explicit greybox/loading
    # fallback. It no longer imports, deletes, or claims derivation from the
    # Traditional Chinese Siheyuan source model.
    wall_mat = material("TYX_FALLBACK_Plaster", (0.42, 0.42, 0.39), 0.95)
    wood_mat = material("TYX_FALLBACK_Wood", (0.12, 0.07, 0.045), 0.9)
    roof_mat = material("TYX_FALLBACK_Roof", (0.08, 0.1, 0.095), 0.94)
    library = bpy.data.objects.new("TYX_ARCH_Greybox_Fallback_A", None)
    bpy.context.scene.collection.objects.link(library)

    corridor("Corridor_Straight_4m", 4.0, wall_mat, wood_mat, roof_mat, library)
    corridor("Corridor_Straight_8m", 8.0, wall_mat, wood_mat, roof_mat, library)

    corner = add_module_root("Corridor_Corner", library)
    add_box("Corridor_Corner_Floor_A", (3.2, 4.0, 0.16), (0, -0.4, 0.08), wall_mat, corner, 0.015)
    add_box("Corridor_Corner_Floor_B", (4.0, 3.2, 0.16), (0.4, 0, 0.08), wall_mat, corner, 0.015)
    for x, y in ((-1.42, -1.8), (1.42, -1.8), (-1.42, 1.42), (1.8, 1.42)):
        add_cylinder("Corridor_Corner_Pillar", 0.12, 2.8, (x, y, 1.55), wood_mat, corner)
    roof_pair("Corridor_Corner_A", 3.7, 4.0, 0.08, 3.1, roof_mat, corner)

    solid = add_module_root("Wall_Solid", library)
    add_box("Wall_Solid_Body", (4.0, 0.24, 2.8), (0, 0, 1.4), wall_mat, solid, 0.02)
    add_box("Wall_Solid_Cap", (4.2, 0.38, 0.18), (0, 0, 2.85), roof_mat, solid, 0.02)

    window_wall = add_module_root("Wall_Window", library)
    add_box("Wall_Window_Left", (1.15, 0.24, 2.8), (-1.425, 0, 1.4), wall_mat, window_wall, 0.02)
    add_box("Wall_Window_Right", (1.15, 0.24, 2.8), (1.425, 0, 1.4), wall_mat, window_wall, 0.02)
    add_box("Wall_Window_Top", (1.7, 0.24, 0.55), (0, 0, 2.525), wall_mat, window_wall, 0.02)
    for x in (-0.65, -0.22, 0.22, 0.65):
        add_box("Wall_Window_Lattice", (0.055, 0.08, 1.55), (x, -0.15, 1.45), wood_mat, window_wall, 0.01)
    for z in (0.82, 1.25, 1.68, 2.1):
        add_box("Wall_Window_Lattice", (1.55, 0.08, 0.055), (0, -0.15, z), wood_mat, window_wall, 0.01)

    moon = add_module_root("Wall_MoonGate_Base", library)
    add_box("MoonGate_Left", (1.7, 0.32, 3.4), (-2.15, 0, 1.7), wall_mat, moon, 0.02)
    add_box("MoonGate_Right", (1.7, 0.32, 3.4), (2.15, 0, 1.7), wall_mat, moon, 0.02)
    add_box("MoonGate_Top", (2.6, 0.32, 0.65), (0, 0, 3.075), wall_mat, moon, 0.02)
    bpy.ops.mesh.primitive_torus_add(major_radius=1.24, minor_radius=0.15, major_segments=48, minor_segments=10, location=(0, -0.19, 1.45))
    ring = bpy.context.object
    ring.name = "MoonGate_Frame"
    ring.data.materials.append(wood_mat)
    ring.parent = moon

    door = add_module_root("Door_Wood", library)
    add_box("Door_Wood_Left", (0.9, 0.16, 2.45), (-0.47, 0, 1.225), wood_mat, door, 0.025)
    add_box("Door_Wood_Right", (0.9, 0.16, 2.45), (0.47, 0, 1.225), wood_mat, door, 0.025)
    for z in (0.65, 1.25, 1.85):
        add_box("Door_Wood_Rail", (1.78, 0.19, 0.065), (0, -0.02, z), roof_mat, door, 0.01)

    lattice = add_module_root("Window_Lattice", library)
    add_box("Window_Lattice_Frame_T", (2.1, 0.12, 0.1), (0, 0, 2.1), wood_mat, lattice, 0.01)
    add_box("Window_Lattice_Frame_B", (2.1, 0.12, 0.1), (0, 0, 0.5), wood_mat, lattice, 0.01)
    add_box("Window_Lattice_Frame_L", (0.1, 0.12, 1.7), (-1, 0, 1.3), wood_mat, lattice, 0.01)
    add_box("Window_Lattice_Frame_R", (0.1, 0.12, 1.7), (1, 0, 1.3), wood_mat, lattice, 0.01)
    for x in (-0.66, -0.33, 0, 0.33, 0.66):
        add_box("Window_Lattice_V", (0.045, 0.08, 1.5), (x, -0.03, 1.3), wood_mat, lattice, 0.008)
    for z in (0.82, 1.14, 1.46, 1.78):
        add_box("Window_Lattice_H", (1.85, 0.08, 0.045), (0, -0.03, z), wood_mat, lattice, 0.008)

    house = add_module_root("House_Small", library)
    add_box("House_Small_Floor", (6.4, 4.6, 0.2), (0, 0, 0.1), wall_mat, house, 0.02)
    add_box("House_Small_Back", (6.0, 0.22, 2.8), (0, 2.05, 1.5), wall_mat, house, 0.02)
    add_box("House_Small_Left", (0.22, 4.0, 2.8), (-2.9, 0, 1.5), wall_mat, house, 0.02)
    add_box("House_Small_Right", (0.22, 4.0, 2.8), (2.9, 0, 1.5), wall_mat, house, 0.02)
    for x in (-2.75, -0.92, 0.92, 2.75):
        add_cylinder("House_Small_Pillar", 0.13, 3.0, (x, -2.0, 1.6), wood_mat, house)
    roof_pair("House_Small", 7.0, 5.2, 0.1, 3.35, roof_mat, house)

    roof = add_module_root("Roof_Grey", library)
    roof_pair("Roof_Grey", 4.2, 4.2, 0.08, 0.35, roof_mat, roof)
    export_root(library, "TYX_ARCH_Greybox_Fallback_A.glb", "project-authored", "fallback-only greybox; never a formal visual asset")


def build_house():
    reset_scene()
    imported = import_glb(SOURCES["house"])
    remove_matching(imported, ["camera", "light"])
    imported = list(bpy.context.scene.objects)
    root = create_root("TYX_ARCH_House_A", imported)
    normalize_root(root, imported, 10.5)
    export_root(root, "TYX_ARCH_House_A.glb", "ancient-chinese-courtyard-house", "lightweight house normalized to 10.5 m horizontal span")


def build_pavilion():
    reset_scene()
    imported = import_glb(SOURCES["pavilion"])
    remove_matching(imported, ["landscape_ground", "landscape_water", "camera", "light"])
    imported = list(bpy.context.scene.objects)
    root = create_root("TYX_ARCH_Pavilion_A", imported)
    normalize_root(root, imported, 9.0)
    export_root(root, "TYX_ARCH_Pavilion_A.glb", "chinese-pavilion-memoriam", "landscape and water removed; pavilion normalized to 9 m span")


def build_pavilion_b():
    reset_scene()
    imported = import_glb(SOURCES["pavilion_b"])
    remove_matching(imported, ["camera", "light"])
    imported = list(bpy.context.scene.objects)
    root = create_root("TYX_ARCH_Pavilion_B", imported)
    normalize_root(root, imported, 8.0)
    export_root(root, "TYX_ARCH_Pavilion_B.glb", "chinese-pavilion", "pivot repaired, grounded and normalized to 8 m horizontal span; reserved scenic pavilion")


def build_bridge():
    reset_scene()
    imported = import_glb(SOURCES["bridge"])
    remove_matching(imported, ["camera", "light"])
    imported = list(bpy.context.scene.objects)
    root = create_root("TYX_GMP_Bridge_Low_A", imported)
    normalize_root(root, imported, 6.0)
    export_root(root, "TYX_GMP_Bridge_Low_A.glb", "low-bridge", "source GLB imported into Blender and re-exported as metallic-roughness working derivative; bridge normalized to 6 m span")


def build_rocks():
    reset_scene()
    imported = import_glb(SOURCES["pavilion"])
    rocks = [obj for obj in imported if obj.type == "MESH" and "rock" in obj.name.lower()]
    if not rocks:
        raise RuntimeError("Pavilion source does not contain a rock mesh")
    source = rocks[0]
    source_matrix = source.matrix_world.copy()
    source_data = source.data.copy()
    source_materials = list(source.data.materials)
    reset_scene(purge=False)
    root = bpy.data.objects.new("TYX_NAT_Rock_Set_A", None)
    bpy.context.scene.collection.objects.link(root)
    variants = [
        ("Rock_A", (-2.2, 0, 0), (1.0, 0.82, 0.9), 0),
        ("Rock_B", (0, 0, 0), (0.72, 1.12, 0.68), 0.8),
        ("Rock_C", (2.2, 0, 0), (1.18, 0.7, 0.76), 1.7),
    ]
    for name, location, scale, rotation in variants:
        obj = bpy.data.objects.new(name, source_data.copy())
        bpy.context.scene.collection.objects.link(obj)
        obj.matrix_world = source_matrix
        obj.location = location
        obj.scale = scale
        obj.rotation_euler[2] = rotation
        obj.parent = root
        if not obj.data.materials:
            for source_material_item in source_materials:
                obj.data.materials.append(source_material_item)
    normalize_root(root, list(root.children), 6.2)
    export_root(root, "TYX_NAT_Rock_Set_A.glb", "chinese-pavilion-memoriam", "three transformed variants from the licensed source rock mesh")


def build_moon_gate_collision():
    reset_scene()
    collision_mat = material("TYX_DEBUG_Collision", (0.1, 0.8, 0.45), 1.0)
    root = bpy.data.objects.new("TYX_GMP_MoonGate_Collision", None)
    bpy.context.scene.collection.objects.link(root)
    add_box("MoonGate_Collider_Left", (1.7, 0.4, 3.4), (-2.15, 0, 1.7), collision_mat, root, 0)
    add_box("MoonGate_Collider_Right", (1.7, 0.4, 3.4), (2.15, 0, 1.7), collision_mat, root, 0)
    add_box("MoonGate_Collider_Top", (2.6, 0.4, 0.65), (0, 0, 3.075), collision_mat, root, 0)
    export_root(root, "TYX_GMP_MoonGate_Collision.glb", "project-authored", "visual frame, trigger and collision remain independent")


try:
    for builder in (build_house, build_pavilion, build_pavilion_b, build_bridge, build_rocks, build_fallback_kit, build_moon_gate_collision):
        builder()
    with open(REPORT_PATH, "w", encoding="utf-8") as report_file:
        json.dump(REPORT, report_file, ensure_ascii=False, indent=2)
        report_file.write("\n")
    print("Generated " + str(len(REPORT["outputs"])) + " Blender runtime sources in " + RAW_ROOT)
except Exception:
    traceback.print_exc()
    sys.exit(1)
