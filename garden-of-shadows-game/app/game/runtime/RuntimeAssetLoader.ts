import * as THREE from "three/webgpu";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

export type RuntimeAssetId =
  | "tyx-arch-siheyuan-source-a"
  | "tyx-env-courtyard-park-source-a"
  | "tyx-arch-greybox-fallback-a"
  | "tyx-arch-house-a"
  | "tyx-arch-pavilion-a"
  | "tyx-gmp-bridge-low-a"
  | "tyx-nat-rock-set-a"
  | "tyx-nat-quaternius-set-a";

export const runtimeAssetByteEstimates: Record<RuntimeAssetId, number> = {
  "tyx-arch-siheyuan-source-a": 102934464,
  "tyx-env-courtyard-park-source-a": 24818280,
  "tyx-arch-greybox-fallback-a": 1074276,
  "tyx-arch-house-a": 20093748,
  "tyx-arch-pavilion-a": 8626596,
  "tyx-gmp-bridge-low-a": 2959164,
  "tyx-nat-rock-set-a": 2079652,
  "tyx-nat-quaternius-set-a": 3743932,
};

const runtimeAssetUrls: Record<RuntimeAssetId, string> = {
  "tyx-arch-siheyuan-source-a": process.env.NODE_ENV === "development"
    ? "/__runtime-source/model/traditional-chinese-siheyuan-courtyard"
    : "/assets/fidelity/architecture/TYX_ARCH_Siheyuan_Source_A.glb",
  "tyx-env-courtyard-park-source-a": process.env.NODE_ENV === "development"
    ? "/__runtime-source/model/ancient-chinese-courtyard-park"
    : "/assets/fidelity/environment/TYX_ENV_Courtyard_Park_Source_A.glb",
  // Legacy filename is retained only as an explicit opt-in greybox fallback.
  "tyx-arch-greybox-fallback-a": "/assets/architecture/TYX_ARCH_Kit_A.glb",
  "tyx-arch-house-a": "/assets/architecture/TYX_ARCH_House_A.glb",
  "tyx-arch-pavilion-a": "/assets/architecture/TYX_ARCH_Pavilion_A.glb",
  "tyx-gmp-bridge-low-a": "/assets/gameplay/TYX_GMP_Bridge_Low_A.glb",
  "tyx-nat-rock-set-a": "/assets/nature/TYX_NAT_Rock_Set_A.glb",
  "tyx-nat-quaternius-set-a": "/assets/nature/TYX_NAT_Quaternius_Set_A.glb",
};

export class RuntimeAssetError extends Error {
  constructor(readonly assetId: RuntimeAssetId, reason: unknown) {
    super(`${assetId} 加载失败：${reason instanceof Error ? reason.message : String(reason)}。可切换 WebGL 2 或降低画质后重试。`);
    this.name = "RuntimeAssetError";
  }
}

export class RuntimeAssetLoader {
  private readonly gltfLoader = new GLTFLoader();
  private readonly ktx2Loader = new KTX2Loader();
  private readonly cache = new Map<RuntimeAssetId, THREE.Group>();
  private readonly pending = new Map<RuntimeAssetId, Promise<THREE.Group>>();
  private readonly loadedByteSizes = new Map<RuntimeAssetId, number>();
  private readonly textureCache = new Map<string, THREE.CompressedTexture>();

  private constructor() {
    this.ktx2Loader.setTranscoderPath("/basis/");
    this.gltfLoader.setKTX2Loader(this.ktx2Loader);
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }

  static async create(renderer: THREE.WebGPURenderer) {
    const loader = new RuntimeAssetLoader();
    try {
      await loader.ktx2Loader.detectSupportAsync(renderer);
    } catch (reason) {
      loader.dispose();
      throw new RuntimeAssetError("tyx-arch-siheyuan-source-a", reason);
    }
    return loader;
  }

  async load(id: RuntimeAssetId): Promise<THREE.Group> {
    const cached = this.cache.get(id);
    if (cached) return cached;
    const pending = this.pending.get(id);
    if (pending) return pending;

    const url = runtimeAssetUrls[id];
    const request = Promise.all([
      this.gltfLoader.loadAsync(url),
      fetch(url, { method: "HEAD", cache: "no-store" })
        .then((response) => Number(response.headers.get("content-length")) || runtimeAssetByteEstimates[id])
        .catch(() => runtimeAssetByteEstimates[id]),
    ]).then(([gltf, bytes]) => {
      gltf.scene.name = id;
      this.cache.set(id, gltf.scene);
      this.loadedByteSizes.set(id, bytes);
      return gltf.scene;
    }).catch((reason) => {
      throw new RuntimeAssetError(id, reason);
    }).finally(() => {
      this.pending.delete(id);
    });
    this.pending.set(id, request);
    return request;
  }

  clone(id: RuntimeAssetId, nodeName?: string): THREE.Object3D {
    const root = this.cache.get(id);
    if (!root) throw new RuntimeAssetError(id, "asset was not loaded before cloning");
    const source = nodeName ? root.getObjectByName(nodeName) : root;
    if (!source) throw new RuntimeAssetError(id, `required node ${nodeName} is missing`);
    const clone = source.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }

  async loadTexture(url: string): Promise<THREE.CompressedTexture> {
    const cached = this.textureCache.get(url);
    if (cached) return cached;
    try {
      const texture = await this.ktx2Loader.loadAsync(url);
      this.textureCache.set(url, texture);
      return texture;
    } catch (reason) {
      throw new RuntimeAssetError("tyx-arch-siheyuan-source-a", `KTX2 material ${url}: ${reason instanceof Error ? reason.message : String(reason)}`);
    }
  }

  loadedAssetIds(): RuntimeAssetId[] {
    return [...this.cache.keys()];
  }

  loadedByteEstimate(): number {
    return this.loadedAssetIds().reduce((sum, id) => sum + (this.loadedByteSizes.get(id) ?? runtimeAssetByteEstimates[id]), 0);
  }

  dispose() {
    this.textureCache.forEach((texture) => texture.dispose());
    this.textureCache.clear();
    this.pending.clear();
    this.loadedByteSizes.clear();
    this.cache.clear();
    this.ktx2Loader.dispose();
  }
}
