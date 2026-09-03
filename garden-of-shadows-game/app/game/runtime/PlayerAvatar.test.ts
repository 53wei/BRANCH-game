import { describe, expect, it } from "vitest";
import { PLAYER_BODY_CALIBRATION, playerPoseToFeetY } from "./player-calibration";
import { PlayerAvatar } from "./PlayerAvatar";

describe("PlayerAvatar", () => {
  it("keeps only a geometry-free first-person anchor in formal Runtime", () => {
    const avatar = new PlayerAvatar();
    avatar.update({ x: 11.5, y: PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY, z: 52.2 }, 0.68, false, 0);

    expect(avatar.root.name).toBe("Player_ZhaoYing_FirstPersonAnchor");
    expect(avatar.root.position.x).toBe(11.5);
    expect(avatar.root.position.y).toBeCloseTo(playerPoseToFeetY(PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY));
    expect(avatar.root.position.z).toBe(52.2);
    expect(avatar.root.visible).toBe(false);
    expect(avatar.root.children).toHaveLength(0);
  });
});
