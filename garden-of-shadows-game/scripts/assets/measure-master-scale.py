import bpy
import json
from mathutils import Vector


RUNTIME_SCALE = 0.64

TARGET_NAMES = [
    "MOD_A_WallGate_10m",
    "MOD_A_WallGate_10m_GEO",
    "MOD_A_WallStraight_16m",
    "MOD_A_WallStraight_16m_GEO",
    "TYX_MAIN_GATE_SOUTH",
    "TYX_MAIN_GATE_SOUTH_GEO",
    "1d4e7970.o",
]

REFERENCE_CATEGORIES = {
    "door": ("door", "gate"),
    "wall": ("wall",),
    "railing": ("rail", "balust", "fence"),
    "table": ("table", "desk"),
    "step": ("stair", "step", "threshold"),
    "windowSill": ("window", "sill", "lattice"),
}


def parent_chain(obj):
    result = []
    current = obj
    while current is not None:
        result.append(current.name)
        current = current.parent
    return result


def world_bounds(objects):
    points = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        points.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    if not points:
        return None
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    size = maximum - minimum
    return {
        "min": [round(value, 4) for value in minimum],
        "max": [round(value, 4) for value in maximum],
        "size": [round(value, 4) for value in size],
        "center": [round(value, 4) for value in ((minimum + maximum) * 0.5)],
    }


def runtime_scaled_bounds(bounds):
    if not bounds:
        return None
    return {
        "min": [round(value * RUNTIME_SCALE, 4) for value in bounds["min"]],
        "max": [round(value * RUNTIME_SCALE, 4) for value in bounds["max"]],
        "size": [round(value * RUNTIME_SCALE, 4) for value in bounds["size"]],
        "center": [round(value * RUNTIME_SCALE, 4) for value in bounds["center"]],
    }


def describe(obj):
    members = [obj] + list(obj.children_recursive)
    bounds = world_bounds(members)
    return {
        "name": obj.name,
        "type": obj.type,
        "parentChain": parent_chain(obj),
        "hiddenViewport": obj.hide_viewport or obj.hide_get(),
        "hiddenRender": obj.hide_render,
        "bounds": bounds,
        "runtimeBoundsMeters": runtime_scaled_bounds(bounds),
        "meshMembers": [member.name for member in members if member.type == "MESH"],
    }


def frequent_world_z_levels(obj):
    """Return repeated horizontal mesh levels for stair/threshold diagnosis."""
    counts = {}
    mesh = obj.data
    for vertex in mesh.vertices:
        z_value = round((obj.matrix_world @ vertex.co).z, 3)
        counts[z_value] = counts.get(z_value, 0) + 1
    return [
        {"z": z_value, "count": count}
        for z_value, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:24]
    ]


def ray_open_intervals(obj, axis):
    scene = bpy.context.scene
    depsgraph = bpy.context.evaluated_depsgraph_get()
    bounds = world_bounds([obj])
    if not bounds:
        return []
    minimum = Vector(bounds["min"])
    maximum = Vector(bounds["max"])
    center = (minimum + maximum) * 0.5
    saved = [(candidate, candidate.hide_viewport, candidate.hide_get()) for candidate in scene.objects]
    try:
        for candidate, _, _ in saved:
            candidate.hide_viewport = candidate is not obj
            candidate.hide_set(candidate is not obj)
        obj.hide_viewport = False
        obj.hide_set(False)
        bpy.context.view_layer.update()
        sample_count = 800
        states = []
        for index in range(sample_count + 1):
            height = minimum.z + (maximum.z - minimum.z) * index / sample_count
            if axis == "Y":
                origin = Vector((center.x, minimum.y - 1.0, height))
                direction = Vector((0.0, 1.0, 0.0))
                distance = maximum.y - minimum.y + 2.0
            else:
                origin = Vector((minimum.x - 1.0, center.y, height))
                direction = Vector((1.0, 0.0, 0.0))
                distance = maximum.x - minimum.x + 2.0
            hit, _, _, _, hit_object, _ = scene.ray_cast(depsgraph, origin, direction, distance=distance)
            states.append((height, bool(hit and hit_object and hit_object.name == obj.name)))
        intervals = []
        interval_start = None
        for height, blocked in states:
            if not blocked and interval_start is None:
                interval_start = height
            if blocked and interval_start is not None:
                intervals.append([interval_start, height])
                interval_start = None
        if interval_start is not None:
            intervals.append([interval_start, maximum.z])
        return [
            {
                "minZ": round(start, 4),
                "maxZ": round(end, 4),
                "height": round(end - start, 4),
                "fractionOfTotal": round((end - start) / max(0.0001, maximum.z - minimum.z), 4),
            }
            for start, end in intervals
            if end - start > (maximum.z - minimum.z) * 0.01
        ]
    finally:
        for candidate, hide_viewport, hide_get in saved:
            candidate.hide_viewport = hide_viewport
            candidate.hide_set(hide_get)
        bpy.context.view_layer.update()


targets = []
for name in TARGET_NAMES:
    obj = bpy.data.objects.get(name)
    if obj is not None:
        targets.append(describe(obj))

named_candidates = [
    describe(obj)
    for obj in bpy.data.objects
    if obj.type == "MESH" and any(
        token in obj.name.lower()
        for tokens in REFERENCE_CATEGORIES.values()
        for token in tokens
    )
]

reference_candidates = {
    category: [
        item
        for item in named_candidates
        if any(token in item["name"].lower() for token in tokens)
    ]
    for category, tokens in REFERENCE_CATEGORIES.items()
}

scale_candidates = []
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    chain = parent_chain(obj)
    if not any(name in chain for name in ("A_OuterGarden_Environment", "B_CoreGarden_Primary")):
        continue
    bounds = world_bounds([obj])
    if not bounds:
        continue
    x_size, y_size, z_size = bounds["size"]
    if 0.25 <= z_size <= 3.25 and max(x_size, y_size) >= 1.25:
        scale_candidates.append({
            "name": obj.name,
            "parentChain": chain,
            "bounds": bounds,
            "materials": [slot.material.name if slot.material else "" for slot in obj.material_slots],
        })

gate = bpy.data.objects.get("MOD_A_WallGate_10m_GEO")
gate_center = Vector((-347.0, -41.5, -9.0))
gate_nearby = []
for item in scale_candidates:
    center = Vector(item["bounds"]["center"])
    if (Vector((center.x, center.y, 0.0)) - Vector((gate_center.x, gate_center.y, 0.0))).length > 18.0:
        continue
    obj = bpy.data.objects.get(item["name"])
    gate_nearby.append({**item, "frequentWorldZLevels": frequent_world_z_levels(obj) if obj else []})
door_scan = {
    "target": gate.name if gate else None,
    "alongY": ray_open_intervals(gate, "Y") if gate else [],
    "alongX": ray_open_intervals(gate, "X") if gate else [],
}

result = {
    "blend": bpy.data.filepath,
    "runtimeScale": RUNTIME_SCALE,
    "metersPerRuntimeWorldUnit": 1.0,
    "targets": targets,
    "namedCandidates": named_candidates,
    "referenceCandidates": reference_candidates,
    "referenceCategoryCounts": {category: len(items) for category, items in reference_candidates.items()},
    "missingReferenceCategories": [category for category, items in reference_candidates.items() if not items],
    "scaleCandidates": sorted(scale_candidates, key=lambda item: item["bounds"]["size"][2]),
    "gateNearbyCandidates": sorted(gate_nearby, key=lambda item: item["bounds"]["size"][2]),
    "doorScan": door_scan,
}
print("TYX_SCALE_MEASURE_JSON_BEGIN")
print(json.dumps(result, ensure_ascii=False, indent=2))
print("TYX_SCALE_MEASURE_JSON_END")
