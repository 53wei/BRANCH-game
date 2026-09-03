import bpy
import json
import os
from datetime import datetime


workspace = r"E:\C_Projects\game"
master = os.path.join(workspace, "TingYuXuan_Master.blend")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = os.path.join(workspace, f"TingYuXuan_AccidentalUndo_{stamp}.blend")

before = {
    "phase": bpy.context.scene.get("TYX_phase", "missing"),
    "objects": len(bpy.context.scene.objects),
    "final_collection_objects": len(bpy.data.collections.get("08_FAST_FINAL_ASSEMBLY").objects)
    if bpy.data.collections.get("08_FAST_FINAL_ASSEMBLY")
    else 0,
    "b_location": list(bpy.data.objects.get("B_CoreGarden_Primary").location)
    if bpy.data.objects.get("B_CoreGarden_Primary")
    else None,
}

bpy.ops.wm.save_as_mainfile(filepath=backup, copy=True)
bpy.ops.wm.open_mainfile(filepath=master)

after = {
    "phase": bpy.context.scene.get("TYX_phase", "missing"),
    "objects": len(bpy.context.scene.objects),
    "final_collection_objects": len(bpy.data.collections.get("08_FAST_FINAL_ASSEMBLY").objects)
    if bpy.data.collections.get("08_FAST_FINAL_ASSEMBLY")
    else 0,
    "b_location": list(bpy.data.objects.get("B_CoreGarden_Primary").location)
    if bpy.data.objects.get("B_CoreGarden_Primary")
    else None,
}

print(json.dumps({"backup": backup, "restored": master, "before": before, "after": after}, ensure_ascii=False))
