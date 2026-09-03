import type { ArchitectureCollisionAudit } from "./architecture-collision";
import type { LayoutCollider } from "./tingyuxuan-layout";
import type { SpecialStructureCollisionAudit, TrimeshColliderDefinition } from "./special-structure-collision";

interface ArchitectureCollisionSource {
  architectureCollisionBoxes(): readonly LayoutCollider[];
  architectureCollisionAudit(): ArchitectureCollisionAudit;
  specialStructureCollisionMeshes?(): readonly TrimeshColliderDefinition[];
  specialStructureCollisionAudit?(): SpecialStructureCollisionAudit;
}

interface ArchitectureCollisionPhysics {
  addStaticBoxColliders(definitions: readonly LayoutCollider[]): void;
  addStaticTrimeshColliders?(definitions: readonly TrimeshColliderDefinition[]): void;
  colliderAuditSnapshot(): {
    staticColliderCount: number;
    enabledColliderCount: number;
    cameraIgnoredCount: number;
    architectureColliderCount: number;
    masterArchitectureColliderCount: number;
    specialStructureColliderCount: number;
    categoryCounts: Record<string, number>;
    hasStaticArchitecture: boolean;
  };
}

export interface ArchitectureCollisionRuntimeReport {
  scene: ArchitectureCollisionAudit;
  physics: ReturnType<ArchitectureCollisionPhysics["colliderAuditSnapshot"]>;
  specialStructures?: SpecialStructureCollisionAudit;
  routeCoverageComplete: boolean;
  physicsRegistrationComplete: boolean;
  specialStructureRegistrationComplete: boolean;
  complete: boolean;
}

/**
 * Single registration path shared by every formal 3D runtime. It proves the
 * chain Master Scene -> generated colliders -> Rapier world and exposes the
 * same immutable report to browser regression tooling.
 */
export const registerArchitectureCollisionCoverage = (
  source: ArchitectureCollisionSource,
  physics: ArchitectureCollisionPhysics,
  canvas: HTMLCanvasElement,
): ArchitectureCollisionRuntimeReport => {
  const generated = source.architectureCollisionBoxes();
  physics.addStaticBoxColliders(generated);
  const specialMeshes = source.specialStructureCollisionMeshes?.() ?? [];
  physics.addStaticTrimeshColliders?.(specialMeshes);
  const scene = source.architectureCollisionAudit();
  const specialStructures = source.specialStructureCollisionAudit?.();
  const physicsAudit = physics.colliderAuditSnapshot();
  const routeCoverageComplete = scene.routeCoverage.every((route) => route.complete);
  const physicsRegistrationComplete =
    scene.generatedColliderCount > 0
    && scene.truncatedColliderCount === 0
    && physicsAudit.masterArchitectureColliderCount === scene.generatedColliderCount;
  const specialStructureRegistrationComplete = specialStructures
    ? specialStructures.complete && physicsAudit.specialStructureColliderCount === specialMeshes.length && specialMeshes.length > 0
    : true;
  const complete = routeCoverageComplete && physicsRegistrationComplete && specialStructureRegistrationComplete;
  const report = {
    scene,
    physics: physicsAudit,
    ...(specialStructures ? { specialStructures } : {}),
    routeCoverageComplete,
    physicsRegistrationComplete,
    specialStructureRegistrationComplete,
    complete,
  };

  canvas.dataset.architectureColliderCount = String(physicsAudit.architectureColliderCount);
  canvas.dataset.masterArchitectureColliderCount = String(physicsAudit.masterArchitectureColliderCount);
  canvas.dataset.specialStructureColliderCount = String(physicsAudit.specialStructureColliderCount);
  canvas.dataset.specialStructureCollision = specialStructureRegistrationComplete ? "complete" : "incomplete";
  if (specialStructures) canvas.dataset.specialStructureCollisionReport = JSON.stringify(specialStructures);
  canvas.dataset.automaticArchitectureColliders = "true";
  canvas.dataset.colliderCoverage = complete ? "complete" : "incomplete";
  canvas.dataset.colliderCoverageReport = JSON.stringify(report);

  if (!complete) {
    console.error("[TASK-017] Architecture collision coverage is incomplete.", report);
  }
  return report;
};
