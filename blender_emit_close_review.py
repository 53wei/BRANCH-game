import base64
import bpy
import glob
import json
import os


payload = []
for source in sorted(glob.glob(r"E:\C_Projects\game\TYX_Phase1_Close_*.jpg")):
    image = bpy.data.images.load(source, check_existing=False)
    width, height = image.size
    scale = min(1.0, 640.0 / max(width, height))
    image.scale(max(1, int(width * scale)), max(1, int(height * scale)))
    target = os.path.splitext(source)[0] + "_thumb.jpg"
    image.filepath_raw = target
    image.file_format = "JPEG"
    image.save()
    bpy.data.images.remove(image)
    with open(target, "rb") as stream:
        encoded = base64.b64encode(stream.read()).decode("ascii")
    payload.append({"path": source, "base64": encoded})

print(json.dumps(payload))
