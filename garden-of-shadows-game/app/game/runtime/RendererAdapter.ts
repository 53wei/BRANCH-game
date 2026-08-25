import * as THREE from "three/webgpu";

export type RendererBackend = "webgpu" | "webgl2";

export interface RendererHandle {
  renderer: THREE.WebGPURenderer;
  backend: RendererBackend;
  resize: (width: number, height: number, pixelRatio: number) => void;
  dispose: () => void;
}

export async function createRenderer(
  canvas: HTMLCanvasElement,
  options: { forceWebGL: boolean; quality: "high" | "stable" | "low" },
): Promise<RendererHandle> {
  const renderer = new THREE.WebGPURenderer({
    canvas,
    antialias: options.quality !== "low",
    alpha: false,
    forceWebGL: options.forceWebGL,
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = options.quality !== "low";
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  await renderer.init();

  const backend: RendererBackend = !options.forceWebGL && "gpu" in navigator ? "webgpu" : "webgl2";

  return {
    renderer,
    backend,
    resize(width, height, pixelRatio) {
      const ratioLimit = options.quality === "high" ? 1.5 : options.quality === "stable" ? 1 : 0.75;
      renderer.setPixelRatio(Math.min(pixelRatio, ratioLimit));
      renderer.setSize(width, height, false);
    },
    dispose() {
      renderer.setAnimationLoop(null);
      renderer.dispose();
    },
  };
}
