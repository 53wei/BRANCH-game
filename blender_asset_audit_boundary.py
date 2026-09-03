import bpy
import json
import os
from mathutils import Vector


def bbox(obj):
    pts = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx


def images(obj):
    found = []
    for slot in obj.material_slots:
        mat = slot.material
        if not mat or not mat.node_tree:
            continue
        for node in mat.node_tree.nodes:
            image = getattr(node, "image", None)
            if image:
                found.append(os.path.basename(image.filepath) or image.name)
    return sorted(set(found))[:6]


root = bpy.data.objects["Pivot"]
rows = []
for obj in [root, *list(root.children_recursive)]:
    if obj.type != "MESH":
        continue
    mn, mx = bbox(obj)
    dims = mx - mn
    # The architectural garden footprint in A is defined by the 142.54 m square base.
    if mx.x < -430 or mn.x > -270 or mx.y < -82 or mn.y > 82:
        continue
    if max(dims.x, dims.y) > 180 or dims.z > 45:
        continue
    sides = []
    if mn.x <= -418:
        sides.append("WEST")
    if mx.x >= -287:
        sides.append("EAST")
    if mn.y <= -65:
        sides.append("SOUTH")
    if mx.y >= 67:
        sides.append("NORTH")
    if not sides:
        continue
    rows.append({
        "name": obj.name,
        "sides": sides,
        "min": [round(v, 2) for v in mn],
        "max": [round(v, 2) for v in mx],
        "dims": [round(v, 2) for v in dims],
        "verts": len(obj.data.vertices),
        "materials": [s.material.name if s.material else None for s in obj.material_slots][:4],
        "images": images(obj),
    })

rows.sort(key=lambda r: (r["sides"][0], -(r["dims"][0] * r["dims"][1])))
print("TYX_BOUNDARY_BEGIN")
print(json.dumps(rows, ensure_ascii=False))
print("TYX_BOUNDARY_END")
