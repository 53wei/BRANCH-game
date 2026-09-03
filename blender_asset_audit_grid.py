import bpy
import json
from collections import defaultdict
from mathutils import Vector


pivot = bpy.data.objects["Pivot"]
pivot_names = {pivot.name, *(obj.name for obj in pivot.children_recursive)}
for obj in bpy.context.scene.objects:
    obj.hide_set(obj.name not in pivot_names)
bpy.context.view_layer.update()
depsgraph = bpy.context.evaluated_depsgraph_get()

hits = defaultdict(list)
step = 1.5
x = -425.0
while x <= -275.0:
    y = -75.0
    while y <= 78.0:
        hit, location, normal, face, obj, matrix = bpy.context.scene.ray_cast(
            depsgraph,
            Vector((x, y, 80.0)),
            Vector((0, 0, -1)),
            distance=140,
        )
        if hit and location.z > -16:
            hits[obj.name].append((x, y, location.z))
        y += step
    x += step

rows = []
for name, points in hits.items():
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    zs = [p[2] for p in points]
    xspan = max(xs) - min(xs)
    yspan = max(ys) - min(ys)
    major = max(xspan, yspan)
    minor = min(xspan, yspan)
    rows.append({
        "name": name,
        "sample_hits": len(points),
        "visible_xy_min": [round(min(xs), 1), round(min(ys), 1)],
        "visible_xy_max": [round(max(xs), 1), round(max(ys), 1)],
        "visible_span": [round(xspan, 1), round(yspan, 1)],
        "aspect": round(major / max(minor, step), 2),
        "z_range": [round(min(zs), 2), round(max(zs), 2)],
        "z_mean": round(sum(zs) / len(zs), 2),
    })

rows.sort(key=lambda row: (max(row["visible_span"]), row["sample_hits"]), reverse=True)
linear = [
    row for row in rows
    if max(row["visible_span"]) >= 12
    and (row["aspect"] >= 2.5 or min(row["visible_span"]) <= 4.5)
]
large_surfaces = [row for row in rows if row["sample_hits"] >= 30]

print("TYX_GRID_BEGIN")
print(json.dumps({"linear_candidates": linear[:80], "large_surfaces": large_surfaces[:80]}, ensure_ascii=False))
print("TYX_GRID_END")
