import fs from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import type { Plugin } from "vite";

interface PreviewCatalogEntry {
  id: string;
  title: string;
  relativeSourcePath: string;
  previewMode: "raw" | "compatibility-copy";
  bytes?: number;
  author?: string;
  sourceUrl?: string;
  license?: string;
  intendedUse?: string;
  classification?: string;
  metrics?: { nodes?: number; meshes?: number; materials?: number; textures?: number; trianglesApprox?: number };
  bounds?: { size?: [number, number, number] };
  extensionsRequired?: string[];
  [key: string]: unknown;
}

interface RuntimeCatalogEntry {
  id: string;
  file: string;
  bytes: number;
  sourceAssetIds: string[];
  license: string;
  status: string;
  optimizationStage?: string;
  extensionsRequired?: string[];
  nodes?: string[];
}

export function devAssetPreviewPlugin(): Plugin {
  const projectRoot = path.resolve(import.meta.dirname, "../..");
  const docsRoot = path.join(projectRoot, "docs", "assets");
  const catalogPath = path.join(docsRoot, "downloaded-3d-assets.json");
  const runtimeCatalogPath = path.join(docsRoot, "runtime-assets.json");
  const compatibilityFiles: Record<string, string> = {
    // Generated reproducibly by scripts/assets/build_runtime_assets.py from the
    // untouched audited Low Bridge source. Blender import/export performs the
    // legacy Spec/Gloss -> metallic-roughness compatibility conversion.
    "low-bridge": path.join(projectRoot, "assets-source", "blender-working", "runtime-raw", "TYX_GMP_Bridge_Low_A.glb"),
  };
  const runtimeWorkingFiles: Record<string, string> = {
    "traditional-chinese-siheyuan-courtyard": path.join(projectRoot, "assets-source", "blender-working", "fidelity", "TYX_ARCH_Siheyuan_Source_A.glb"),
    "ancient-chinese-courtyard-park": path.join(projectRoot, "assets-source", "blender-working", "fidelity", "TYX_ENV_Courtyard_Park_Source_A.glb"),
  };
  const runtimePublicFiles: Record<string, string> = {
    "traditional-chinese-siheyuan-courtyard": path.join(projectRoot, "public", "assets", "fidelity", "architecture", "TYX_ARCH_Siheyuan_Source_A.glb"),
    "ancient-chinese-courtyard-park": path.join(projectRoot, "public", "assets", "fidelity", "environment", "TYX_ENV_Courtyard_Park_Source_A.glb"),
  };

  const readCatalog = (): PreviewCatalogEntry[] => JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const readRuntimeCatalog = (): RuntimeCatalogEntry[] => fs.existsSync(runtimeCatalogPath)
    ? JSON.parse(fs.readFileSync(runtimeCatalogPath, "utf8"))
    : [];

  const resolveModel = (entry: PreviewCatalogEntry) => {
    const compatibilityPath = compatibilityFiles[entry.id];
    if (entry.previewMode === "compatibility-copy" && compatibilityPath && fs.existsSync(compatibilityPath)) return compatibilityPath;
    return path.resolve(projectRoot, entry.relativeSourcePath);
  };

  const resolveRuntimeWorkingModel = (entry: PreviewCatalogEntry) => {
    const optimizedPath = runtimePublicFiles[entry.id];
    if (optimizedPath && fs.existsSync(optimizedPath)) return optimizedPath;
    const sourcePath = path.resolve(projectRoot, entry.relativeSourcePath);
    const workingPath = runtimeWorkingFiles[entry.id];
    if (!workingPath) return sourcePath;
    fs.mkdirSync(path.dirname(workingPath), { recursive: true });
    const sourceStat = fs.statSync(sourcePath);
    if (!fs.existsSync(workingPath) || fs.statSync(workingPath).size !== sourceStat.size) fs.copyFileSync(sourcePath, workingPath);
    return workingPath;
  };

  const runtimeFile = (runtime: RuntimeCatalogEntry, sources: PreviewCatalogEntry[]) => {
    const sourceId = runtime.sourceAssetIds.find((id) => runtimeWorkingFiles[id]);
    if (sourceId) {
      const source = sources.find((entry) => entry.id === sourceId);
      if (source) return resolveRuntimeWorkingModel(source);
    }
    return path.join(projectRoot, "public", runtime.file.replace(/^\//, ""));
  };

  const serveFile = (request: IncomingMessage, response: ServerResponse, filePath?: string) => {
    if (!filePath || !fs.existsSync(filePath)) {
      response.statusCode = 404;
      response.end("Asset file unavailable");
      return;
    }
    const stat = fs.statSync(filePath);
    response.setHeader("Content-Type", "model/gltf-binary");
    response.setHeader("Content-Length", String(stat.size));
    response.setHeader("Cache-Control", "no-store");
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  };

  return {
    name: "tingyuxuan-dev-asset-preview",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__asset-preview/catalog", (_request, response) => {
        const sources = readCatalog();
        const sourceCards = sources.map((entry) => ({
          ...entry,
          previewUrl: "/__asset-preview/model/" + encodeURIComponent(entry.id),
        }));
        const runtimeCards = readRuntimeCatalog().map((runtime) => {
          const source = sources.find((entry) => runtime.sourceAssetIds.includes(entry.id));
          return {
            id: `runtime:${runtime.id}`,
            title: `Runtime · ${runtime.id}`,
            bytes: runtime.bytes,
            author: source?.author ?? "Project / derived runtime asset",
            sourceUrl: source?.sourceUrl ?? "/credits",
            license: runtime.license,
            intendedUse: `${runtime.optimizationStage ?? "runtime"} · ${runtime.file}`,
            classification: runtime.status,
            previewMode: "raw" as const,
            previewUrl: "/__asset-preview/runtime/" + encodeURIComponent(runtime.id),
            metrics: {
              nodes: runtime.nodes?.length ?? 0,
              meshes: source?.metrics?.meshes ?? 0,
              materials: source?.metrics?.materials ?? 0,
              textures: source?.metrics?.textures ?? 0,
              trianglesApprox: source?.metrics?.trianglesApprox ?? 0,
            },
            bounds: source?.bounds ?? { size: [0, 0, 0] },
            extensionsRequired: runtime.extensionsRequired ?? [],
          };
        });
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader("Cache-Control", "no-store");
        response.end(JSON.stringify([...sourceCards, ...runtimeCards]));
      });

      server.middlewares.use("/__asset-preview/model", (request, response) => {
        const id = decodeURIComponent((request.url ?? "").replace(/^\//, "").split("?")[0]);
        const entry = readCatalog().find((candidate) => candidate.id === id);
        serveFile(request, response, entry ? resolveModel(entry) : undefined);
      });

      server.middlewares.use("/__asset-preview/runtime", (request, response) => {
        const id = decodeURIComponent((request.url ?? "").replace(/^\//, "").split("?")[0]);
        const sources = readCatalog();
        const runtime = readRuntimeCatalog().find((candidate) => candidate.id === id);
        serveFile(request, response, runtime ? runtimeFile(runtime, sources) : undefined);
      });

      server.middlewares.use("/__runtime-source/model", (request, response) => {
        const id = decodeURIComponent((request.url ?? "").replace(/^\//, "").split("?")[0]);
        const entry = readCatalog().find((candidate) => candidate.id === id);
        serveFile(request, response, entry ? resolveRuntimeWorkingModel(entry) : undefined);
      });
    },
  };
}
