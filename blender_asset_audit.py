import bpy
import json
from collections import Counter
from mathutils import Vector


def hierarchy_members(root):
    return [root, *list(root.children_recursive)]


def world_bbox(objects):
    points = []
    for obj in objects:
        if obj.type not in {"MESH", "CURVE", "SURFACE", "META", "FONT"}:
            continue
        points.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    if not points:
        return None
    minimum = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    maximum = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    center = (minimum + maximum) * 0.5
    dimensions = maximum - minimum
    return {
        "min": [round(v, 3) for v in minimum],
        "max": [round(v, 3) for v in maximum],
        "center": [round(v, 3) for v in center],
        "dimensions": [round(v, 3) for v in dimensions],
    }


def object_record(obj):
    bbox = world_bbox([obj])
    materials = []
    if obj.type == "MESH":
        materials = [slot.material.name if slot.material else None for slot in obj.material_slots]
    return {
        "name": obj.name,
        "type": obj.type,
        "parent": obj.parent.name if obj.parent else None,
        "bbox": bbox,
        "vertices": len(obj.data.vertices) if obj.type == "MESH" else 0,
        "polygons": len(obj.data.polygons) if obj.type == "MESH" else 0,
        "materials": materials[:8],
        "location": [round(v, 3) for v in obj.matrix_world.translation],
        "rotation_euler": [round(v, 5) for v in obj.rotation_euler],
        "scale": [round(v, 5) for v in obj.scale],
    }


def root_record(root):
    members = hierarchy_members(root)
    counts = Counter(obj.type for obj in members)
    meshes = [object_record(obj) for obj in members if obj.type == "MESH"]
    meshes.sort(
        key=lambda row: (
            row["bbox"]["dimensions"][0] * row["bbox"]["dimensions"][1]
            if row["bbox"]
            else 0
        ),
        reverse=True,
    )
    return {
        "name": root.name,
        "type": root.type,
        "member_count": len(members),
        "type_counts": dict(counts),
        "bbox": world_bbox(members),
        "root_transform": {
            "location": [round(v, 3) for v in root.location],
            "rotation_euler": [round(v, 5) for v in root.rotation_euler],
            "scale": [round(v, 5) for v in root.scale],
        },
        "direct_children": [obj.name for obj in root.children],
        "meshes": meshes,
    }


roots = [obj for obj in bpy.context.scene.objects if obj.parent is None]
records = [root_record(root) for root in roots]
records.sort(
    key=lambda row: (
        row["bbox"]["dimensions"][0] * row["bbox"]["dimensions"][1]
        if row["bbox"]
        else 0
    ),
    reverse=True,
)

payload = {
    "file": bpy.data.filepath,
    "blender_version": bpy.app.version_string,
    "scene_object_count": len(bpy.context.scene.objects),
    "root_count": len(roots),
    "roots": records,
}
print("TYX_AUDIT_JSON_BEGIN")
print(json.dumps(payload, ensure_ascii=False))
print("TYX_AUDIT_JSON_END")
