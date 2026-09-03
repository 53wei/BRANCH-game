import bpy
import json
from mathutils import Vector


pivot = bpy.data.objects["Pivot"]
pivot_names = {pivot.name, *(obj.name for obj in pivot.children_recursive)}
for obj in bpy.context.scene.objects:
    obj.hide_set(obj.name not in pivot_names)
bpy.context.view_layer.update()
depsgraph = bpy.context.evaluated_depsgraph_get()

samples = {
    "lower_west_wall_A": (-386.5, -50.0),
    "lower_west_wall_B": (-386.5, -28.0),
    "lower_south_wall_A": (-350.0, -65.0),
    "lower_south_wall_B": (-315.0, -65.0),
    "lower_east_wall_A": (-282.0, -50.0),
    "lower_east_wall_B": (-282.0, -25.0),
    "middle_cross_wall_A": (-365.0, -8.0),
    "middle_cross_wall_B": (-325.0, -8.0),
    "upper_west_wall": (-337.0, 34.0),
    "upper_north_wall_A": (-320.0, 62.0),
    "upper_north_wall_B": (-292.0, 62.0),
    "upper_east_wall": (-276.0, 34.0),
    "upper_water": (-360.0, 14.0),
    "upper_pavilion": (-379.0, 25.0),
    "lower_rockery": (-310.0, -45.0),
    "lower_courtyard": (-330.0, -38.0),
}

result = {}
for label, (x, y) in samples.items():
    hits = []
    origin = Vector((x, y, 100.0))
    for _ in range(20):
        hit, location, normal, face, obj, matrix = bpy.context.scene.ray_cast(
            depsgraph, origin, Vector((0, 0, -1)), distance=180
        )
        if not hit:
            break
        hits.append({"object": obj.name, "z": round(location.z, 3), "face": int(face)})
        origin = location + Vector((0, 0, -0.03))
    result[label] = {"xy": [x, y], "hits": hits}

print("TYX_SAMPLES_BEGIN")
print(json.dumps(result, ensure_ascii=False))
print("TYX_SAMPLES_END")
