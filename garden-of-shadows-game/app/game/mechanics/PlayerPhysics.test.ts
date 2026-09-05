import { describe, expect, it } from "vitest";
import { PLAYER_MOVEMENT_CALIBRATION } from "../runtime/player-calibration";
import { PlayerPhysics } from "./PlayerPhysics";

describe("PlayerPhysics shared movement contract", () => {
  it("uses grounded-only jumping and the shared movement calibration", async () => {
    const physics = await PlayerPhysics.create(
      { x: 0, y: 0.9, z: 0 },
      [{ id: "ground", center: [0, -0.1, 0], halfExtents: [4, 0.1, 4] }],
    );
    try {
      for (let index = 0; index < 12; index += 1) physics.move({ x: 0, y: 0, z: 0 }, 1 / 60);
      expect(physics.isGrounded()).toBe(true);

      const groundY = physics.pose().y;
      expect(physics.requestJump()).toBe(true);
      let peakY = groundY;
      for (let index = 0; index < 22; index += 1) {
        const pose = physics.move({ x: 0, y: 0, z: 0 }, 1 / 60);
        peakY = Math.max(peakY, pose.y);
        if (index === 2) expect(physics.requestJump()).toBe(false);
      }

      const expectedApexRise = PLAYER_MOVEMENT_CALIBRATION.jumpSpeed ** 2
        / (2 * Math.abs(PLAYER_MOVEMENT_CALIBRATION.gravity));
      expect(peakY).toBeGreaterThan(groundY + 0.2);
      expect(peakY).toBeLessThan(groundY + expectedApexRise + 0.12);
    } finally {
      physics.dispose();
    }
  });
});
