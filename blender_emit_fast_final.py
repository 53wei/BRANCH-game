import base64
import bpy
import json
import os


sources = [
    r"E:\C_Projects\game\TYX_FastFinal_Top.jpg",
    r"E:\C_Projects\game\TYX_FastFinal_Aerial.jpg",
    r"E:\C_Projects\game\TYX_FastFinal_Connection.jpg",
]
payload = []
for source in sources:
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
        payload.append({"path": source, "base64": base64.b64encode(stream.read()).decode("ascii")})
print(json.dumps(payload))
