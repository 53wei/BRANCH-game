import bpy
import json
from mathutils import Vector


scene = bpy.context.scene
depsgraph = bpy.context.evaluated_depsgraph_get()
B_ROOT = bpy.data.objects.get("B_CoreGarden_Primary")
if B_ROOT is None:
    raise RuntimeError("Missing B_CoreGarden_Primary")


def root_of(obj):
    current = obj.original if hasattr(obj, "original") else obj
    while current.parent:
        current = current.parent
    return current


def all_hits(start, end, limit=60):
    start = Vector(start)
    end = Vector(end)
    vector = end - start
    direction = vector.normalized()
    total = vector.length
    cursor = start.copy()
    travelled = 0.0
    result = []
    for _ in range(limit):
        remaining = total - travelled
        if remaining <= 0.01:
            break
        hit, location, normal, face, obj, matrix = scene.ray_cast(
            depsgraph, cursor, direction, distance=remaining
        )
        if not hit:
            break
        travelled += (location - cursor).length
        result.append((location.copy(), obj, face, travelled))
        cursor = location + direction * 0.02
        travelled += 0.02
    return result


scan = []
for y in range(-18, 31):
    row = {"y": y}
    for label, z in (("body", -8.45), ("camera", -7.55), ("upper", -6.65)):
        hits = []
        for location, obj, face, distance in all_hits((-300.0, float(y), z), (-276.0, float(y), z)):
            if root_of(obj) == B_ROOT:
                hits.append(
                    {
                        "x": round(location.x, 3),
                        "object": obj.name,
                        "face": face,
                    }
                )
        row[label] = hits[:8]

    vertical = []
    for location, obj, face, distance in all_hits((-290.0, float(y), 5.0), (-290.0, float(y), -18.0)):
        if root_of(obj) == B_ROOT:
            vertical.append(
                {
                    "z": round(location.z, 3),
                    "object": obj.name,
                    "face": face,
                }
            )
    row["vertical"] = vertical[:8]
    row["body_clear"] = not row["body"]
    row["camera_clear"] = not row["camera"]
    scan.append(row)

print(json.dumps({"scan": scan}, ensure_ascii=False))
