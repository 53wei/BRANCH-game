import bpy
import json
from collections import deque
from mathutils import Vector


B_ROOT_NAME = "B_CoreGarden_Primary"
REGION_MIN = Vector((-313.0, -13.0, -11.5))
REGION_MAX = Vector((-286.0, 13.0, 5.0))


def descendants(root):
    return {root, *root.children_recursive}


def intersects(minimum, maximum):
    return all(maximum[i] >= REGION_MIN[i] and minimum[i] <= REGION_MAX[i] for i in range(3))


b_root = bpy.data.objects.get(B_ROOT_NAME)
if b_root is None:
    raise RuntimeError(f"Missing root: {B_ROOT_NAME}")
b_members = descendants(b_root)
records = []

for obj in bpy.context.scene.objects:
    if obj.type != "MESH" or obj in b_members or obj.hide_render:
        continue
    mesh = obj.data
    matrix = obj.matrix_world
    world_vertices = [matrix @ vertex.co for vertex in mesh.vertices]
    seeds = {
        index
        for index, co in enumerate(world_vertices)
        if all(REGION_MIN[axis] <= co[axis] <= REGION_MAX[axis] for axis in range(3))
    }
    if not seeds:
        continue

    adjacency = [[] for _ in mesh.vertices]
    for edge in mesh.edges:
        a, b = edge.vertices
        adjacency[a].append(b)
        adjacency[b].append(a)

    visited_components = set()
    for seed in sorted(seeds):
        if seed in visited_components:
            continue
        queue = deque([seed])
        component = set()
        visited_components.add(seed)
        while queue:
            current = queue.popleft()
            component.add(current)
            for neighbor in adjacency[current]:
                if neighbor not in visited_components:
                    visited_components.add(neighbor)
                    queue.append(neighbor)
        points = [world_vertices[index] for index in component]
        minimum = Vector(tuple(min(point[axis] for point in points) for axis in range(3)))
        maximum = Vector(tuple(max(point[axis] for point in points) for axis in range(3)))
        if not intersects(minimum, maximum):
            continue
        dimensions = maximum - minimum
        records.append(
            {
                "object": obj.name,
                "component_seed": seed,
                "vertex_count": len(component),
                "min": [round(value, 3) for value in minimum],
                "max": [round(value, 3) for value in maximum],
                "dimensions": [round(value, 3) for value in dimensions],
                "materials": [slot.material.name for slot in obj.material_slots if slot.material][:4],
            }
        )

records.sort(
    key=lambda row: (
        -row["dimensions"][2],
        row["object"],
        row["component_seed"],
    )
)
print(json.dumps({"region": [list(REGION_MIN), list(REGION_MAX)], "components": records}, ensure_ascii=False))
