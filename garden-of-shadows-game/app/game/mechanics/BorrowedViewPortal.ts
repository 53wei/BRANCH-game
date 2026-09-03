import * as THREE from "three/webgpu";
import type { CognitionId } from "./types";

export interface BorrowedViewPortalOptions {
  id: string;
  surface: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  maxDistance?: number;
  resolution?: number;
  renderScale?: number;
}

export class BorrowedViewPortal {
  readonly id: string;
  readonly renderTarget: THREE.RenderTarget;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly maxDistance: number;
  private activeValue = false;

  constructor(private readonly options: BorrowedViewPortalOptions) {
    this.id = options.id;
    const size = Math.max(128, Math.round((options.resolution ?? 512) * (options.renderScale ?? 1)));
    this.renderTarget = new THREE.RenderTarget(size, size, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
    });
    this.renderTarget.texture.colorSpace = THREE.SRGBColorSpace;
    options.surface.material.map = this.renderTarget.texture;
    options.surface.material.needsUpdate = true;
    this.camera = new THREE.PerspectiveCamera();
    this.maxDistance = options.maxDistance ?? 12;
  }

  get active(): boolean {
    return this.activeValue;
  }

  render(
    renderer: THREE.WebGPURenderer,
    scene: THREE.Scene,
    mainCamera: THREE.PerspectiveCamera,
    targetCognition: CognitionId,
    applyVisualCognition: (cognition: CognitionId) => void,
    restoreCognition: () => void,
  ): boolean {
    const portalPosition = new THREE.Vector3();
    this.options.surface.getWorldPosition(portalPosition);
    if (mainCamera.position.distanceTo(portalPosition) > this.maxDistance || !this.options.surface.visible) {
      this.activeValue = false;
      return false;
    }
    this.activeValue = true;
    this.camera.copy(mainCamera, false);
    this.camera.updateProjectionMatrix();
    const wasVisible = this.options.surface.visible;
    this.options.surface.visible = false;
    applyVisualCognition(targetCognition);
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(scene, this.camera);
    renderer.setRenderTarget(null);
    restoreCognition();
    this.options.surface.visible = wasVisible;
    return true;
  }

  dispose(): void {
    this.options.surface.material.map = null;
    this.renderTarget.dispose();
  }
}

