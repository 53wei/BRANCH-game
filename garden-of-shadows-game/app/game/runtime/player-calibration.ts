import { GAMEPLAY_ANCHOR_REFERENCE_Y } from "./tingyuxuan-gameplay-map";

/**
 * TASK-016 single source of truth for the player's physical body and first-person lens.
 * World units are metres (TASK-015). Runtime code must not re-declare these values.
 */
export const PLAYER_BODY_CALIBRATION = {
  adultReferenceHeight: 1.693,
  capsuleHalfHeight: 0.55,
  capsuleRadius: 0.32,
  capsuleTotalHeight: 1.74,
  capsuleGroundedCentreY: GAMEPLAY_ANCHOR_REFERENCE_Y,
  feetClearanceAtReferenceY: GAMEPLAY_ANCHOR_REFERENCE_Y - (0.55 + 0.32),
  eyeOffsetFromCapsuleCentre: 0.74,
  eyeWorldHeightAtReferenceY: GAMEPLAY_ANCHOR_REFERENCE_Y + 0.74,
  explorationFov: 65,
  investigationFov: 58,
  investigationForwardOffset: 0.18,
  cameraNear: 0.05,
  autostepMaxHeight: 0.28,
  autostepMinWidth: 0.18,
  snapToGround: 0.22,
  maxSlopeClimbDegrees: 42,
  minSlopeSlideDegrees: 48,
} as const;

export const playerPoseToFeetY = (poseY: number) => poseY - (PLAYER_BODY_CALIBRATION.capsuleHalfHeight + PLAYER_BODY_CALIBRATION.capsuleRadius);
export const playerPoseToEyeY = (poseY: number) => poseY + PLAYER_BODY_CALIBRATION.eyeOffsetFromCapsuleCentre;
