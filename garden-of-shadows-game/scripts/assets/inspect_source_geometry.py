import json
import os
import sys

import bpy
from mathutils import Vector


def args_after_separator():
    if "--" not in sys.argv:
        raise RuntimeError("Usage: blender -b --python inspect_source_geometry.py -- <source.glb> <report.json>")
    return sys.argv[sys.argv.index("--") + 1 :]


def bounds_for(obj):
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = [min(point[index] for point in points) for index in range(3)]
    maximum = [max(point[index] for point in points) for index in range(3)]
    return {
        "min": [round(value, 5) for value in minimum],
        "max": [round(value, 5) for value in maximum],
        "size": [round(maximum[index] - minimum[index], 5) for index in range(3)],
        "center": [round((maximum[index] + minimum[index]) / 2, 5) for index in range(3)],
    }


source_path, report_path = [os.path.abspath(value) for value in args_after_separator()]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source_path)
bpy.context.view_layer.update()

objects = []
for obj in bpy.context.scene.objects:
    if obj.type != "MESH":
        continue
    triangles = sum(max(0, len(polygon.vertices) - 2) for polygon in obj.data.polygons)
    objects.append({
        "name": obj.name,
        "mesh": obj.data.name,
        "triangles": triangles,
        "materials": [material.name for material in obj.data.materials if material],
        "boundsBlenderZUp": bounds_for(obj),
    })

report = {
    "source": source_path,
    "blender": bpy.app.version_string,
    "meshCount": len(objects),
    "objects": objects,
}
os.makedirs(os.path.dirname(report_path), exist_ok=True)
with open(report_path, "w", encoding="utf-8") as output:
    json.dump(report, output, ensure_ascii=False, indent=2)
    output.write("\n")
print(f"Inspected {len(objects)} mesh objects from {source_path}")
