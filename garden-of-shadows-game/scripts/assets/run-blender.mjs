import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const workspaceRoot = path.resolve(projectRoot, "..");
const configured = process.env.BLENDER_PATH;
const portable = path.join(workspaceRoot, ".tools", "blender-5.2.1-windows-x64", "blender.exe");
const blender = configured || portable;
if (!fs.existsSync(blender)) {
  throw new Error("Blender 5.2.1 LTS not found. Set BLENDER_PATH or install the verified portable tool.");
}
const script = path.join(projectRoot, "scripts", "assets", "build_runtime_assets.py");
const result = spawnSync(blender, ["--background", "--factory-startup", "--python", script, "--", projectRoot], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: false,
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
