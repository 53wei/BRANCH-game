import * as THREE from "three/webgpu";

export type RendererBackend = "webgpu" | "webgl2";

export interface RendererHandle {
  renderer: THREE.WebGPURenderer;
  backend: RendererBackend;
  antialias: boolean;
  shadowsEnabled: boolean;
  resize: (width: number, height: number, pixelRatio: number) => void;
  dispose: () => void;
}

export async function createRenderer(
  canvas: HTMLCanvasElement,
  options: { forceWebGL: boolean; quality: "high" | "stable" | "low" },
): Promise<RendererHandle> {
  const profileVariant = typeof window === "undefined" ? "full" : new URLSearchParams(window.location.search).get("profile") ?? "full";
  const antialias = true;
  const shadowsEnabled = options.quality !== "low" && profileVariant !== "no-shadows";
  const renderer = new THREE.WebGPURenderer({
    canvas,
    antialias,
    alpha: false,
    forceWebGL: options.forceWebGL,
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.shadowMap.enabled = shadowsEnabled;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  await renderer.init();

  const backend: RendererBackend = !options.forceWebGL && "gpu" in navigator ? "webgpu" : "webgl2";

  return {
    renderer,
    backend,
    antialias,
    shadowsEnabled,
    resize(width, height, pixelRatio) {
      const ratioLimit = options.quality === "high" ? 1.25 : options.quality === "stable" ? 1 : 0.8;
      renderer.setPixelRatio(Math.min(pixelRatio, ratioLimit));
      renderer.setSize(width, height, false);
    },
    dispose() {
      renderer.setAnimationLoop(null);
      renderer.dispose();
    },
  };
}
