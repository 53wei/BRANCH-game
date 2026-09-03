import { describe, expect, it } from "vitest";
import * as THREE from "three/webgpu";
import { buildChapterOneSliceVisuals } from "./vertical-slice-visuals";
import { CH1_REWARD_POINTS, CH1_TRACES } from "./vertical-slice-content";

const formalAssetSource = () => {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.5, 1),
    new THREE.MeshStandardMaterial({ color: "#6a6557", roughness: 0.88 }),
  ));
  return group;
};

describe("chapter-one vertical slice visuals", () => {
  it("uses an authored-asset clone for the borrowed stepping stone and no engineering ring marker", async () => {
    const requested: string[] = [];
    const visuals = await buildChapterOneSliceVisuals({
      cloneFormalAsset: async (id: string, nodeName?: string) => {
        requested.push(`${id}:${nodeName ?? "root"}`);
        return formalAssetSource();
      },
    } as never);

    expect(visuals.traceObjects.size).toBe(CH1_TRACES.length);
    expect(visuals.rewardObjects.size).toBe(CH1_REWARD_POINTS.length);
    expect(requested).toContain("tyx-nat-rock-set-a:Rock_A");
    expect(visuals.portalSurface.visible).toBe(false);
    expect(visuals.borrowSource.visible).toBe(false);
    expect(visuals.anchorMarker.visible).toBe(false);
    expect(visuals.anchorMarker.children).toHaveLength(0);
    expect(visuals.borrowedStone.visible).toBe(false);
  });
});
