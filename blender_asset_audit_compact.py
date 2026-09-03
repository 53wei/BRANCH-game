import bpy
import json
import os
from collections import Counter
from mathutils import Vector


def members(root):
    return [root, *list(root.children_recursive)]


def bbox(objects):
    points = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        points.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    if not points:
        return None
    mn = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    mx = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return {
        "min": [round(v, 2) for v in mn],
        "max": [round(v, 2) for v in mx],
        "center": [round(v, 2) for v in (mn + mx) * 0.5],
        "dims": [round(v, 2) for v in mx - mn],
    }


def image_names(obj):
    names = []
    for slot in obj.material_slots:
        mat = slot.material
        if not mat or not mat.use_nodes or not mat.node_tree:
            continue
        for node in mat.node_tree.nodes:
            image = getattr(node, "image", None)
            if image:
                names.append(os.path.basename(image.filepath) or image.name)
    return sorted(set(names))[:8]


def mesh_row(obj):
    bb = bbox([obj])
    return {
        "name": obj.name,
        "bbox": bb,
        "verts": len(obj.data.vertices),
        "materials": [s.material.name if s.material else None for s in obj.material_slots][:4],
        "images": image_names(obj),
    }


roots = [obj for obj in bpy.context.scene.objects if obj.parent is None]
root_summary = []
for root in roots:
    ms = members(root)
    root_summary.append({
        "name": root.name,
        "members": len(ms),
        "types": dict(Counter(o.type for o in ms)),
        "bbox": bbox(ms),
        "location": [round(v, 2) for v in root.location],
        "rotation": [round(v, 5) for v in root.rotation_euler],
        "scale": [round(v, 5) for v in root.scale],
    })


def candidate_sets(root_name):
    root = bpy.data.objects.get(root_name)
    if not root:
        return None
    rows = [mesh_row(o) for o in members(root) if o.type == "MESH"]
    valid = [r for r in rows if r["bbox"]]

    def dims(r):
        return r["bbox"]["dims"]

    wall = [
        r for r in valid
        if 1.2 <= dims(r)[2] <= 12
        and max(dims(r)[0], dims(r)[1]) >= 10
        and min(dims(r)[0], dims(r)[1]) <= 8
        and max(dims(r)[0], dims(r)[1]) / max(min(dims(r)[0], dims(r)[1]), 0.2) >= 2.5
    ]
    wall.sort(key=lambda r: max(dims(r)[0], dims(r)[1]), reverse=True)
    flat = [r for r in valid if dims(r)[2] <= 0.8 and dims(r)[0] * dims(r)[1] >= 100]
    flat.sort(key=lambda r: dims(r)[0] * dims(r)[1], reverse=True)
    tall_large = [r for r in valid if dims(r)[2] >= 18 and max(dims(r)[0], dims(r)[1]) >= 20]
    tall_large.sort(key=lambda r: dims(r)[0] * dims(r)[1] * dims(r)[2], reverse=True)
    compact_arch = [
        r for r in valid
        if 4 <= dims(r)[2] <= 25
        and 5 <= dims(r)[0] <= 50
        and 5 <= dims(r)[1] <= 50
    ]
    compact_arch.sort(key=lambda r: dims(r)[0] * dims(r)[1], reverse=True)
    return {
        "root": root_name,
        "mesh_count": len(rows),
        "wall_candidates": wall[:40],
        "flat_water_or_ground_candidates": flat[:25],
        "mountain_or_large_environment_candidates": tall_large[:25],
        "compact_architecture_or_vegetation_candidates": compact_arch[:50],
    }


payload = {
    "roots": root_summary,
    "pivot_candidates": candidate_sets("Pivot"),
    "garden_B_positive": candidate_sets("Sketchfab_model.001"),
    "garden_B_negative": candidate_sets("Sketchfab_model.003"),
}
print("TYX_COMPACT_BEGIN")
print(json.dumps(payload, ensure_ascii=False))
print("TYX_COMPACT_END")
