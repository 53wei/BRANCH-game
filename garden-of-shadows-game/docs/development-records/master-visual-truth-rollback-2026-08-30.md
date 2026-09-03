# Master Visual Truth Rollback — 2026-08-30

## Why this rollback exists

The runtime drifted away from the authored Blender Master: the outer mountain/terrain envelope and transition planting were hidden, generic imported wrapper roots were hidden, and large Runtime Ground Patch meshes were drawn over the authored surface. That combination made the playable view look like an empty black void with flat/uneven replacement ground even though the source Master itself had not been deleted.

## Source of visual truth

Normal gameplay must preserve the authored Master Scene. These roots are mandatory visual content and must remain visible:

- `A_OuterGarden_Environment`
- `A_MountainBackdrop_Group`
- `A_TransitionPlanting`
- `A_ExpandedBoundary`
- `B_CoreGarden_Primary`

`B_CoreGarden_Primary` is the live B-side garden/model root. It was not deleted from `TYX_Master_Scene.glb` and remains a required node in the runtime asset manifest.

Only explicit backup/source-template roots may be hidden by default. `B_CoreGarden_Backup` stays hidden because the primary B garden is the formal scene. Generic `Sketchfab_model` / `skfb_offset` roots must not be hidden by name because they can own visible descendants.

## Ground policy

The Blender-authored terrain/paving is the visual ground in Master mode.

Runtime ground boxes continue to exist in Rapier as collision/support geometry, but their rectangular meshes are not rendered in normal gameplay. Diagnostic rendering is opt-in only via `runtimeGround=1`, `debugOverlay=1`, or `debugMap=1`.

This prevents Runtime patches from covering the original terrain with flat dark/green slabs or creating visible seams/depressions.

## Debug policy

Normal gameplay must never use a map-audit camera automatically.

- `debugMap=1` / `mapAudit=1`: top-down map audit camera.
- `debugOverlay=1`: collider/trigger overlays without forcing the normal player camera into a map view.
- legacy `debugLayout=1`: no longer means “replace gameplay with a top-down map”.

`visualTest=1` by itself must not skip the prologue narrative. Only an explicit `visualScenario=...` or `skipNarrative=1` may jump directly into gameplay for regression capture.

## Development order from this point

1. Restore and visually verify the full Master scene first.
2. Confirm A + B + outer terrain/mountain are present in Runtime.
3. Confirm the player starts at the intended main entrance and can enter A.
4. Then continue prologue/Chapter One content work.
5. Profile performance after the actual playable content and final scene state exist; optimization must not hide/delete authored visual roots.

## Visual acceptance gate

Before adding more chapter content, capture/inspect these views in normal first-person gameplay (no `debugMap`, no `runtimeGround`):

1. Main gate / outer boundary: mountain and exterior terrain visible behind/around the authored boundary.
2. A-zone interior: authored paving/terrain visible; no rectangular Runtime Ground Patch seams.
3. Looking toward the B-side: `B_CoreGarden_Primary` architecture/garden remains present.
4. Blender overview comparison: Runtime must preserve the same two-cluster + outer terrain composition at the scene level, even though the player only sees a first-person subset at any one moment.

If any mandatory root is missing, stop content development and fix the visual load/visibility path first.
