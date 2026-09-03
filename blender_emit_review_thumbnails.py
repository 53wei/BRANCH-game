import base64
import bpy
import json
import os


paths = [
    r"E:\C_Projects\game\TYX_Phase1_Connection_Top.png",
    r"E:\C_Projects\game\TYX_Phase1_Connection_Gameplay.png",
]
payload = []
for source in paths:
    image = bpy.data.images.load(source, check_existing=False)
    width, height = image.size
    scale = min(1.0, 720.0 / max(width, height))
    image.scale(max(1, int(width * scale)), max(1, int(height * scale)))
    target = os.path.splitext(source)[0] + "_thumb.jpg"
    image.filepath_raw = target
    image.file_format = "JPEG"
    image.save()
    bpy.data.images.remove(image)
    with open(target, "rb") as stream:
        encoded = base64.b64encode(stream.read()).decode("ascii")
    payload.append({"path": source, "thumbnail": target, "base64": encoded})

print(json.dumps(payload))
