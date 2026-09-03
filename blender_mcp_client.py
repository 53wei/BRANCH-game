import argparse
import json
import socket
import sys
from pathlib import Path


def receive_json(sock: socket.socket) -> dict:
    chunks: list[bytes] = []
    while True:
        chunk = sock.recv(65536)
        if not chunk:
            break
        chunks.append(chunk)
        payload = b"".join(chunks)
        try:
            return json.loads(payload.decode("utf-8"))
        except json.JSONDecodeError:
            continue
    raise RuntimeError("Blender MCP closed the connection without a complete JSON response")


def main() -> int:
    parser = argparse.ArgumentParser(description="Send one command to the local Blender MCP add-on")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=9876)
    parser.add_argument("--type", default="get_scene_info")
    parser.add_argument("--code-file", type=Path)
    parser.add_argument("--params-json", default="{}")
    parser.add_argument("--timeout", type=float, default=180.0)
    args = parser.parse_args()

    params = json.loads(args.params_json)
    if args.code_file:
        params["code"] = args.code_file.read_text(encoding="utf-8")

    request = json.dumps({"type": args.type, "params": params}).encode("utf-8")
    with socket.create_connection((args.host, args.port), timeout=args.timeout) as sock:
        sock.settimeout(args.timeout)
        sock.sendall(request)
        response = receive_json(sock)

    print(json.dumps(response, ensure_ascii=False, indent=2))
    return 0 if response.get("status") == "success" else 1


if __name__ == "__main__":
    sys.exit(main())
