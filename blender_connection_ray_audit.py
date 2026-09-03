import bpy
import json
from mathutils import Vector


scene = bpy.context.scene
depsgraph = bpy.context.evaluated_depsgraph_get()


def root_name(obj):
    current = obj
    while current.parent is not None:
        current = current.parent
    return current.name


def ray_hits(start, end, limit=40):
    start = Vector(start)
    end = Vector(end)
    vector = end - start
    total = vector.length
    direction = vector.normalized()
    cursor = start.copy()
    travelled = 0.0
    records = []
    for _ in range(limit):
        remaining = total - travelled
        if remaining <= 0.01:
            break
        hit, location, normal, face_index, obj, matrix = scene.ray_cast(
            depsgraph, cursor, direction, distance=remaining
        )
        if not hit:
            break
        step = (location - cursor).length
        travelled += step
        records.append(
            {
                "distance": round(travelled, 3),
                "location": [round(value, 3) for value in location],
                "object": obj.name,
                "root": root_name(obj.original if hasattr(obj, "original") else obj),
                "face": face_index,
            }
        )
        cursor = location + direction * 0.02
        travelled += 0.02
    return records


horizontal = {}
for y in (-6.0, -5.0, -4.0, -2.0, 0.0, 2.0):
    for z in (-8.2, -7.2, -6.2):
        key = f"y{y}_z{z}"
        horizontal[key] = ray_hits((-314.0, y, z), (-282.0, y, z))

ground = {}
for x, y in [
    (-312.0, -5.0),
    (-308.0, -5.0),
    (-304.0, -5.0),
    (-301.0, -5.0),
    (-298.0, -5.0),
    (-296.0, -3.0),
    (-294.0, -1.0),
    (-292.0, 1.0),
    (-290.0, 3.0),
]:
    ground[f"{x},{y}"] = ray_hits((x, y, 8.0), (x, y, -25.0), limit=12)

print(json.dumps({"horizontal": horizontal, "ground": ground}, ensure_ascii=False))
