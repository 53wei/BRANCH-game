# 序章字义漂移与最终地图Gameplay继续开发

Generated: 2026-08-29T19:45:26.257Z
Workspace: E:\C_Projects\game
Workspace ID: ws_f966bc7f79245654bf43195f
Write mode: workspace
Bash mode: safe
Tool mode: standard

Purpose: paste this bundle into a high-context ChatGPT model when that model cannot call the CodexPro MCP tools directly.
Instruction for ChatGPT: use this as repository context, produce a narrow Codex execution plan, and avoid inventing files or runtime facts not shown here.

## Repository Tree

.
├── docs/
│   ├── development-records/
│   ├── gdd/
│   └── README.md
├── game-chapter-01/
│   ├── app/
│   ├── db/
│   ├── drizzle/
│   ├── examples/
│   ├── public/
│   ├── tests/
│   ├── worker/
│   ├── drizzle.config.ts
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── tsconfig.json
│   └── vite.config.ts
├── game-chapter-02/
│   ├── app/
│   ├── db/
│   ├── drizzle/
│   ├── examples/
│   ├── public/
│   ├── tests/
│   ├── worker/
│   ├── drizzle.config.ts
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── tsconfig.json
│   └── vite.config.ts
├── garden-of-shadows-game/
│   ├── app/
│   ├── assets-source/
│   ├── docs/
│   ├── public/
│   ├── scripts/
│   ├── worker/
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo
│   ├── vite.config.ts
│   └── vitest.config.ts
├── integration-tests/
│   └── chapter-chain.test.mjs
├── undying-world-game/
│   ├── app/
│   ├── db/
│   ├── drizzle/
│   ├── examples/
│   ├── public/
│   ├── tests/
│   ├── worker/
│   ├── drizzle.config.ts
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── tsconfig.json
│   └── vite.config.ts
├── 游园惊梦_建模落地执行计划_V1.1_已下载资产后实施版.md
├── 游园惊梦_建模与场景资产专项执行计划_V1.0.md
├── 游园惊梦_视觉基础与场景生产执行计划_V1.0_Codex.md
├── 游园惊梦_听雨轩MasterScene建模与空间布局执行计划_V1.0.md
├── 游园惊梦_完整GDD_V4.1_认知结局系统补强版_Master_Source_of_Truth.docx
├── 游园惊梦_序章叙事与字义漂移系统开发计划_V1.0.md
├── 游园惊梦_最终地图剧情与Gameplay完整开发计划_V2.0.md
├── 游园惊梦_最终MasterScene转入Gameplay开发执行计划_V1.0.md
├── 游园惊梦_ND_V3.1_不可靠认知与多结局重构版.md
├── AUDIT_ModelA_Architecture_ID.png
├── AUDIT_ModelA_ArchitectureBatches_Top.png
├── AUDIT_ModelA_Core_Top.png
├── AUDIT_ModelA_FlatCandidates_Top.png
├── AUDIT_ModelA_Full_Top.png
├── AUDIT_ModelA_WallCandidates_Top.png
├── AUDIT_ModelB_Top.png
├── blender_asset_audit_boundary.py
├── blender_asset_audit_compact.py
├── blender_asset_audit_grid.py
├── blender_asset_audit_render.py
├── blender_asset_audit_samples.py
├── blender_asset_audit.py
├── blender_b_side_opening_scan.py
├── blender_connection_component_audit.py
├── blender_connection_ray_audit.py
├── blender_emit_close_review.py
├── blender_emit_fast_final.py
├── blender_emit_review_thumbnails.py
├── blender_fast_scene_finish.py
├── blender_mcp_client.py
├── blender_phase1_connection.py
├── blender_phase1_review_close.py
├── blender_restore_saved_final.py
├── GDD_游园惊梦_完整版.md
├── README.md
├── TingYuXuan_AccidentalUndo_20260829_233200.blend
├── TingYuXuan_Check_Gate.png
├── TingYuXuan_Check_MoonGate.png
├── TingYuXuan_Check_WaterCourt.png
├── TingYuXuan_Check_WestCourt.png
├── TingYuXuan_Current_Perspective.png
├── TingYuXuan_Current_Top.png
├── TingYuXuan_Final_Aerial.png
├── TingYuXuan_Final_Entrance.png
├── TingYuXuan_Final_Top.png
├── TingYuXuan_Master_Plan.png
├── TingYuXuan_Master_TopReview.png
├── TingYuXuan_Master.blend
├── TingYuXuan_Master.blend1
├── TingYuXuan_Master.glb
├── TingYuXuan_Phase0_PreConnection.blend
├── TingYuXuan_Phase1_Positioned.blend
├── TingYuXuan_scan_00.png
├── TingYuXuan_scan_group_01.png
├── TingYuXuan_scan_group_03_top.png
├── TingYuXuan_scan_group_03.png
├── TingYuXuan_scan_group_03b.png
├── TingYuXuan_scan_group_04.png
├── TYX_A_Core_thumb.jpg
├── TYX_arch_id_thumb.jpg
├── TYX_Audit_A_Top_thumb.jpg
├── TYX_Audit_A_Top.png
├── TYX_Audit_AB_Seam_thumb.jpg
├── TYX_Audit_AB_Seam.png
├── TYX_Audit_AB_Top_thumb.jpg
├── TYX_Audit_AB_Top.png
├── TYX_Audit_B_Top_thumb.jpg
├── TYX_Audit_B_Top.png
├── TYX_Audit_Candidate1_Gameplay_thumb.jpg
├── TYX_Audit_Candidate1_Gameplay.png
├── TYX_Audit_Candidate1_Top_thumb.jpg
├── TYX_Audit_Candidate1_Top.png
├── TYX_Audit_Recommended_Gameplay_thumb.jpg
├── TYX_Audit_Recommended_Gameplay.png
├── TYX_Audit_Recommended_Top_thumb.jpg
├── TYX_Audit_Recommended_Top.png
├── TYX_Audit_Seam_Ground_thumb.jpg
├── TYX_Audit_Seam_Ground.png
├── TYX_Audit_Seam_SW_Close_thumb.jpg
├── TYX_Audit_Seam_SW_Close.png
├── TYX_Audit_Seam_Top_Close_thumb.jpg
├── TYX_Audit_Seam_Top_Close.png
├── TYX_Audit_Shift_12_16_thumb.jpg
├── TYX_Audit_Shift_12_16.png
├── TYX_Audit_Shift_8_10_thumb.jpg
├── TYX_Audit_Shift_8_10.png
├── TYX_Boundary_Perspective_thumb.jpg
├── TYX_Boundary_Perspective.png
├── TYX_Boundary_Top_thumb.jpg
├── TYX_Boundary_Top.png
├── TYX_FastFinal_Aerial_thumb.jpg
├── TYX_FastFinal_Aerial.jpg
├── TYX_FastFinal_Connection_thumb.jpg
├── TYX_FastFinal_Connection.jpg
├── TYX_FastFinal_Top_thumb.jpg
├── TYX_FastFinal_Top.jpg
├── TYX_Final_Aerial_thumb.jpg
├── TYX_Final_Entrance_thumb.jpg
├── TYX_Final_Top_thumb.jpg
├── TYX_GateModule_Review_thumb.jpg
├── TYX_GateModule_Review.png
├── TYX_persp_thumb.jpg
├── TYX_Phase1_Close_Gameplay_A_NoTerrain_thumb.jpg
├── TYX_Phase1_Close_Gameplay_A_NoTerrain.jpg
├── TYX_Phase1_Close_Gameplay_A_thumb.jpg
├── TYX_Phase1_Close_Gameplay_A.jpg
├── TYX_Phase1_Close_Gameplay_B_thumb.jpg
├── TYX_Phase1_Close_Gameplay_B.jpg
├── TYX_Phase1_Close_Oblique_thumb.jpg
├── TYX_Phase1_Close_Oblique.jpg
├── TYX_Phase1_Close_Top_thumb.jpg
├── TYX_Phase1_Close_Top.jpg
├── TYX_Phase1_Connection_Gameplay_thumb.jpg
├── TYX_Phase1_Connection_Gameplay.jpg
├── TYX_Phase1_Connection_Gameplay.png
├── TYX_Phase1_Connection_Top_thumb.jpg
├── TYX_Phase1_Connection_Top.jpg
├── TYX_Phase1_Connection_Top.png
├── TYX_SourceWall_Closeup_thumb.jpg
├── TYX_SourceWall_Closeup.png
├── TYX_top_thumb.jpg
├── TYX_WallGate_Review_thumb.jpg
├── TYX_WallModule_Review_thumb.jpg
└── TYX_WallModule_Review.png

## Git Status

```text
## main...origin/main [behind 1]
 M garden-of-shadows-game/app/game/GameRuntime.tsx
 M garden-of-shadows-game/app/game/NorthTowerRuntime.tsx
A  garden-of-shadows-game/app/game/campaign-mechanics-save.test.ts
 M garden-of-shadows-game/app/game/campaign-save.ts
 M garden-of-shadows-game/app/game/manifests/campaign.test.ts
 M garden-of-shadows-game/app/game/manifests/campaign.ts
 M garden-of-shadows-game/app/game/manifests/north-tower-ledger.test.ts
 M garden-of-shadows-game/app/game/manifests/north-tower-ledger.ts
 M garden-of-shadows-game/app/game/manifests/north-tower-objectives.ts
 M garden-of-shadows-game/app/game/manifests/west-corridor.ts
 M garden-of-shadows-game/app/game/manifests/west-onboarding.ts
A  garden-of-shadows-game/app/game/mechanics/BorrowAnchorController.ts
A  garden-of-shadows-game/app/game/mechanics/BorrowedViewPortal.ts
AM garden-of-shadows-game/app/game/mechanics/CameraRig.ts
A  garden-of-shadows-game/app/game/mechanics/CharacterAnimationState.ts
A  garden-of-shadows-game/app/game/mechanics/CognitionController.ts
A  garden-of-shadows-game/app/game/mechanics/EvidenceLedger.ts
AM garden-of-shadows-game/app/game/mechanics/InteractionController.ts
A  garden-of-shadows-game/app/game/mechanics/LoopController.ts
A  garden-of-shadows-game/app/game/mechanics/MechanicsOrchestrator.ts
A  garden-of-shadows-game/app/game/mechanics/NarrativeGateController.ts
A  garden-of-shadows-game/app/game/mechanics/PlayerPhysics.ts
A  garden-of-shadows-game/app/game/mechanics/PuzzleController.ts
A  garden-of-shadows-game/app/game/mechanics/interaction.test.ts
A  garden-of-shadows-game/app/game/mechanics/mechanics.test.ts
A  garden-of-shadows-game/app/game/mechanics/save.ts
A  garden-of-shadows-game/app/game/mechanics/types.ts
 M garden-of-shadows-game/app/game/narrative/west-onboarding.ink
 M garden-of-shadows-game/app/game/narrative/west-onboarding.json
 M garden-of-shadows-game/app/game/runtime/AudioAtmosphere.ts
 M garden-of-shadows-game/app/game/runtime/NorthTowerScene.test.ts
 M garden-of-shadows-game/app/game/runtime/NorthTowerScene.ts
 M garden-of-shadows-game/app/game/runtime/PhysicsController.ts
 M garden-of-shadows-game/app/game/runtime/RuntimeAssetLoader.ts
 M garden-of-shadows-game/app/game/runtime/TingYuXuanScene.ts
 M garden-of-shadows-game/app/game/runtime/UnifiedMaterials.ts
 M garden-of-shadows-game/app/game/runtime/tingyuxuan-layout.test.ts
 M garden-of-shadows-game/app/game/runtime/tingyuxuan-layout.ts
 M garden-of-shadows-game/app/game/runtime/west-chapter-walkthrough.test.ts
 M garden-of-shadows-game/app/game/types.ts
 M garden-of-shadows-game/app/globals.css
 M garden-of-shadows-game/app/page.tsx
 M garden-of-shadows-game/docs/assets/ASSET_MANIFEST.md
 M garden-of-shadows-game/docs/assets/runtime-assets.json
A  garden-of-shadows-game/docs/design/mechanics/mechanics-orchestrator.md
A  garden-of-shadows-game/docs/design/mechanics/repo-reality-audit.md
A  garden-of-shadows-game/docs/design/mechanics/trust-deprecation.md
 M garden-of-shadows-game/docs/visual-regression/after/capture-metrics.json
 M garden-of-shadows-game/docs/visual-regression/after/curved-corridor.png
 M garden-of-shadows-game/docs/visual-regression/after/front-hall.png
 M garden-of-shadows-game/docs/visual-regression/after/moon-gate-window.png
 M garden-of-shadows-game/docs/visual-regression/after/spawn-front-view.png
 M garden-of-shadows-game/docs/visual-regression/after/west-courtyard.png
 M garden-of-shadows-game/docs/visual-regression/phase-one-acceptance.json
 M garden-of-shadows-game/package.json
 M garden-of-shadows-game/public/assets/gameplay/TYX_GMP_Bridge_Low_A.glb
 M garden-of-shadows-game/scripts/assets/prepare-runtime.mjs
 M garden-of-shadows-game/scripts/visual/capture-regression.mjs
 M garden-of-shadows-game/scripts/visual/verify-regression.mjs
?? AUDIT_ModelA_ArchitectureBatches_Top.png
?? AUDIT_ModelA_Architecture_ID.png
?? AUDIT_ModelA_Core_Top.png
?? AUDIT_ModelA_FlatCandidates_Top.png
?? AUDIT_ModelA_Full_Top.png
?? AUDIT_ModelA_WallCandidates_Top.png
?? AUDIT_ModelB_Top.png
?? TYX_A_Core_thumb.jpg
?? TYX_Audit_AB_Seam.png
?? TYX_Audit_AB_Seam_thumb.jpg
?? TYX_Audit_AB_Top.png
?? TYX_Audit_AB_Top_thumb.jpg
?? TYX_Audit_A_Top.png
?? TYX_Audit_A_Top_thumb.jpg
?? TYX_Audit_B_Top.png
?? TYX_Audit_B_Top_thumb.jpg
?? TYX_Audit_Candidate1_Gameplay.png
?? TYX_Audit_Candidate1_Gameplay_thumb.jpg
?? TYX_Audit_Candidate1_Top.png
?? TYX_Audit_Candidate1_Top_thumb.jpg
?? TYX_Audit_Recommended_Gameplay.png
?? TYX_Audit_Recommended_Gameplay_thumb.jpg
?? TYX_Audit_Recommended_Top.png
?? TYX_Audit_Recommended_Top_thumb.jpg
?? TYX_Audit_Seam_Ground.png
?? TYX_Audit_Seam_Ground_thumb.jpg
?? TYX_Audit_Seam_SW_Close.png
?? TYX_Audit_Seam_SW_Close_thumb.jpg
?? TYX_Audit_Seam_Top_Close.png
?? TYX_Audit_Seam_Top_Close_thumb.jpg
?? TYX_Audit_Shift_12_16.png
?? TYX_Audit_Shift_12_16_thumb.jpg
?? TYX_Audit_Shift_8_10.png
?? TYX_Audit_Shift_8_10_thumb.jpg
?? TYX_Boundary_Perspective.png
?? TYX_Boundary_Perspective_thumb.jpg
?? TYX_Boundary_Top.png
?? TYX_Boundary_Top_thumb.jpg
?? TYX_FastFinal_Aerial.jpg
?? TYX_FastFinal_Aerial_thumb.jpg
?? TYX_FastFinal_Connection.jpg
?? TYX_FastFinal_Connection_thumb.jpg
?? TYX_FastFinal_Top.jpg
?? TYX_FastFinal_Top_thumb.jpg
?? TYX_Final_Aerial_thumb.jpg
?? TYX_Final_Entrance_thumb.jpg
?? TYX_Final_Top_thumb.jpg
?? TYX_GateModule_Review.png
?? TYX_GateModule_Review_thumb.jpg
?? TYX_Phase1_Close_Gameplay_A.jpg
?? TYX_Phase1_Close_Gameplay_A_NoTerrain.jpg
?? TYX_Phase1_Close_Gameplay_A_NoTerrain_thumb.jpg
?? TYX_Phase1_Close_Gameplay_A_thumb.jpg
?? TYX_Phase1_Close_Gameplay_B.jpg
?? TYX_Phase1_Close_Gameplay_B_thumb.jpg
?? TYX_Phase1_Close_Oblique.jpg
?? TYX_Phase1_Close_Oblique_thumb.jpg
?? TYX_Phase1_Close_Top.jpg
?? TYX_Phase1_Close_Top_thumb.jpg
?? TYX_Phase1_Connection_Gameplay.jpg
?? TYX_Phase1_Connection_Gameplay.png
?? TYX_Phase1_Connection_Gameplay_thumb.jpg
?? TYX_Phase1_Connection_Top.jpg
?? TYX_Phase1_Connection_Top.png
?? TYX_Phase1_Connection_Top_thumb.jpg
?? TYX_SourceWall_Closeup.png
?? TYX_SourceWall_Closeup_thumb.jpg
?? TYX_WallGate_Review_thumb.jpg
?? TYX_WallModule_Review.png
?? TYX_WallModule_Review_thumb.jpg
?? TYX_arch_id_thumb.jpg
?? TYX_persp_thumb.jpg
?? TYX_top_thumb.jpg
?? TingYuXuan_AccidentalUndo_20260829_233200.blend
?? TingYuXuan_Check_Gate.png
?? TingYuXuan_Check_MoonGate.png
?? TingYuXuan_Check_WaterCourt.png
?? TingYuXuan_Check_WestCourt.png
?? TingYuXuan_Current_Perspective.png
?? TingYuXuan_Current_Top.png
?? TingYuXuan_Final_Aerial.png
?? TingYuXuan_Final_Entrance.png
?? TingYuXuan_Final_Top.png
?? TingYuXuan_Master.blend
?? TingYuXuan_Master.blend1
?? TingYuXuan_Master.glb
?? TingYuXuan_Master_Plan.png
?? TingYuXuan_Master_TopReview.png
?? TingYuXuan_Phase0_PreConnection.blend
?? TingYuXuan_Phase1_Positioned.blend
?? TingYuXuan_scan_00.png
?? TingYuXuan_scan_group_01.png
?? TingYuXuan_scan_group_03.png
?? TingYuXuan_scan_group_03_top.png
?? TingYuXuan_scan_group_03b.png
?? TingYuXuan_scan_group_04.png
?? blender_asset_audit.py
?? blender_asset_audit_boundary.py
?? blender_asset_audit_compact.py
?? blender_asset_audit_grid.py
?? blender_asset_audit_render.py
?? blender_asset_audit_samples.py
?? blender_b_side_opening_scan.py
?? blender_connection_component_audit.py
?? blender_connection_ray_audit.py
?? blender_emit_close_review.py
?? blender_emit_fast_final.py
?? blender_emit_review_thumbnails.py
?? blender_fast_scene_finish.py
?? blender_mcp_client.py
?? blender_phase1_connection.py
?? blender_phase1_review_close.py
?? blender_restore_saved_final.py
?? garden-of-shadows-game/app/dev/mechanics/
?? garden-of-shadows-game/app/game/MissingRoomRuntime.tsx
?? garden-of-shadows-game/app/game/manifests/missing-room.ts
?? garden-of-shadows-game/app/game/mechanics/playground-content.ts
?? garden-of-shadows-game/app/game/runtime/tingyuxuan-gameplay-map.test.ts
?? garden-of-shadows-game/app/game/runtime/tingyuxuan-gameplay-map.ts
?? garden-of-shadows-game/docs/design/mechanics/borrow-anchor.md
?? garden-of-shadows-game/docs/design/mechanics/borrowed-view.md
?? garden-of-shadows-game/docs/design/mechanics/camera-character.md
?? garden-of-shadows-game/docs/design/mechanics/cognition-state.md
?? garden-of-shadows-game/docs/design/mechanics/evidence.md
?? garden-of-shadows-game/docs/design/mechanics/investigation.md
?? garden-of-shadows-game/docs/design/mechanics/narrative-gates.md
?? garden-of-shadows-game/docs/design/mechanics/v42-execution-status.md
?? garden-of-shadows-game/docs/development-records/tingyuxuan-master-first-walkable.md
?? garden-of-shadows-game/public/assets/fidelity/TYX_Master_Scene.glb
?? garden-of-shadows-game/public/assets/fidelity/architecture/
?? "\346\270\270\345\233\255\346\203\212\346\242\246_ND_V3.1_\344\270\215\345\217\257\351\235\240\350\256\244\347\237\245\344\270\216\345\244\232\347\273\223\345\261\200\351\207\215\346\236\204\347\211\210.md"
?? "\346\270\270\345\233\255\346\203\212\346\242\246_\345\220\254\351\233\250\350\275\251MasterScene\345\273\272\346\250\241\344\270\216\347\251\272\351\227\264\345\270\203\345\261\200\346\211\247\350\241\214\350\256\241\345\210\222_V1.0.md"
?? "\346\270\270\345\233\255\346\203\212\346\242\246_\345\256\214\346\225\264GDD_V4.1_\350\256\244\347\237\245\347\273\223\345\261\200\347\263\273\347\273\237\350\241\245\345\274\272\347\211\210_Master_Source_of_Truth.docx"
?? "\346\270\270\345\233\255\346\203\212\346\242\246_\345\272\217\347\253\240\345\217\231\344\272\213\344\270\216\345\255\227\344\271\211\346\274\202\347\247\273\347\263\273\347\273\237\345\274\200\345\217\221\350\256\241\345\210\222_V1.0.md"
?? "\346\270\270\345\233\255\346\203\212\346\242\246_\346\234\200\347\273\210MasterScene\350\275\254\345\205\245Gameplay\345\274\200\345\217\221\346\211\247\350\241\214\350\256\241\345\210\222_V1.0.md"
?? "\346\270\270\345\233\255\346\203\212\346\242\246_\346\234\200\347\273\210\345\234\260\345\233\276\345\211\247\346\203\205\344\270\216Gameplay\345\256\214\346\225\264\345\274\200\345\217\221\350\256\241\345\210\222_V2.0.md"
```

## Recent Commits

```text
182ef74 (HEAD -> main) feat: integrate source-faithful TingYuXuan visuals
ea508f6 merge: integrate codex/chapter-2-north-tower with local west corridor work
4d31f8e feat: local west corridor and onboarding development progress
196100d fix: restart completed north tower chapter
4fde1b6 feat: deepen chapter two investigation flow
bdffd46 feat: add visual novel story scenes to chapter two
a46b04c feat: make north tower chapter testable
ab1d4a4 fix: support keyboard controls without pointer lock
```

## Selected Files

Changed files detected: garden-of-shadows-game/app/game/GameRuntime.tsx, garden-of-shadows-game/app/game/NorthTowerRuntime.tsx, garden-of-shadows-game/app/game/campaign-mechanics-save.test.ts, garden-of-shadows-game/app/game/campaign-save.ts, garden-of-shadows-game/app/game/manifests/campaign.test.ts, garden-of-shadows-game/app/game/manifests/campaign.ts, garden-of-shadows-game/app/game/manifests/north-tower-ledger.test.ts, garden-of-shadows-game/app/game/manifests/north-tower-ledger.ts, garden-of-shadows-game/app/game/manifests/north-tower-objectives.ts, garden-of-shadows-game/app/game/manifests/west-corridor.ts, garden-of-shadows-game/app/game/manifests/west-onboarding.ts, garden-of-shadows-game/app/game/mechanics/BorrowAnchorController.ts, garden-of-shadows-game/app/game/mechanics/BorrowedViewPortal.ts, garden-of-shadows-game/app/game/mechanics/CameraRig.ts, garden-of-shadows-game/app/game/mechanics/CharacterAnimationState.ts, garden-of-shadows-game/app/game/mechanics/CognitionController.ts, garden-of-shadows-game/app/game/mechanics/EvidenceLedger.ts, garden-of-shadows-game/app/game/mechanics/InteractionController.ts, garden-of-shadows-game/app/game/mechanics/LoopController.ts, garden-of-shadows-game/app/game/mechanics/MechanicsOrchestrator.ts, garden-of-shadows-game/app/game/mechanics/NarrativeGateController.ts, garden-of-shadows-game/app/game/mechanics/PlayerPhysics.ts, garden-of-shadows-game/app/game/mechanics/PuzzleController.ts, garden-of-shadows-game/app/game/mechanics/interaction.test.ts, garden-of-shadows-game/app/game/mechanics/mechanics.test.ts, garden-of-shadows-game/app/game/mechanics/save.ts, garden-of-shadows-game/app/game/mechanics/types.ts, garden-of-shadows-game/app/game/narrative/west-onboarding.ink, garden-of-shadows-game/app/game/narrative/west-onboarding.json, garden-of-shadows-game/app/game/runtime/AudioAtmosphere.ts, garden-of-shadows-game/app/game/runtime/NorthTowerScene.test.ts, garden-of-shadows-game/app/game/runtime/NorthTowerScene.ts, garden-of-shadows-game/app/game/runtime/PhysicsController.ts, garden-of-shadows-game/app/game/runtime/RuntimeAssetLoader.ts, garden-of-shadows-game/app/game/runtime/TingYuXuanScene.ts, garden-of-shadows-game/app/game/runtime/UnifiedMaterials.ts, garden-of-shadows-game/app/game/runtime/tingyuxuan-layout.test.ts, garden-of-shadows-game/app/game/runtime/tingyuxuan-layout.ts, garden-of-shadows-game/app/game/runtime/west-chapter-walkthrough.test.ts, garden-of-shadows-game/app/game/types.ts, garden-of-shadows-game/app/globals.css, garden-of-shadows-game/app/page.tsx, garden-of-shadows-game/docs/assets/ASSET_MANIFEST.md, garden-of-shadows-game/docs/assets/runtime-assets.json, garden-of-shadows-game/docs/design/mechanics/mechanics-orchestrator.md, garden-of-shadows-game/docs/design/mechanics/repo-reality-audit.md, garden-of-shadows-game/docs/design/mechanics/trust-deprecation.md, garden-of-shadows-game/docs/visual-regression/after/capture-metrics.json, garden-of-shadows-game/docs/visual-regression/after/curved-corridor.png, garden-of-shadows-game/docs/visual-regression/after/front-hall.png, garden-of-shadows-game/docs/visual-regression/after/moon-gate-window.png, garden-of-shadows-game/docs/visual-regression/after/spawn-front-view.png, garden-of-shadows-game/docs/visual-regression/after/west-courtyard.png, garden-of-shadows-game/docs/visual-regression/phase-one-acceptance.json, garden-of-shadows-game/package.json, garden-of-shadows-game/public/assets/gameplay/TYX_GMP_Bridge_Low_A.glb, garden-of-shadows-game/scripts/assets/prepare-runtime.mjs, garden-of-shadows-game/scripts/visual/capture-regression.mjs, garden-of-shadows-game/scripts/visual/verify-regression.mjs, AUDIT_ModelA_ArchitectureBatches_Top.png, AUDIT_ModelA_Architecture_ID.png, AUDIT_ModelA_Core_Top.png, AUDIT_ModelA_FlatCandidates_Top.png, AUDIT_ModelA_Full_Top.png, AUDIT_ModelA_WallCandidates_Top.png, AUDIT_ModelB_Top.png, TYX_A_Core_thumb.jpg, TYX_Audit_AB_Seam.png, TYX_Audit_AB_Seam_thumb.jpg, TYX_Audit_AB_Top.png, TYX_Audit_AB_Top_thumb.jpg, TYX_Audit_A_Top.png, TYX_Audit_A_Top_thumb.jpg, TYX_Audit_B_Top.png, TYX_Audit_B_Top_thumb.jpg, TYX_Audit_Candidate1_Gameplay.png, TYX_Audit_Candidate1_Gameplay_thumb.jpg, TYX_Audit_Candidate1_Top.png, TYX_Audit_Candidate1_Top_thumb.jpg, TYX_Audit_Recommended_Gameplay.png, TYX_Audit_Recommended_Gameplay_thumb.jpg, TYX_Audit_Recommended_Top.png, TYX_Audit_Recommended_Top_thumb.jpg, TYX_Audit_Seam_Ground.png, TYX_Audit_Seam_Ground_thumb.jpg, TYX_Audit_Seam_SW_Close.png, TYX_Audit_Seam_SW_Close_thumb.jpg, TYX_Audit_Seam_Top_Close.png, TYX_Audit_Seam_Top_Close_thumb.jpg, TYX_Audit_Shift_12_16.png, TYX_Audit_Shift_12_16_thumb.jpg, TYX_Audit_Shift_8_10.png, TYX_Audit_Shift_8_10_thumb.jpg, TYX_Boundary_Perspective.png, TYX_Boundary_Perspective_thumb.jpg, TYX_Boundary_Top.png, TYX_Boundary_Top_thumb.jpg, TYX_FastFinal_Aerial.jpg, TYX_FastFinal_Aerial_thumb.jpg, TYX_FastFinal_Connection.jpg, TYX_FastFinal_Connection_thumb.jpg, TYX_FastFinal_Top.jpg, TYX_FastFinal_Top_thumb.jpg, TYX_Final_Aerial_thumb.jpg, TYX_Final_Entrance_thumb.jpg, TYX_Final_Top_thumb.jpg, TYX_GateModule_Review.png, TYX_GateModule_Review_thumb.jpg, TYX_Phase1_Close_Gameplay_A.jpg, TYX_Phase1_Close_Gameplay_A_NoTerrain.jpg, TYX_Phase1_Close_Gameplay_A_NoTerrain_thumb.jpg, TYX_Phase1_Close_Gameplay_A_thumb.jpg, TYX_Phase1_Close_Gameplay_B.jpg, TYX_Phase1_Close_Gameplay_B_thumb.jpg, TYX_Phase1_Close_Oblique.jpg, TYX_Phase1_Close_Oblique_thumb.jpg, TYX_Phase1_Close_Top.jpg, TYX_Phase1_Close_Top_thumb.jpg, TYX_Phase1_Connection_Gameplay.jpg, TYX_Phase1_Connection_Gameplay.png, TYX_Phase1_Connection_Gameplay_thumb.jpg, TYX_Phase1_Connection_Top.jpg, TYX_Phase1_Connection_Top.png, TYX_Phase1_Connection_Top_thumb.jpg, TYX_SourceWall_Closeup.png, TYX_SourceWall_Closeup_thumb.jpg, TYX_WallGate_Review_thumb.jpg, TYX_WallModule_Review.png, TYX_WallModule_Review_thumb.jpg, TYX_arch_id_thumb.jpg, TYX_persp_thumb.jpg, TYX_top_thumb.jpg, TingYuXuan_AccidentalUndo_20260829_233200.blend, TingYuXuan_Check_Gate.png, TingYuXuan_Check_MoonGate.png, TingYuXuan_Check_WaterCourt.png, TingYuXuan_Check_WestCourt.png, TingYuXuan_Current_Perspective.png, TingYuXuan_Current_Top.png, TingYuXuan_Final_Aerial.png, TingYuXuan_Final_Entrance.png, TingYuXuan_Final_Top.png, TingYuXuan_Master.blend, TingYuXuan_Master.blend1, TingYuXuan_Master.glb, TingYuXuan_Master_Plan.png, TingYuXuan_Master_TopReview.png, TingYuXuan_Phase0_PreConnection.blend, TingYuXuan_Phase1_Positioned.blend, TingYuXuan_scan_00.png, TingYuXuan_scan_group_01.png, TingYuXuan_scan_group_03.png, TingYuXuan_scan_group_03_top.png, TingYuXuan_scan_group_03b.png, TingYuXuan_scan_group_04.png, blender_asset_audit.py, blender_asset_audit_boundary.py, blender_asset_audit_compact.py, blender_asset_audit_grid.py, blender_asset_audit_render.py, blender_asset_audit_samples.py, blender_b_side_opening_scan.py, blender_connection_component_audit.py, blender_connection_ray_audit.py, blender_emit_close_review.py, blender_emit_fast_final.py, blender_emit_review_thumbnails.py, blender_fast_scene_finish.py, blender_mcp_client.py, blender_phase1_connection.py, blender_phase1_review_close.py, blender_restore_saved_final.py, garden-of-shadows-game/app/dev/mechanics/, garden-of-shadows-game/app/game/MissingRoomRuntime.tsx, garden-of-shadows-game/app/game/manifests/missing-room.ts, garden-of-shadows-game/app/game/mechanics/playground-content.ts, garden-of-shadows-game/app/game/runtime/tingyuxuan-gameplay-map.test.ts, garden-of-shadows-game/app/game/runtime/tingyuxuan-gameplay-map.ts, garden-of-shadows-game/docs/design/mechanics/borrow-anchor.md, garden-of-shadows-game/docs/design/mechanics/borrowed-view.md, garden-of-shadows-game/docs/design/mechanics/camera-character.md, garden-of-shadows-game/docs/design/mechanics/cognition-state.md, garden-of-shadows-game/docs/design/mechanics/evidence.md, garden-of-shadows-game/docs/design/mechanics/investigation.md, garden-of-shadows-game/docs/design/mechanics/narrative-gates.md, garden-of-shadows-game/docs/design/mechanics/v42-execution-status.md, garden-of-shadows-game/docs/development-records/tingyuxuan-master-first-walkable.md, garden-of-shadows-game/public/assets/fidelity/TYX_Master_Scene.glb, garden-of-shadows-game/public/assets/fidelity/architecture/, /346/270/270/345/233/255/346/203/212/346/242/246_ND_V3.1_/344/270/215/345/217/257/351/235/240/350/256/244/347/237/245/344/270/216/345/244/232/347/273/223/345/261/200/351/207/215/346/236/204/347/211/210.md, /346/270/270/345/233/255/346/203/212/346/242/246_/345/220/254/351/233/250/350/275/251MasterScene/345/273/272/346/250/241/344/270/216/347/251/272/351/227/264/345/270/203/345/261/200/346/211/247/350/241/214/350/256/241/345/210/222_V1.0.md, /346/270/270/345/233/255/346/203/212/346/242/246_/345/256/214/346/225/264GDD_V4.1_/350/256/244/347/237/245/347/273/223/345/261/200/347/263/273/347/273/237/350/241/245/345/274/272/347/211/210_Master_Source_of_Truth.docx, /346/270/270/345/233/255/346/203/212/346/242/246_/345/272/217/347/253/240/345/217/231/344/272/213/344/270/216/345/255/227/344/271/211/346/274/202/347/247/273/347/263/273/347/273/237/345/274/200/345/217/221/350/256/241/345/210/222_V1.0.md, /346/270/270/345/233/255/346/203/212/346/242/246_/346/234/200/347/273/210MasterScene/350/275/254/345/205/245Gameplay/345/274/200/345/217/221/346/211/247/350/241/214/350/256/241/345/210/222_V1.0.md, /346/270/270/345/233/255/346/203/212/346/242/246_/346/234/200/347/273/210/345/234/260/345/233/276/345/211/247/346/203/205/344/270/216Gameplay/345/256/214/346/225/264/345/274/200/345/217/221/350/256/241/345/210/222_V2.0.md
Auto-include important root files: yes
Auto-include changed files: no
Explicit selected paths: garden-of-shadows-game/app/game/narrative/dialogue.ts, garden-of-shadows-game/app/game/narrative/dialogue.test.ts, garden-of-shadows-game/app/game/narrative/DialogueRunner.tsx, garden-of-shadows-game/app/game/manifests/west-onboarding.ts, garden-of-shadows-game/app/game/manifests/west-corridor.ts, garden-of-shadows-game/app/game/GameRuntime.tsx, garden-of-shadows-game/app/game/runtime/tingyuxuan-gameplay-map.ts, garden-of-shadows-game/app/game/runtime/tingyuxuan-layout.ts, garden-of-shadows-game/app/game/runtime/PhysicsController.ts, garden-of-shadows-game/app/game/runtime/TingYuXuanScene.ts, garden-of-shadows-game/app/globals.css, garden-of-shadows-game/app/page.tsx
Extra globs: none
Files included below: garden-of-shadows-game/app/game/GameRuntime.tsx, garden-of-shadows-game/app/game/manifests/west-corridor.ts, garden-of-shadows-game/app/game/manifests/west-onboarding.ts, garden-of-shadows-game/app/game/narrative/dialogue.test.ts, garden-of-shadows-game/app/game/narrative/dialogue.ts, garden-of-shadows-game/app/game/narrative/DialogueRunner.tsx, garden-of-shadows-game/app/game/runtime/PhysicsController.ts, garden-of-shadows-game/app/game/runtime/tingyuxuan-gameplay-map.ts, garden-of-shadows-game/app/game/runtime/tingyuxuan-layout.ts, garden-of-shadows-game/app/game/runtime/TingYuXuanScene.ts, garden-of-shadows-game/app/globals.css, garden-of-shadows-game/app/page.tsx, README.md

## File Contents

### garden-of-shadows-game/app/game/GameRuntime.tsx

Bytes: 44631
SHA-256: 4e2ef8986ac3a1a622ae853122d7f58a7aa69eacd411ec18ad4c5374fe867ad4
Lines: 1-681 of 681

```typescript
  1 | "use client";
  2 | /* eslint-disable @next/next/no-img-element -- runtime portraits are already compressed transparent WebP sprites */
  3 | 
  4 | import { useCallback, useEffect, useRef, useState } from "react";
  5 | import * as THREE from "three/webgpu";
  6 | import { createCheckpoint } from "./campaign-save";
  7 | import { DialogueRunner } from "./narrative/DialogueRunner";
  8 | import { speakerProfiles } from "./narrative/speakers";
  9 | import type { CampaignSave, ChapterManifest, CheckpointState, DialogueCommand, DialogueSequence, MemoryId } from "./types";
 10 | import { AudioAtmosphere, audioZoneForLayoutZones } from "./runtime/AudioAtmosphere";
 11 | import { CameraRig } from "./mechanics/CameraRig";
 12 | import { InteractionController } from "./mechanics/InteractionController";
 13 | import { ObjectiveDirector, objectiveProgressKey, resolveActiveObjective } from "./runtime/ObjectiveDirector";
 14 | import { PhysicsController } from "./runtime/PhysicsController";
 15 | import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
 16 | import { TingYuXuanScene, type SceneInteractable } from "./runtime/TingYuXuanScene";
 17 | import { createChapterCompletePayload, resolveChaseOutcome } from "./runtime/chapter-behavior";
 18 | import { resolveGameplayRegionForPoint, resolveNearestRouteAnchor, tingYuXuanRouteAnchors } from "./runtime/tingyuxuan-gameplay-map";
 19 | import { containsLayoutPoint, getLayoutAnchor, getLayoutTrigger, resolveLayoutTriggerDestination, resolveLayoutZonesForPoint, tingYuXuanLayout } from "./runtime/tingyuxuan-layout";
 20 | 
 21 | type RuntimePhase = "loading" | "dialogue" | "playing" | "chase" | "failed" | "complete" | "error";
 22 | 
 23 | interface GameRuntimeProps {
 24 |   chapter: ChapterManifest;
 25 |   save: CampaignSave;
 26 |   onSave: (save: CampaignSave) => void;
 27 |   onExit: () => void;
 28 | }
 29 | 
 30 | interface DebugTelemetry {
 31 |   position: [number, number, number];
 32 |   fps: number;
 33 |   areaId: string;
 34 |   routeAnchorId: string;
 35 |   routeDistance: number;
 36 |   grounded: boolean;
 37 |   architecture: "master" | "legacy";
 38 | }
 39 | 
 40 | const unique = <T,>(values: T[]) => [...new Set(values)];
 41 | 
 42 | 
 43 | export function GameRuntime({ chapter, save, onSave, onExit }: GameRuntimeProps) {
 44 |   const visualParams = typeof window === "undefined" ? undefined : new URLSearchParams(window.location.search);
 45 |   const visualMode = process.env.NODE_ENV === "development" && visualParams?.get("visualTest") === "1";
 46 |   const visualUi = visualParams?.get("visualUi") === "1";
 47 |   const debugHudEnabled = visualParams?.get("debugGameplay") === "1";
 48 |   const walkAuditEnabled = visualMode && visualParams?.get("walkAudit") === "1";
 49 |   const visualAnchorId = visualParams?.get("visualAnchor");
 50 |   const visualPitch = Number(visualParams?.get("visualPitch") ?? -0.05);
 51 |   const canvasRef = useRef<HTMLCanvasElement>(null);
 52 |   const runtimeRef = useRef<{
 53 |     renderer: Awaited<ReturnType<typeof createRenderer>>;
 54 |     world: TingYuXuanScene;
 55 |     physics: PhysicsController;
 56 |     audio: AudioAtmosphere;
 57 |     cameraRig: CameraRig;
 58 |     interaction: InteractionController;
 59 |   } | undefined>(undefined);
 60 |   const keysRef = useRef(new Set<string>());
 61 |   const touchModeRef = useRef(false);
 62 |   const keyboardFallbackRef = useRef(false);
 63 |   const yawRef = useRef(0);
 64 |   const pitchRef = useRef(0);
 65 |   const walkAuditTargetIndexRef = useRef(1);
 66 | 
 67 |   const chaseElapsedRef = useRef(0);
 68 |   const phaseRef = useRef<RuntimePhase>("loading");
 69 |   const dialogueRef = useRef<DialogueSequence | undefined>(undefined);
 70 |   const startDialogueRef = useRef<(id: string) => void>(() => undefined);
 71 |   const saveRef = useRef(save);
 72 |   const onSaveRef = useRef(onSave);
 73 |   const notebookRef = useRef(false);
 74 |   const directorRef = useRef(new ObjectiveDirector());
 75 |   const lastGuideUpdateRef = useRef(0);
 76 |   const lastAreaLoadRef = useRef(0);
 77 |   const areaLoadInFlightRef = useRef(false);
 78 | 
 79 |   const [phase, setPhaseState] = useState<RuntimePhase>("loading");
 80 |   const [backend, setBackend] = useState<RendererBackend>();
 81 |   const [subtitle, setSubtitle] = useState("雨落在回廊外，像有人用指节一遍遍敲门。");
 82 |   const [barkSpeaker, setBarkSpeaker] = useState<MemoryId | "steward">("steward");
 83 |   const [prompt, setPrompt] = useState<string>();
 84 |   const [showNotebook, setShowNotebookState] = useState(false);
 85 |   const [activeDialogue, setActiveDialogueState] = useState<DialogueSequence>();
 86 |   const [hasPointerLock, setHasPointerLock] = useState(false);
 87 |   const [keyboardFallback, setKeyboardFallback] = useState(false);
 88 |   const [touchMode, setTouchMode] = useState(false);
 89 |   const [guideDistance, setGuideDistance] = useState<number>();
 90 |   const [guideAngle, setGuideAngle] = useState(0);
 91 |   const [error, setError] = useState("");
 92 |   const [debugTelemetry, setDebugTelemetry] = useState<DebugTelemetry>({
 93 |     position: [0, 0, 0],
 94 |     fps: 0,
 95 |     areaId: "UNMAPPED",
 96 |     routeAnchorId: "ROUTE_01_START",
 97 |     routeDistance: 0,
 98 |     grounded: false,
 99 |     architecture: "master",
100 |   });
101 | 
102 |   const [initialCheckpoint] = useState<CheckpointState>(() => {
103 |     if (save.activeCheckpoint.chapterId === chapter.id) {
104 |       const restored = save.activeCheckpoint;
105 |       return { ...restored, memoryId: restored.memoryId === "gardener" ? "gardener" : "wife" };
106 |     }
107 |     return { ...createCheckpoint(chapter.id, "wife"), anchorId: chapter.spawnAnchor };
108 |   });
109 |   const [checkpoint, setCheckpointState] = useState(initialCheckpoint);
110 |   const checkpointRef = useRef(checkpoint);
111 | 
112 |   useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [onSave, save]);
113 | 
114 |   const setPhase = useCallback((next: RuntimePhase) => { phaseRef.current = next; setPhaseState(next); }, []);
115 |   const setShowNotebook = useCallback((next: boolean) => { notebookRef.current = next; setShowNotebookState(next); }, []);
116 | 
117 |   const requestPointerLock = useCallback(() => {
118 |     if (touchModeRef.current) return;
119 |     const canvas = canvasRef.current;
120 |     if (!canvas) return;
121 |     canvas.focus();
122 |     keyboardFallbackRef.current = true;
123 |     setKeyboardFallback(true);
124 |     const result = canvas.requestPointerLock?.();
125 |     if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
126 |     window.setTimeout(() => {
127 |       if (document.pointerLockElement !== canvas) setSubtitle("当前浏览器不支持鼠标锁定：WASD 移动，方向键左右转向。");
128 |     }, 120);
129 |   }, []);
130 | 
131 |   const commitCheckpoint = useCallback((producer: (current: CheckpointState) => CheckpointState, includePosition = true) => {
132 |     const current = checkpointRef.current;
133 |     const pose = includePosition ? runtimeRef.current?.physics.pose() : undefined;
134 |     const next = producer({ ...current, position: pose ? [pose.x, pose.y, pose.z] : current.position, yaw: yawRef.current, updatedAt: new Date().toISOString() });
135 |     checkpointRef.current = next;
136 |     setCheckpointState(next);
137 |     const nextSave = { ...saveRef.current, activeCheckpoint: next };
138 |     saveRef.current = nextSave;
139 |     onSaveRef.current(nextSave);
140 |     return next;
141 |   }, []);
142 | 
143 |   const startDialogue = useCallback((id: string) => {
144 |     const sequence = chapter.dialogueSequences?.find((item) => item.id === id);
145 |     if (!sequence || dialogueRef.current?.id === id) return;
146 |     dialogueRef.current = sequence;
147 |     setActiveDialogueState(sequence);
148 |     keysRef.current.clear();
149 |     if (sequence.presentation === "stage") { document.exitPointerLock?.(); setPhase("dialogue"); }
150 |     commitCheckpoint((current) => ({ ...current, dialogueProgress: current.dialogueProgress?.sequenceId === id ? current.dialogueProgress : undefined, pointerLockPending: sequence.presentation === "stage" }));
151 |   }, [chapter.dialogueSequences, commitCheckpoint, setPhase]);
152 |   useEffect(() => { startDialogueRef.current = startDialogue; }, [startDialogue]);
153 | 
154 |   const applyDialogueCommand = useCallback((command: DialogueCommand) => {
155 |     directorRef.current.markProgress();
156 |     if (command.type === "objective:start") commitCheckpoint((current) => ({ ...current, activeObjectiveId: command.objectiveId, objectiveStepId: command.stepId }));
157 |     else if (command.type === "objective:step") commitCheckpoint((current) => ({ ...current, objectiveStepId: command.stepId }));
158 |     else if (command.type === "flag:set") commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, command.flag]) }));
159 |     else if (command.type === "trust:set") commitCheckpoint((current) => ({ ...current, trustDecisions: { ...current.trustDecisions, [command.nodeId]: command.choiceId }, earnedFlags: unique([...current.earnedFlags, "west.trust.decided", command.outputFlag]) }));
160 |     else if (command.type === "memory:unlock") commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, `memory.${command.memoryId}.unlocked`]) }));
161 |   }, [commitCheckpoint]);
162 | 
163 |   const startChase = useCallback(() => {
164 |     const runtime = runtimeRef.current;
165 |     if (!runtime) return;
166 |     runtime.audio.sting();
167 |     const player = runtime.physics.pose();
168 |     runtime.world.setOwnerVisible(true, new THREE.Vector3(player.x, 0, player.z + 7.5));
169 |     chaseElapsedRef.current = 0;
170 |     commitCheckpoint((current) => ({ ...current, anchorId: "ROUTE_03_A_LOOP", chaseProgress: { ...current.chaseProgress, "faceless-owner-west": "active" } }));
171 |     setSubtitle("没有脸的人正在逼近。切到夫人的证词，穿过 A 区东侧亮起的门洞！");
172 |     setBarkSpeaker("steward");
173 |     setPhase("chase");
174 |     requestPointerLock();
175 |   }, [commitCheckpoint, requestPointerLock, setPhase]);
176 | 
177 |   const completeDialogue = useCallback((sequence: DialogueSequence) => {
178 |     dialogueRef.current = undefined;
179 |     setActiveDialogueState(undefined);
180 |     const nextCheckpoint = commitCheckpoint((current) => ({
181 |       ...current,
182 |       dialogueProgress: undefined,
183 |       pointerLockPending: false,
184 |       earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags,
185 |     }));
186 | 
187 |     if (sequence.id === "opening") {
188 |       const nextSave = { ...saveRef.current, activeCheckpoint: nextCheckpoint, completedChapters: unique([...saveRef.current.completedChapters, "prologue-rain"]), unlockedChapters: unique([...saveRef.current.unlockedChapters, chapter.id]) };
189 |       saveRef.current = nextSave;
190 |       onSaveRef.current(nextSave);
191 |       runtimeRef.current?.audio.start(save.settings.masterVolume);
192 |       setSubtitle("跟着灯走。从左下入口进入旧园，顾夫人会告诉你她看见了什么。");
193 |       setBarkSpeaker("steward");
194 |       setPhase("playing");
195 |       requestPointerLock();
196 |     } else if (sequence.id === "waterline-confirmed") {
197 |       setSubtitle("第一笔勘误已经成立。打开勘误簿，记住两份独立证词的规则。");
198 |       setBarkSpeaker("steward");
199 |       setPhase("playing");
200 |       setShowNotebook(true);
201 |     } else if (sequence.id === "trust") window.setTimeout(() => startDialogueRef.current("chase-intro"), 120);
202 |     else if (sequence.id === "chase-intro") startChase();
203 |     else if (sequence.id === "completion") setPhase("complete");
204 |     else if (sequence.presentation === "stage") {
205 |       if (sequence.id === "wife-arrival") { setSubtitle("顾蘅秋：这里从来只有墙。你若不信，就自己看墙脚。"); setBarkSpeaker("wife"); }
206 |       if (sequence.id === "gardener-arrival") { setSubtitle("周守圃：别看墙，去看泥。有人从这里走过。"); setBarkSpeaker("gardener"); }
207 |       setPhase("playing");
208 |       requestPointerLock();
209 |     }
210 |   }, [chapter.id, commitCheckpoint, requestPointerLock, save.settings.masterVolume, setPhase, setShowNotebook, startChase]);
211 | 
212 |   const switchMemory = useCallback(() => {
213 |     if (!runtimeRef.current || !["playing", "chase"].includes(phaseRef.current) || dialogueRef.current?.presentation === "stage") return;
214 |     const current = checkpointRef.current;
215 |     const active = resolveActiveObjective(chapter.objectives ?? [], current);
216 |     const waterlineConfirmed = current.contradictions.includes("waterline-direction");
217 |     if (!waterlineConfirmed && active?.step.id !== "switch-gardener" && active?.step.id !== "inspect-gardener") {
218 |       setSubtitle("先在夫人的证词里确认这段墙，再用铜铃复查同一个地方。");
219 |       setBarkSpeaker("wife");
220 |       return;
221 |     }
222 |     const next: MemoryId = current.memoryId === "wife" ? "gardener" : "wife";
223 |     runtimeRef.current.world.setMemory(next);
224 |     runtimeRef.current.physics.setMemory(next);
225 |     runtimeRef.current.audio.bell(next);
226 |     setSubtitle(next === "wife" ? "顾蘅秋：这里一直是墙，我从没见过你说的路。" : "周守圃：这条侧路我走了二十年，不可能凭空消失。");
227 |     setBarkSpeaker(next);
228 |     const nextCheckpoint = commitCheckpoint((value) => ({ ...value, memoryId: next, objectiveStepId: active?.step.id === "switch-gardener" ? "inspect-gardener" : value.objectiveStepId, earnedFlags: unique([...value.earnedFlags, "west.learned.memory-switch"]) }));
229 |     directorRef.current.markProgress();
230 |     if (next === "gardener" && !nextCheckpoint.earnedFlags.includes("west.dialogue.gardener-complete")) startDialogue("gardener-arrival");
231 |   }, [chapter.objectives, commitCheckpoint, startDialogue]);
232 | 
233 |   const inspectContradiction = useCallback((item: SceneInteractable) => {
234 |     const current = checkpointRef.current;
235 |     const active = resolveActiveObjective(chapter.objectives ?? [], current);
236 |     if (active?.step.targetInteractableId && active.step.targetInteractableId !== item.id) { setSubtitle(`当前任务：${active.step.instruction}`); return; }
237 |     if (item.id === "waterline-direction" && active?.step.id === "inspect-wife" && current.memoryId !== "wife") return;
238 |     if (item.id === "waterline-direction" && active?.step.id === "inspect-gardener" && current.memoryId !== "gardener") return;
239 | 
240 |     const memory = current.memoryId;
241 |     const observed = current.observedBy[item.id] ?? [];
242 |     if (observed.includes(memory)) { setSubtitle("这份证词已经记下。需要换一个人的记忆，在同一位置复查。"); return; }
243 |     const definition = chapter.contradictions.find((value) => value.id === item.id);
244 |     if (!definition) return;
245 |     const nextObserved = unique([...observed, memory]);
246 |     const confirmed = definition.requiredIndependentTestimonies.every((required) => nextObserved.includes(required));
247 |     const next = commitCheckpoint((value) => ({
248 |       ...value,
249 |       observedBy: { ...value.observedBy, [item.id]: nextObserved },
250 |       contradictions: confirmed ? unique([...value.contradictions, item.id]) : value.contradictions,
251 |       earnedFlags: confirmed ? unique([...value.earnedFlags, definition.outputFlag]) : value.earnedFlags,
252 |       objectiveStepId: !confirmed && item.id === "waterline-direction" ? "switch-gardener" : !confirmed && item.id === "corridor-count" ? "cross-check-window" : value.objectiveStepId,
253 |       objectiveProgress: { ...value.objectiveProgress, [value.activeObjectiveId ?? "unknown"]: unique([...(value.objectiveProgress[value.activeObjectiveId ?? "unknown"] ?? []), `${item.id}:${memory}`]) },
254 |     }));
255 |     directorRef.current.markProgress();
256 |     setBarkSpeaker(memory);
257 |     if (confirmed) {
258 |       setSubtitle(`矛盾确认：${definition.label}。两份独立证词在同一位置无法同时成立。`);
259 |       if (item.id === "waterline-direction") window.setTimeout(() => startDialogue("waterline-confirmed"), 280);
260 |       else if (next.contradictions.length >= chapter.contradictions.length) window.setTimeout(() => startDialogue("chase-intro"), 280);
261 |     } else {
262 |       setSubtitle(`${definition.label}：已记录${memory === "wife" ? "夫人" : "园丁"}证词，还需要另一份独立观察。`);
263 |       if (item.id === "corridor-count") window.setTimeout(() => startDialogue("loop-first-observation"), 140);
264 |     }
265 |   }, [chapter.contradictions, chapter.objectives, commitCheckpoint, startDialogue]);
266 | 
267 |   const interact = useCallback(() => { runtimeRef.current?.interaction.interact(); }, []);
268 | 
269 |   const finishChapter = useCallback(() => {
270 |     if (phaseRef.current === "complete" || dialogueRef.current?.id === "completion") return;
271 |     const current = checkpointRef.current;
272 |     const finalCheckpoint: CheckpointState = { ...current, anchorId: "ROUTE_05_B_MAIN_COURT", activeObjectiveId: undefined, objectiveStepId: undefined, earnedFlags: unique([...current.earnedFlags, ...chapter.completionFlags]), chaseProgress: { ...current.chaseProgress, "faceless-owner-west": "escaped" }, updatedAt: new Date().toISOString() };
273 |     checkpointRef.current = finalCheckpoint;
274 |     setCheckpointState(finalCheckpoint);
275 |     const nextSave: CampaignSave = { ...saveRef.current, activeCheckpoint: finalCheckpoint, completedChapters: unique([...saveRef.current.completedChapters, chapter.id]), unlockedChapters: unique([...saveRef.current.unlockedChapters, "north-tower-ledger"]) };
276 |     saveRef.current = nextSave;
277 |     onSaveRef.current(nextSave);
278 |     window.dispatchEvent(new CustomEvent("garden-of-shadows:chapter-complete", { detail: createChapterCompletePayload(chapter.id, finalCheckpoint) }));
279 |     document.exitPointerLock?.();
280 |     runtimeRef.current?.world.setOwnerVisible(false);
281 |     startDialogue("completion");
282 |   }, [chapter.completionFlags, chapter.id, startDialogue]);
283 | 
284 |   const retryChase = useCallback(() => {
285 |     const runtime = runtimeRef.current;
286 |     if (!runtime) return;
287 |     const retry = getLayoutAnchor("chase-retry");
288 |     runtime.physics.teleport({ x: retry.position[0], y: retry.position[1], z: retry.position[2] });
289 |     yawRef.current = retry.yaw;
290 |     runtime.world.setMemory("wife");
291 |     runtime.physics.setMemory("wife");
292 |     commitCheckpoint((current) => ({ ...current, memoryId: "wife" }));
293 |     startChase();
294 |   }, [commitCheckpoint, startChase]);
295 | 
296 |   useEffect(() => {
297 |     const onChange = () => setHasPointerLock(document.pointerLockElement === canvasRef.current);
298 |     document.addEventListener("pointerlockchange", onChange);
299 |     return () => document.removeEventListener("pointerlockchange", onChange);
300 |   }, []);
301 | 
302 |   useEffect(() => {
303 |     const canvas = canvasRef.current;
304 |     if (!canvas) return;
305 |     let cancelled = false;
306 |     let animationFrame = 0;
307 | 
308 |     const boot = async () => {
309 |       try {
310 |         const renderer = await createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality });
311 |         const restored = visualMode ? undefined : initialCheckpoint.position;
312 |         const anchor = getLayoutAnchor(visualMode && visualAnchorId ? visualAnchorId : (initialCheckpoint.anchorId || chapter.spawnAnchor));
313 |         const spawn = { x: restored?.[0] ?? anchor.position[0], y: Math.max(restored?.[1] ?? anchor.position[1], 0.9), z: restored?.[2] ?? anchor.position[2] };
314 |         const physics = await PhysicsController.create(spawn, tingYuXuanLayout.colliders);
315 |         if (cancelled) { renderer.dispose(); physics.dispose(); return; }
316 |         const world = await TingYuXuanScene.create(chapter.memories, save.settings.quality, renderer.renderer);
317 |         if (cancelled) { renderer.dispose(); physics.dispose(); world.dispose(); return; }
318 |         const audio = new AudioAtmosphere();
319 |         const cameraRig = new CameraRig(world.camera, physics, {
320 |           smoothTime: save.settings.stableCamera ? 0.11 : 0.16,
321 |           explorationDistance: 3.15,
322 |         });
323 |         const interaction = new InteractionController();
324 |         world.interactables.filter((item) => item.kind === "contradiction").forEach((item) => {
325 |           interaction.registerPoint({
326 |             id: item.id,
327 |             type: "evidence",
328 |             label: `[F] ${item.label}`,
329 |             maxDistance: 2.35,
330 |             enabledWhen: () => ["playing", "chase"].includes(phaseRef.current) && item.memoryIds.includes(checkpointRef.current.memoryId),
331 |             onInteract: () => inspectContradiction(item),
332 |           }, item.position, 0.72);
333 |         });
334 |         world.setMemory(initialCheckpoint.memoryId);
335 |         physics.setMemory(initialCheckpoint.memoryId);
336 |         yawRef.current = visualMode ? anchor.yaw : (initialCheckpoint.yaw ?? anchor.yaw);
337 |         pitchRef.current = visualMode ? visualPitch : 0;
338 |         cameraRig.syncExploration(new THREE.Vector3(spawn.x, spawn.y, spawn.z), yawRef.current, pitchRef.current, true);
339 |         runtimeRef.current = { renderer, world, physics, audio, cameraRig, interaction };
340 |         setBackend(renderer.backend);
341 |         canvas.dataset.rendererBackend = renderer.backend;
342 |         canvas.dataset.architectureMode = world.architectureMode();
343 |         void world.ensureAreaAssets({ x: spawn.x, z: spawn.z })
344 |           .then(() => { canvas.dataset.assetsReady = "true"; })
345 |           .catch((reason) => {
346 |             if (cancelled) return;
347 |             setError(reason instanceof Error ? reason.message : "场景区域资产加载失败");
348 |             setPhase("error");
349 |           });
350 | 
351 |         const resize = () => {
352 |           const rect = canvas.getBoundingClientRect();
353 |           renderer.resize(rect.width, rect.height, window.devicePixelRatio);
354 |           world.camera.aspect = rect.width / Math.max(rect.height, 1);
355 |           world.camera.updateProjectionMatrix();
356 |         };
357 |         resize();
358 |         window.addEventListener("resize", resize);
359 | 
360 |         let previous = performance.now();
361 |         let telemetryWindowStarted = previous;
362 |         let telemetryFrames = 0;
363 |         const clock = (now: number) => {
364 |           const delta = Math.min((now - previous) / 1000, 0.05);
365 |           previous = now;
366 |           const activePhase = phaseRef.current;
367 |           let pose = physics.pose();
368 |           const inputReady = document.pointerLockElement === canvas || touchModeRef.current || keyboardFallbackRef.current;
369 |           if (["playing", "chase"].includes(activePhase) && !notebookRef.current && !dialogueRef.current) {
370 |             const keys = keysRef.current;
371 |             let movementX = 0;
372 |             let movementZ = 0;
373 |             if (walkAuditEnabled) {
374 |               const target = tingYuXuanRouteAnchors[walkAuditTargetIndexRef.current];
375 |               if (target) {
376 |                 // The A-zone route is intentionally impossible in one cognition:
377 |                 // gardener memory opens the side path to ROUTE_03, while wife
378 |                 // memory re-opens the east exit for ROUTE_04+. Keep the automated
379 |                 // walk audit faithful to the actual puzzle instead of bypassing
380 |                 // the memory-specific colliders.
381 |                 const auditMemory: MemoryId = target.id === "ROUTE_03_A_LOOP" ? "gardener" : "wife";
382 |                 if (checkpointRef.current.memoryId !== auditMemory) {
383 |                   world.setMemory(auditMemory);
384 |                   physics.setMemory(auditMemory);
385 |                   checkpointRef.current = { ...checkpointRef.current, memoryId: auditMemory };
386 |                 }
387 |                 const dx = target.position[0] - pose.x;
388 |                 const dz = target.position[2] - pose.z;
389 |                 const distance = Math.hypot(dx, dz);
390 |                 canvas.dataset.walkAuditStatus = "running";
391 |                 canvas.dataset.walkAuditTarget = target.id;
392 |                 if (distance <= 0.5) {
393 |                   canvas.dataset.walkAuditReached = target.id;
394 |                   walkAuditTargetIndexRef.current += 1;
395 |                 } else {
396 |                   yawRef.current = Math.atan2(-dx, -dz);
397 |                   const step = Math.min(distance, 2.75 * delta);
398 |                   movementX = dx / distance * step;
399 |                   movementZ = dz / distance * step;
400 |                 }
401 |               } else {
402 |                 canvas.dataset.walkAuditStatus = "complete";
403 |                 canvas.dataset.walkAuditTarget = "ROUTE_COMPLETE";
404 |               }
405 |             } else {
406 |               const turn = inputReady ? Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft")) : 0;
407 |               yawRef.current -= turn * 1.8 * delta;
408 |               const forward = inputReady ? Number(keys.has("KeyW")) - Number(keys.has("KeyS")) : 0;
409 |               const strafe = inputReady ? Number(keys.has("KeyD")) - Number(keys.has("KeyA")) : 0;
410 |               const speed = keys.has("ShiftLeft") ? 4.5 : 2.75;
411 |               const sin = Math.sin(yawRef.current);
412 |               const cos = Math.cos(yawRef.current);
413 |               movementX = (forward * -sin + strafe * cos) * speed * delta;
414 |               movementZ = (forward * -cos - strafe * sin) * speed * delta;
415 |             }
416 |             pose = physics.move({ x: movementX, y: -2.2 * delta, z: movementZ });
417 |           }
418 |           const gameplayArea = resolveGameplayRegionForPoint({ x: pose.x, z: pose.z });
419 |           const nearestRoute = resolveNearestRouteAnchor({ x: pose.x, z: pose.z });
420 |           if (process.env.NODE_ENV === "development" || debugHudEnabled) {
421 |             canvas.dataset.playerPose = `${pose.x.toFixed(3)},${pose.y.toFixed(3)},${pose.z.toFixed(3)}`;
422 |             canvas.dataset.grounded = String(physics.isGrounded());
423 |             canvas.dataset.gameplayArea = gameplayArea;
424 |             canvas.dataset.nearestRouteAnchor = nearestRoute.id;
425 |             canvas.dataset.nearestRouteDistance = nearestRoute.distance.toFixed(2);
426 |           }
427 | 
428 |           if (now - lastAreaLoadRef.current > 450 && !areaLoadInFlightRef.current) {
429 |             const layoutZones = resolveLayoutZonesForPoint({ x: pose.x, z: pose.z });
430 |             const audioZones = world.architectureMode() === "legacy"
431 |               ? (pose.z > 17 ? ["front-hall", ...layoutZones] : layoutZones)
432 |               : gameplayArea === "AREA_C" ? ["water-court"]
433 |                 : gameplayArea === "AREA_B" ? ["inner-house"]
434 |                   : gameplayArea === "AREA_A" ? ["west-courtyard"] : ["front-gate"];
435 |             audio.setZone(audioZoneForLayoutZones(audioZones));
436 |             lastAreaLoadRef.current = now;
437 |             areaLoadInFlightRef.current = true;
438 |             canvas.dataset.streaming = "true";
439 |             void world.ensureAreaAssets({ x: pose.x, z: pose.z })
440 |               .then(() => { canvas.dataset.assetsReady = "true"; })
441 |               .catch((reason) => {
442 |                 if (cancelled) return;
443 |                 setError(reason instanceof Error ? reason.message : "场景分区加载失败");
444 |                 setPhase("error");
445 |               })
446 |               .finally(() => {
447 |                 areaLoadInFlightRef.current = false;
448 |                 canvas.dataset.streaming = "false";
449 |               });
450 |           }
451 | 
452 |           const objective = resolveActiveObjective(chapter.objectives ?? [], checkpointRef.current);
453 |           const target = objective?.step.targetPosition ? new THREE.Vector3(...objective.step.targetPosition) : undefined;
454 |           const showMarker = Boolean(target && (objective?.step.guidance.includes("world-marker") || (objective?.hintLevel ?? 0) >= 2));
455 |           world.setGuidanceTarget(showMarker ? target : undefined);
456 |           if (target && now - lastGuideUpdateRef.current > 120) {
457 |             lastGuideUpdateRef.current = now;
458 |             const dx = target.x - pose.x;
459 |             const dz = target.z - pose.z;
460 |             setGuideDistance(Math.hypot(dx, dz));
461 |             setGuideAngle(THREE.MathUtils.radToDeg(Math.atan2(dx, -dz) - yawRef.current));
462 |           }
463 | 
464 |           const emittedHint = directorRef.current.tick(delta, activePhase !== "playing" || notebookRef.current || Boolean(dialogueRef.current) || !inputReady, checkpointRef.current.activeObjectiveId, checkpointRef.current.objectiveStepId);
465 |           if (emittedHint && objective) {
466 |             const key = objectiveProgressKey(objective.objective.id, objective.step.id);
467 |             commitCheckpoint((current) => ({ ...current, hintLevels: { ...current.hintLevels, [key]: emittedHint } }));
468 |             setSubtitle(objective.step.hints[emittedHint - 1]);
469 |             setBarkSpeaker("steward");
470 |             audio.bell(checkpointRef.current.memoryId === "gardener" ? "gardener" : "wife");
471 |           }
472 | 
473 |           if (objective?.objective.id === "west-arrival" && objective.step.id === "follow-lantern" && containsLayoutPoint(getLayoutTrigger("front-hall-to-west"), pose)) {
474 |             directorRef.current.markProgress();
475 |             commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, "west.arrived"]) }));
476 |             startDialogueRef.current("wife-arrival");
477 |           }
478 | 
479 |           const loopDestination = resolveLayoutTriggerDestination("gardener-corridor-loop", checkpointRef.current.memoryId, pose);
480 |           if (loopDestination) {
481 |             const destination = loopDestination;
482 |             physics.teleport({ x: destination.position[0], y: destination.position[1], z: destination.position[2] });
483 |             yawRef.current = destination.yaw;
484 |             pose = physics.pose();
485 |             setSubtitle(activePhase === "chase" ? "回廊又把你送回 A 区基线。园丁的证词里没有出口！" : "同一盏灯、同一扇漏窗——你回到了 A 区基线地标。");
486 |             setBarkSpeaker("gardener");
487 |           }
488 | 
489 |           const cameraPlayer = new THREE.Vector3(pose.x, pose.y, pose.z);
490 |           if (cameraRig.mode === "investigation") cameraRig.syncInvestigation(cameraPlayer, yawRef.current, pitchRef.current);
491 |           else cameraRig.syncExploration(cameraPlayer, yawRef.current, pitchRef.current);
492 |           cameraRig.update(delta);
493 | 
494 |           const playerVector = new THREE.Vector3(pose.x, 0.9, pose.z);
495 |           world.update(delta, playerVector, activePhase === "chase");
496 | 
497 |           const focus = interaction.focus(world.camera, new THREE.Vector3(pose.x, pose.y + 0.9, pose.z));
498 |           setPrompt((currentPrompt) => {
499 |             const nextPrompt = focus?.definition.label;
500 |             return currentPrompt === nextPrompt ? currentPrompt : nextPrompt;
501 |           });
502 |           if (activePhase === "chase") {
503 |             chaseElapsedRef.current += delta;
504 |             const exitDestination = resolveLayoutTriggerDestination("wife-moon-gate-exit", checkpointRef.current.memoryId, pose);
505 |             const chaseOutcome = resolveChaseOutcome({ reachedExit: Boolean(exitDestination), ownerDistance: world.ownerDistance(playerVector), elapsedMs: chaseElapsedRef.current * 1000 });
506 |             if (chaseOutcome === "escaped") finishChapter();
507 |             else if (chaseOutcome === "failed") {
508 |               document.exitPointerLock?.();
509 |               world.setOwnerVisible(false);
510 |               setSubtitle("他没有杀死你，只把你的脸在记忆里擦掉了一次。");
511 |               setPhase("failed");
512 |             }
513 |           }
514 | 
515 |           renderer.renderer.render(world.scene, world.camera);
516 |           telemetryFrames += 1;
517 |           if ((process.env.NODE_ENV === "development" || debugHudEnabled) && now - telemetryWindowStarted >= 500) {
518 |             const renderInfo = renderer.renderer.info.render as { calls?: number; triangles?: number; points?: number; lines?: number };
519 |             const fps = telemetryFrames * 1000 / (now - telemetryWindowStarted);
520 |             canvas.dataset.fps = fps.toFixed(1);
521 |             canvas.dataset.drawCalls = String(renderInfo.calls ?? 0);
522 |             canvas.dataset.triangles = String(renderInfo.triangles ?? 0);
523 |             canvas.dataset.points = String(renderInfo.points ?? 0);
524 |             canvas.dataset.visibleModels = world.visibleModelNames().join(",");
525 |             canvas.dataset.loadedAssetIds = world.loadedAssetIds().join(",");
526 |             canvas.dataset.loadedAssetBytes = String(world.loadedAssetBytes());
527 |             if (debugHudEnabled) {
528 |               setDebugTelemetry({
529 |                 position: [pose.x, pose.y, pose.z],
530 |                 fps,
531 |                 areaId: gameplayArea,
532 |                 routeAnchorId: nearestRoute.id,
533 |                 routeDistance: nearestRoute.distance,
534 |                 grounded: physics.isGrounded(),
535 |                 architecture: world.architectureMode(),
536 |               });
537 |             }
538 |             telemetryFrames = 0;
539 |             telemetryWindowStarted = now;
540 |           }
541 |           animationFrame = window.requestAnimationFrame(clock);
542 |         };
543 |         animationFrame = window.requestAnimationFrame(clock);
544 | 
545 |         canvas.dataset.runtimeReady = "true";
546 |         const resumeId = initialCheckpoint.dialogueProgress?.sequenceId;
547 |         if (visualMode) setPhase("playing");
548 |         else if (resumeId) startDialogueRef.current(resumeId);
549 |         else if (!initialCheckpoint.earnedFlags.includes("prologue.dialogue.complete")) startDialogueRef.current("opening");
550 |         else if (initialCheckpoint.chaseProgress["faceless-owner-west"] === "active") setPhase("failed");
551 |         else if (initialCheckpoint.earnedFlags.includes("west.chapter.complete")) setPhase("complete");
552 |         else { audio.start(save.settings.masterVolume); setPhase("playing"); }
553 | 
554 |         return () => window.removeEventListener("resize", resize);
555 |       } catch (reason) {
556 |         setError(reason instanceof Error ? reason.message : "未知渲染错误");
557 |         setPhase("error");
558 |       }
559 |     };
560 | 
561 |     let removeResize: (() => void) | undefined;
562 |     void boot().then((cleanup) => { removeResize = cleanup; });
563 |     return () => {
564 |       cancelled = true;
565 |       window.cancelAnimationFrame(animationFrame);
566 |       removeResize?.();
567 |       runtimeRef.current?.audio.dispose();
568 |       runtimeRef.current?.interaction.dispose();
569 |       runtimeRef.current?.cameraRig.dispose();
570 |       runtimeRef.current?.world.dispose();
571 |       runtimeRef.current?.physics.dispose();
572 |       runtimeRef.current?.renderer.dispose();
573 |       runtimeRef.current = undefined;
574 |     };
575 |   }, [chapter.memories, chapter.objectives, chapter.spawnAnchor, commitCheckpoint, debugHudEnabled, finishChapter, initialCheckpoint, inspectContradiction, save.settings.masterVolume, save.settings.quality, save.settings.renderer, save.settings.stableCamera, setPhase, visualAnchorId, visualMode, visualPitch, walkAuditEnabled]);
576 | 
577 |   useEffect(() => {
578 |     const onKeyDown = (event: KeyboardEvent) => {
579 |       if (dialogueRef.current?.presentation === "stage") return;
580 |       keysRef.current.add(event.code);
581 |       if (["ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
582 |       if (event.repeat) return;
583 |       if (event.code === "Tab") { event.preventDefault(); switchMemory(); }
584 |       if (event.code === "KeyF") interact();
585 |       if (event.code === "KeyE" && ["playing", "chase"].includes(phaseRef.current)) {
586 |         const runtime = runtimeRef.current;
587 |         if (runtime) {
588 |           const pose = runtime.physics.pose();
589 |           const player = new THREE.Vector3(pose.x, pose.y, pose.z);
590 |           if (runtime.cameraRig.mode === "exploration") {
591 |             runtime.cameraRig.enterInvestigation(player, yawRef.current, pitchRef.current);
592 |             setSubtitle("调查视角：靠近证物后用准星对准，再按 F 勘验。按 E 返回探索视角。");
593 |           } else {
594 |             runtime.cameraRig.exitInvestigation(player, yawRef.current, pitchRef.current);
595 |           }
596 |         }
597 |       }
598 |       if (event.code === "KeyM" && ["playing", "chase"].includes(phaseRef.current)) {
599 |         const next = !notebookRef.current;
600 |         setShowNotebook(next);
601 |         if (next) document.exitPointerLock?.(); else requestPointerLock();
602 |       }
603 |     };
604 |     const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
605 |     const onWindowBlur = () => {
606 |       keysRef.current.clear();
607 |       keyboardFallbackRef.current = false;
608 |       setKeyboardFallback(false);
609 |     };
610 |     const onMouseMove = (event: MouseEvent) => {
611 |       if (document.pointerLockElement !== canvasRef.current) return;
612 |       yawRef.current -= event.movementX * 0.0022;
613 |       pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0018, -1.18, 1.18);
614 |     };
615 |     window.addEventListener("keydown", onKeyDown);
616 |     window.addEventListener("keyup", onKeyUp);
617 |     window.addEventListener("mousemove", onMouseMove);
618 |     window.addEventListener("blur", onWindowBlur);
619 |     return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("blur", onWindowBlur); };
620 |   }, [interact, requestPointerLock, setShowNotebook, switchMemory]);
621 | 
622 |   const activeObjective = resolveActiveObjective(chapter.objectives ?? [], checkpoint);
623 |   const activeMemory = chapter.memories.find((memory) => memory.id === checkpoint.memoryId);
624 |   const observedCount = Object.values(checkpoint.observedBy).reduce((sum, memories) => sum + memories.length, 0);
625 |   const barkProfile = speakerProfiles[barkSpeaker];
626 |   const barkImage = barkProfile?.portraits[barkProfile.defaultPortrait];
627 |   const beginTouchMove = (code: string) => {
628 |     touchModeRef.current = true;
629 |     setTouchMode(true);
630 |     keysRef.current.add(code);
631 |   };
632 | 
633 |   return (
634 |     <main className={`runtime runtime-${checkpoint.memoryId} runtime-phase-${phase}${visualMode ? " visual-regression-mode" : ""}${visualUi ? " visual-regression-ui" : ""}`}>
635 |       <canvas ref={canvasRef} className="runtime-canvas" aria-label="听雨轩最终 Master 实时三维场景" tabIndex={0} onClick={() => ["playing", "chase"].includes(phase) && requestPointerLock()} onBlur={() => { if (!hasPointerLock) { keyboardFallbackRef.current = false; setKeyboardFallback(false); } }} />
636 |       <div className="vignette" aria-hidden="true" />
637 |       <header className="runtime-topbar">
638 |         <button type="button" onClick={onExit} className="text-button">← 章节总览</button>
639 |         <div><span>Runtime Gameplay Map V1</span><strong>听雨轩 · 左下入口至 C 区门禁</strong></div>
640 |         <div className="runtime-status"><i className="status-dot" /> {backend?.toUpperCase() ?? "LOADING"}</div>
641 |       </header>
642 | 
643 |       {debugHudEnabled && <aside className="runtime-debug-hud" aria-label="First Walkable 调试信息">
644 |         <strong>{debugTelemetry.architecture === "master" ? "MASTER · tyx-master-scene" : "LEGACY ROLLBACK"}</strong>
645 |         <span>XYZ {debugTelemetry.position.map((value) => value.toFixed(2)).join(" / ")}</span>
646 |         <span>FPS {debugTelemetry.fps.toFixed(1)}</span>
647 |         <span>AREA {debugTelemetry.areaId}</span>
648 |         <span>ROUTE {debugTelemetry.routeAnchorId} · {debugTelemetry.routeDistance.toFixed(1)}m</span>
649 |         <span>GROUNDED {debugTelemetry.grounded ? "YES" : "NO"}</span>
650 |       </aside>}
651 | 
652 |       {activeObjective && <aside className="objective-card" aria-live="polite"><span>当前任务</span><strong>{activeObjective.objective.title}</strong><p>{activeObjective.step.instruction}</p>{activeObjective.hint && <small>提示：{activeObjective.hint}</small>}</aside>}
653 |       <aside className="memory-card"><span>当前证词 · TAB 切换</span><strong>{activeMemory?.label}</strong><small>{activeMemory?.description}</small></aside>
654 |       <aside className="case-progress"><span>勘误进度</span><strong>{checkpoint.contradictions.length} / {chapter.contradictions.length}</strong><small>{observedCount} 次独立观察</small><button type="button" onClick={() => { setShowNotebook(true); document.exitPointerLock?.(); }}>M · 打开勘误簿</button></aside>
655 | 
656 |       {guideDistance !== undefined && activeObjective?.step.guidance.includes("direction") && <div className="objective-direction"><i style={{ transform: `rotate(${guideAngle}deg)` }}>↑</i><span>{Math.max(1, Math.round(guideDistance))} m</span></div>}
657 |       {prompt && <div className="interaction-prompt">{prompt}</div>}
658 |       {save.settings.subtitles && subtitle && !activeDialogue && <div className="bark-subtitle">{barkImage && <img src={barkImage} alt="" />}<p><b>{barkProfile?.name}</b>{subtitle}</p></div>}
659 |       <div className="runtime-controls">WASD 移动 · {keyboardFallback && !hasPointerLock ? "方向键转向" : "鼠标观察"} · Shift 快走 · E 调查视角 · Tab 换证词 · F 勘验 · M 勘误簿</div>
660 | 
661 |       <div className="touch-controls" aria-label="移动端控制"><div className="touch-move"><button type="button" aria-label="向前" onPointerDown={() => beginTouchMove("KeyW")} onPointerUp={() => keysRef.current.delete("KeyW")} onPointerCancel={() => keysRef.current.delete("KeyW")}>↑</button><button type="button" aria-label="向左" onPointerDown={() => beginTouchMove("KeyA")} onPointerUp={() => keysRef.current.delete("KeyA")} onPointerCancel={() => keysRef.current.delete("KeyA")}>←</button><button type="button" aria-label="向后" onPointerDown={() => beginTouchMove("KeyS")} onPointerUp={() => keysRef.current.delete("KeyS")} onPointerCancel={() => keysRef.current.delete("KeyS")}>↓</button><button type="button" aria-label="向右" onPointerDown={() => beginTouchMove("KeyD")} onPointerUp={() => keysRef.current.delete("KeyD")} onPointerCancel={() => keysRef.current.delete("KeyD")}>→</button></div><div className="touch-actions"><button type="button" onClick={switchMemory}>换证词</button><button type="button" onClick={interact}>勘验</button></div></div>
662 | 
663 |       {phase === "loading" && <RuntimeModal eyebrow="正在载入" title="搭建听雨轩空间…"><p>正在初始化渲染后端、碰撞世界、任务导演与雨夜记忆。</p></RuntimeModal>}
664 | 
665 |       {activeDialogue && <DialogueRunner key={activeDialogue.id} sequence={activeDialogue} settings={save.settings} restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={checkpoint.seenDialogueLines} onCommand={applyDialogueCommand} onProgress={(inkStateJson) => commitCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))} onSeen={(lineId) => commitCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))} onComplete={() => completeDialogue(activeDialogue)} />}
666 | 
667 |       {!activeDialogue && ["playing", "chase"].includes(phase) && !hasPointerLock && !keyboardFallback && !touchMode && !showNotebook && <button type="button" className="resume-control" onClick={requestPointerLock}><span>开始控制</span><small>点击后使用 WASD；内置浏览器可用方向键转向</small></button>}
668 | 
669 |       {phase === "failed" && <RuntimeModal eyebrow="记忆断点" title="你的脸又被擦去一次"><p>失败不会抹去证据。你将回到追逐前，并自动切回能看见月洞门的夫人证词。</p><button type="button" className="primary-button" onClick={retryChase}>从漏窗前重试</button></RuntimeModal>}
670 |       {phase === "complete" && !activeDialogue && <RuntimeModal eyebrow="RUNTIME GAMEPLAY MAP V1" title="第一章完成"><p>你已证明同一条路在两份记忆中拥有互斥结构，并从 A 区东侧出口进入 B 区。下一条线索是主宅茶桌上多出来的杯子。</p><button type="button" className="primary-button" onClick={onExit}>返回章节总览</button></RuntimeModal>}
671 |       {phase === "error" && <RuntimeModal eyebrow="可恢复错误" title="三维场景未能启动"><p>{error}</p><p>请在设置中强制 WebGL 2 或降低画质后重试；存档没有丢失。</p><button type="button" className="primary-button" onClick={onExit}>返回设置</button></RuntimeModal>}
672 | 
673 |       {showNotebook && <div className="notebook-backdrop"><section className="notebook" role="dialog" aria-modal="true" aria-label="勘误簿"><button type="button" className="notebook-close" onClick={() => { setShowNotebook(false); requestPointerLock(); }}>×</button><p className="eyebrow">SPATIAL CONTRADICTIONS</p><h2>A 区勘误簿</h2><div className="notebook-rule"><b>勘验规则</b><span>同一地点 · 两份独立证词 · 才能确认矛盾</span></div>{chapter.contradictions.map((item, index) => { const observed = checkpoint.observedBy[item.id] ?? []; const confirmed = checkpoint.contradictions.includes(item.id); return <article key={item.id} className={confirmed ? "confirmed" : ""}><b>0{index + 1}</b><div><strong>{confirmed ? item.label : "尚未确认的矛盾"}</strong><p>{confirmed ? item.description : `独立观察 ${observed.length} / ${item.requiredIndependentTestimonies.length}`}</p></div><span>{confirmed ? "已确认" : "待核对"}</span></article>; })}</section></div>}
674 |     </main>
675 |   );
676 | }
677 | 
678 | function RuntimeModal({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
679 |   return <div className="runtime-modal-backdrop"><section className="runtime-modal" role="dialog" aria-modal="true"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</section></div>;
680 | }
681 | 
```

### garden-of-shadows-game/app/game/manifests/west-corridor.ts

Bytes: 5122
SHA-256: 57a489a01aa53ddbb96b7ddd68da8f9c60affb5ab72370f193f27dc0f437c28c
Lines: 1-115 of 115

```typescript
  1 | import type { ChapterManifest, MemoryLayer } from "../types";
  2 | import { interactablePosition } from "../runtime/tingyuxuan-layout";
  3 | import { westDialogueSequences, westObjectives } from "./west-onboarding";
  4 | 
  5 | const wifeMemory: MemoryLayer = {
  6 |   id: "wife",
  7 |   character: "顾蘅秋",
  8 |   label: "夫人的证词",
  9 |   description: "她记得 A 区边界始终完整：那段墙从来没有路，东侧门洞却确实存在。",
 10 |   visual: { fog: "#10201e", ambient: "#294943", keyLight: "#e2b677", exposure: 0.92, lut: "cold-jade" },
 11 |   topologyOverrides: ["wife-sealed-side-path", "wife-east-gate"],
 12 |   collisionGroup: 2,
 13 |   switchRegions: ["west-corridor", "borrowed-window"],
 14 | };
 15 | 
 16 | const gardenerMemory: MemoryLayer = {
 17 |   id: "gardener",
 18 |   character: "周守圃",
 19 |   label: "老周的证词",
 20 |   description: "他记得墙脚一直有条侧路，但那条路会把人送回已经经过的地标。",
 21 |   visual: { fog: "#071713", ambient: "#183b31", keyLight: "#87b89a", exposure: 0.78, lut: "wet-moss" },
 22 |   topologyOverrides: ["gardener-side-path", "gardener-loop"],
 23 |   collisionGroup: 4,
 24 |   switchRegions: ["west-corridor", "borrowed-window"],
 25 | };
 26 | 
 27 | export const westCorridorChapter: ChapterManifest = {
 28 |   id: "west-corridor-loop",
 29 |   index: 1,
 30 |   title: "第一章·不存在的路",
 31 |   subtitle: "他们可能真的记得两个不同的园子",
 32 |   logline: "从左下入口进入 A 区旧园，对照夫人与老周关于同一段侧路的互斥记忆；在循环路线中证明任何单一证词都无法解释完整空间，再从东侧出口进入 B 区。",
 33 |   estimatedMinutes: [15, 25],
 34 |   status: "playable",
 35 |   unlock: { chapterId: "prologue-rain", requiredFlags: ["prologue.examiner-appointed"] },
 36 |   assetPack: {
 37 |     id: "tingyuxuan-master-v1",
 38 |     initialBudgetMb: 100,
 39 |     preload: ["/assets/fidelity/TYX_Master_Scene.glb", "/basis/basis_transcoder.js", "/basis/basis_transcoder.wasm"],
 40 |     deferred: [],
 41 |   },
 42 |   spawnAnchor: "ROUTE_01_START",
 43 |   memories: [wifeMemory, gardenerMemory],
 44 |   contradictions: [
 45 |     {
 46 |       // Keep the historical id until schema-v3 save migration; player-facing
 47 |       // meaning has changed from water flow to the side-path contradiction.
 48 |       id: "waterline-direction",
 49 |       label: "不存在的侧路",
 50 |       description: "同一段墙脚，顾蘅秋记得这里只有封死的园墙；老周却记得一条长期有人经过的窄路。水痕、泥和倒灯又证明这里确实有过行动。",
 51 |       position: interactablePosition("waterline-direction"),
 52 |       kind: "geometry",
 53 |       requiredIndependentTestimonies: ["wife", "gardener"],
 54 |       confirmedByDefault: false,
 55 |       outputFlag: "west.contradiction.waterline",
 56 |     },
 57 |     {
 58 |       id: "corridor-count",
 59 |       label: "重复的地标",
 60 |       description: "老周记得的侧路可以进入，却会把人送回同一盏灯与同一扇漏窗；顾蘅秋的版本没有这条路，却保留了另一侧出口。",
 61 |       position: interactablePosition("corridor-count"),
 62 |       kind: "geometry",
 63 |       requiredIndependentTestimonies: ["wife", "gardener"],
 64 |       confirmedByDefault: false,
 65 |       outputFlag: "west.contradiction.loop",
 66 |     },
 67 |   ],
 68 |   puzzleGraph: {
 69 |     nodes: [
 70 |       {
 71 |         id: "teach-memory",
 72 |         title: "同地异景",
 73 |         ruleStage: "teach",
 74 |         prerequisites: [],
 75 |         interaction: "站在同一段墙脚切换夫人 / 老周记忆，分别确认墙与侧路的存在条件。",
 76 |         outputFlags: ["west.learned.memory-switch"],
 77 |         softHint: "不要先问谁撒谎；先确认两个人是否真的看见了不同的边界。",
 78 |       },
 79 |       {
 80 |         id: "combine-side-path",
 81 |         title: "不存在的路",
 82 |         ruleStage: "combine",
 83 |         prerequisites: ["west.learned.memory-switch"],
 84 |         interaction: "用两份证词独立确认同一墙脚的冲突，再把现实痕迹作为第三种约束。",
 85 |         outputFlags: ["west.contradiction.waterline"],
 86 |         softHint: "墙可以被记成墙，脚印却仍然需要一条能让人经过的路线。",
 87 |       },
 88 |       {
 89 |         id: "invert-loop",
 90 |         title: "不能用同一份证词找出口",
 91 |         ruleStage: "invert",
 92 |         prerequisites: ["west.contradiction.waterline"],
 93 |         interaction: "借老周版本进入侧路并触发回环，再借夫人版本保留的东侧门洞离开 A 区。",
 94 |         outputFlags: ["west.contradiction.loop", "west.portal.escaped"],
 95 |         softHint: "如果进入条件与离开条件来自同一份记忆，你只会再次回到原点。",
 96 |       },
 97 |     ],
 98 |   },
 99 |   trustNodes: [],
100 |   chaseSegments: [
101 |     {
102 |       id: "faceless-owner-west",
103 |       title: "没有脸的人认出了你",
104 |       triggerFlags: ["west.contradiction.loop"],
105 |       startAnchor: "ROUTE_03_A_LOOP",
106 |       safeAnchor: "ROUTE_04_A_EAST_EXIT",
107 |       checkpointSeconds: 18,
108 |       narrativeReveal: "它没有追问谁撒了谎，只反复叫出一个本不该出现在四份证词里的名字。",
109 |     },
110 |   ],
111 |   completionFlags: ["west.chapter.complete", "campaign.witness.wife", "campaign.witness.gardener", "campaign.route.a-to-b-open"],
112 |   dialogueSequences: westDialogueSequences,
113 |   objectives: westObjectives,
114 | };
115 | 
```

### garden-of-shadows-game/app/game/manifests/west-onboarding.ts

Bytes: 5682
SHA-256: 704ef1ecd5b315ee831c9ce66373013fbf51e947d66d12cce48bfc7116318535
Lines: 1-59 of 59

```typescript
 1 | import type { DialogueSequence, ObjectiveDefinition } from "../types";
 2 | import { getLayoutAnchor, interactablePosition } from "../runtime/tingyuxuan-layout";
 3 | 
 4 | export const westDialogueSequences: DialogueSequence[] = [
 5 |   { id: "opening", knotId: "opening", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "prologue.dialogue.complete" },
 6 |   { id: "wife-arrival", knotId: "wife_arrival", presentation: "stage", participants: ["zhaoying", "wife"], defaultRightSpeaker: "wife", completionFlag: "west.dialogue.wife-complete" },
 7 |   { id: "gardener-arrival", knotId: "gardener_arrival", presentation: "stage", participants: ["zhaoying", "gardener"], defaultRightSpeaker: "gardener", completionFlag: "west.dialogue.gardener-complete" },
 8 |   { id: "waterline-confirmed", knotId: "waterline_confirmed", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "west.dialogue.path-complete" },
 9 |   { id: "loop-first-observation", knotId: "loop_first_observation", presentation: "bark", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "west.dialogue.loop-hint-complete" },
10 |   { id: "chase-intro", knotId: "chase_intro", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "west.dialogue.chase-complete" },
11 |   { id: "completion", knotId: "completion", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "west.dialogue.completion-complete" },
12 | ];
13 | 
14 | const noAnswerHints: [string, string, string] = [
15 |   "先看墙脚：水痕、泥和被碰倒的灯都在说明有人从这里经过。",
16 |   "金色灯影只负责把你带到同一个勘验点，不会替你判断哪份证词正确。",
17 |   "靠近墙脚标记后按 F；记录完一份，再用 Tab 在同一位置复查另一份。",
18 | ];
19 | 
20 | export const westObjectives: ObjectiveDefinition[] = [
21 |   {
22 |     id: "west-arrival",
23 |     title: "进入 A 区旧园",
24 |     description: "从左下城墙入口进入旧园，先把你亲眼见到的空间记下来。",
25 |     completionFlags: ["west.arrived"],
26 |     steps: [{ id: "follow-lantern", instruction: "从左下入口沿湿石路进入 A 区", targetPosition: [...getLayoutAnchor("ROUTE_02_A_ENTRY").position], guidance: ["objective", "direction", "world-marker", "light", "audio"], hints: ["不要绕去地图外侧，顺着城墙内的湿石路走。", "纸灯标记的是 ROUTE_02，也就是 A 区真正入口。", "使用 WASD 到达 A 区入口的金色标记。"] }],
27 |   },
28 |   {
29 |     // Compatibility id remains west-waterline until old saves are fully migrated;
30 |     // the actual chapter content is now the contradictory side-path evidence.
31 |     id: "west-waterline",
32 |     title: "核对不存在的侧路",
33 |     description: "同一段墙脚，一份证词记得这里只有墙，另一份却记得这里一直能走。",
34 |     completionFlags: ["west.contradiction.waterline"],
35 |     steps: [
36 |       { id: "inspect-wife", instruction: "在夫人证词中勘验封死的墙脚", targetPosition: interactablePosition("waterline-direction"), targetInteractableId: "waterline-direction", guidance: ["objective", "direction", "world-marker", "outline", "light"], hints: noAnswerHints },
37 |       { id: "switch-gardener", instruction: "保持位置不变，按 Tab 切换到老周的证词", guidance: ["objective"], hints: ["不要离开勘验点。", "真正要比较的是同一地点在两个人记忆中的差异。", "按 Tab 切换到周守圃的证词。"] },
38 |       { id: "inspect-gardener", instruction: "在老周证词中复查同一段墙脚", targetPosition: interactablePosition("waterline-direction"), targetInteractableId: "waterline-direction", guidance: ["objective", "direction", "world-marker", "outline", "light"], hints: noAnswerHints },
39 |     ],
40 |   },
41 |   {
42 |     id: "west-loop",
43 |     title: "走完那条“存在”的路",
44 |     description: "老周记得侧路存在，但走进去的人却会回到同一个地标。",
45 |     completionFlags: ["west.contradiction.loop"],
46 |     steps: [
47 |       { id: "inspect-seventh-window", instruction: "沿老周记得的侧路走到重复地标", targetPosition: interactablePosition("corridor-count"), targetInteractableId: "corridor-count", guidance: ["objective", "direction"], hints: ["记住你第一次经过的漏窗和灯。", "如果同一个地标再次出现，不要立刻掉头。", "到 ROUTE_03 的循环核心点按 F。"] },
48 |       { id: "cross-check-window", instruction: "在同一地标切换另一份证词，再复查一次", targetPosition: interactablePosition("corridor-count"), targetInteractableId: "corridor-count", guidance: ["objective"], hints: ["一份证词只能证明一条路走不通。", "保持位置不变，比较另一份听雨轩。", "按 Tab 切换证词，再按 F 勘验重复地标。"] },
49 |     ],
50 |   },
51 |   {
52 |     id: "west-escape",
53 |     title: "从 A 区东侧出口离开",
54 |     description: "任何一份证词都不能单独解释完整路线；你只能借一份证词进入，再借另一份证词离开。",
55 |     completionFlags: ["west.chapter.complete"],
56 |     steps: [{ id: "reach-moon-gate", instruction: "切到夫人证词，穿过 ROUTE_04 的东侧出口进入 B 区", targetPosition: interactablePosition("wife-moon-gate"), targetInteractableId: "wife-moon-gate", guidance: ["objective", "direction", "world-marker", "light", "audio"], hints: ["老周的路把你送回原处；出口保留在另一份证词里。", "东侧月洞门就是 A 区真正的章节出口。", "按 Tab 切到夫人证词，向 ROUTE_04 的金色门洞前进。"] }],
57 |   },
58 | ];
59 | 
```

### garden-of-shadows-game/app/game/narrative/dialogue.test.ts

Bytes: 3156
SHA-256: 28e35091891d962ec749e5a9ed214b2f1a29d44618e9668de4fb3f327827315f
Lines: 1-71 of 71

```typescript
 1 | import { describe, expect, it } from "vitest";
 2 | import { existsSync } from "node:fs";
 3 | import { join } from "node:path";
 4 | import { Story } from "inkjs";
 5 | import { northDialogueSequences } from "../manifests/north-tower-objectives";
 6 | import { westDialogueSequences } from "../manifests/west-onboarding";
 7 | import northStory from "./north-tower-ledger.json";
 8 | import westStory from "./west-onboarding.json";
 9 | import { parseDialogueTags } from "./dialogue";
10 | import { speakerProfiles } from "./speakers";
11 | 
12 | const walkEveryBranch = (story: Story, compiledStory: Record<string, unknown>, voicePrefix: string, depth = 0): number => {
13 |   if (depth > 80) throw new Error("dialogue branch did not terminate");
14 |   let lineCount = 0;
15 |   while (story.canContinue) {
16 |     story.Continue();
17 |     lineCount += 1;
18 |     const parsed = parseDialogueTags(story.currentTags ?? [], `fallback.${lineCount}`);
19 |     const speaker = speakerProfiles[parsed.speakerId];
20 |     expect(speaker).toBeDefined();
21 |     if (parsed.speakerId !== "narrator") {
22 |       expect(parsed.voiceAssetId).toMatch(new RegExp(`^${voicePrefix}\\.`));
23 |       const portrait = speaker.portraits[parsed.portrait ?? speaker.defaultPortrait];
24 |       expect(portrait).toBeTruthy();
25 |       expect(existsSync(join(process.cwd(), "public", portrait))).toBe(true);
26 |     }
27 |   }
28 |   if (story.currentChoices.length === 0) return lineCount;
29 |   return lineCount + story.currentChoices.reduce((sum, choice) => {
30 |     const branch = new Story(compiledStory);
31 |     branch.state.LoadJson(story.state.ToJson());
32 |     branch.ChooseChoiceIndex(choice.index);
33 |     return sum + walkEveryBranch(branch, compiledStory, voicePrefix, depth + 1);
34 |   }, 0);
35 | };
36 | 
37 | describe("west onboarding dialogue", () => {
38 |   it("resolves every declared sequence and every Ink choice", () => {
39 |     for (const sequence of westDialogueSequences) {
40 |       const story = new Story(westStory);
41 |       story.ChoosePathString(sequence.knotId);
42 |       expect(walkEveryBranch(story, westStory, "west")).toBeGreaterThan(0);
43 |     }
44 |   });
45 | 
46 |   it("parses objective, trust, voice and speaker tags", () => {
47 |     const parsed = parseDialogueTags([
48 |       "speaker:wife",
49 |       "portrait:guarded",
50 |       "line:trust.001",
51 |       "voice:west.wife.001",
52 |       "objective:start:west-waterline:inspect-wife",
53 |       "trust:set:west-water-motive:protect:west.trust.protective-sabotage",
54 |     ], "fallback");
55 |     expect(parsed.speakerId).toBe("wife");
56 |     expect(parsed.lineId).toBe("trust.001");
57 |     expect(parsed.commands).toContainEqual({ type: "objective:start", objectiveId: "west-waterline", stepId: "inspect-wife" });
58 |     expect(parsed.commands).toContainEqual({ type: "trust:set", nodeId: "west-water-motive", choiceId: "protect", outputFlag: "west.trust.protective-sabotage" });
59 |   });
60 | });
61 | 
62 | describe("north tower dialogue", () => {
63 |   it("resolves every declared sequence and every Ink choice", () => {
64 |     for (const sequence of northDialogueSequences) {
65 |       const story = new Story(northStory);
66 |       story.ChoosePathString(sequence.knotId);
67 |       expect(walkEveryBranch(story, northStory, "north")).toBeGreaterThan(0);
68 |     }
69 |   });
70 | });
71 | 
```

### garden-of-shadows-game/app/game/narrative/dialogue.ts

Bytes: 1935
SHA-256: 37d827ac2727f6fd4ee2d19e72fb1f879b0ec1987434be02a61acc8a4a83b629
Lines: 1-40 of 40

```typescript
 1 | import type { DialogueCommand, MemoryId, SpeakerId } from "../types";
 2 | 
 3 | export interface ParsedDialogueTags {
 4 |   speakerId: SpeakerId;
 5 |   portrait?: string;
 6 |   lineId: string;
 7 |   voiceAssetId?: string;
 8 |   commands: DialogueCommand[];
 9 | }
10 | 
11 | export function parseDialogueTags(tags: string[], fallbackLineId: string): ParsedDialogueTags {
12 |   let speakerId: SpeakerId = "narrator";
13 |   let portrait: string | undefined;
14 |   let lineId = fallbackLineId;
15 |   let voiceAssetId: string | undefined;
16 |   const commands: DialogueCommand[] = [];
17 | 
18 |   for (const rawTag of tags) {
19 |     const tag = rawTag.trim();
20 |     if (tag.startsWith("speaker:")) speakerId = tag.slice("speaker:".length) as SpeakerId;
21 |     else if (tag.startsWith("portrait:")) portrait = tag.slice("portrait:".length);
22 |     else if (tag.startsWith("line:")) lineId = tag.slice("line:".length);
23 |     else if (tag.startsWith("voice:")) voiceAssetId = tag.slice("voice:".length);
24 |     else if (tag.startsWith("flag:set:")) commands.push({ type: "flag:set", flag: tag.slice("flag:set:".length) });
25 |     else if (tag.startsWith("memory:unlock:")) commands.push({ type: "memory:unlock", memoryId: tag.slice("memory:unlock:".length) as MemoryId });
26 |     else if (tag.startsWith("objective:start:")) {
27 |       const [, , objectiveId, stepId] = tag.split(":");
28 |       if (objectiveId && stepId) commands.push({ type: "objective:start", objectiveId, stepId });
29 |     } else if (tag.startsWith("objective:step:")) {
30 |       const stepId = tag.slice("objective:step:".length);
31 |       if (stepId) commands.push({ type: "objective:step", stepId });
32 |     } else if (tag.startsWith("trust:set:")) {
33 |       const [, , nodeId, choiceId, outputFlag] = tag.split(":");
34 |       if (nodeId && choiceId && outputFlag) commands.push({ type: "trust:set", nodeId, choiceId, outputFlag });
35 |     } else if (tag === "scene:resume") commands.push({ type: "scene:resume" });
36 |   }
37 | 
38 |   return { speakerId, portrait, lineId, voiceAssetId, commands };
39 | }
40 | 
```

### garden-of-shadows-game/app/game/narrative/DialogueRunner.tsx

Bytes: 8914
SHA-256: 036fb854ca208732681d62249756f021ff984092de2778161f12a6eb37070739
Lines: 1-174 of 174

```typescript
  1 | "use client";
  2 | /* eslint-disable @next/next/no-img-element -- exact transparent portrait sprites must bypass image transforms */
  3 | 
  4 | import { useCallback, useEffect, useMemo, useRef, useState } from "react";
  5 | import { Story } from "inkjs";
  6 | import type { CampaignSave, DialogueCommand, DialogueSequence, SpeakerId } from "../types";
  7 | import compiledStory from "./west-onboarding.json";
  8 | import { parseDialogueTags, type ParsedDialogueTags } from "./dialogue";
  9 | import { speakerProfiles } from "./speakers";
 10 | 
 11 | interface DialogueLine extends ParsedDialogueTags {
 12 |   text: string;
 13 | }
 14 | 
 15 | export type InkStoryContent = string | Record<string, unknown>;
 16 | 
 17 | interface DialogueRunnerProps {
 18 |   sequence: DialogueSequence;
 19 |   storyContent?: InkStoryContent;
 20 |   settings: CampaignSave["settings"];
 21 |   restoredState?: string;
 22 |   seenLineIds: string[];
 23 |   onCommand: (command: DialogueCommand) => void;
 24 |   onProgress: (inkStateJson: string) => void;
 25 |   onSeen: (lineId: string) => void;
 26 |   onComplete: () => void;
 27 | }
 28 | 
 29 | const speedMs = { slow: 46, normal: 28, fast: 14, instant: 0 } as const;
 30 | 
 31 | const createStory = (content: InkStoryContent) => typeof content === "string" ? new Story(content) : new Story(content);
 32 | 
 33 | export function DialogueRunner({ sequence, storyContent = compiledStory, settings, restoredState, seenLineIds, onCommand, onProgress, onSeen, onComplete }: DialogueRunnerProps) {
 34 |   const storyRef = useRef<Story | undefined>(undefined);
 35 |   const callbackRef = useRef({ onCommand, onProgress, onSeen, onComplete });
 36 |   const [rightSpeakerId, setRightSpeakerId] = useState<SpeakerId>(sequence.defaultRightSpeaker ?? "steward");
 37 |   const [line, setLine] = useState<DialogueLine>();
 38 |   const [visibleLength, setVisibleLength] = useState(0);
 39 |   const [choices, setChoices] = useState<Array<{ index: number; text: string }>>([]);
 40 |   const [history, setHistory] = useState<DialogueLine[]>([]);
 41 |   const [showLog, setShowLog] = useState(false);
 42 |   const [autoplay, setAutoplay] = useState(false);
 43 | 
 44 |   useEffect(() => { callbackRef.current = { onCommand, onProgress, onSeen, onComplete }; }, [onCommand, onComplete, onProgress, onSeen]);
 45 | 
 46 |   const pullNext = useCallback((story: Story) => {
 47 |     while (story.canContinue) {
 48 |       const stateBeforeLine = story.state.ToJson();
 49 |       const text = (story.Continue() ?? "").trim();
 50 |       const tags = parseDialogueTags(story.currentTags ?? [], `${sequence.id}.${history.length + 1}`);
 51 |       tags.commands.forEach((command) => callbackRef.current.onCommand(command));
 52 |       callbackRef.current.onProgress(stateBeforeLine);
 53 |       if (!text) continue;
 54 |       if (tags.speakerId !== "narrator" && tags.speakerId !== "zhaoying") setRightSpeakerId(tags.speakerId);
 55 |       const nextLine = { ...tags, text };
 56 |       setLine(nextLine);
 57 |       setHistory((current) => [...current, nextLine]);
 58 |       setChoices(story.currentChoices.map((choice) => ({ index: choice.index, text: choice.text.trim() })));
 59 |       setVisibleLength(speedMs[settings.dialogueSpeed] === 0 ? text.length : 0);
 60 |       return;
 61 |     }
 62 |     const nextChoices = story.currentChoices.map((choice) => ({ index: choice.index, text: choice.text.trim() }));
 63 |     setChoices(nextChoices);
 64 |     if (nextChoices.length === 0) callbackRef.current.onComplete();
 65 |   }, [history.length, sequence.id, settings.dialogueSpeed]);
 66 | 
 67 |   useEffect(() => {
 68 |     const story = createStory(storyContent);
 69 |     if (restoredState) story.state.LoadJson(restoredState);
 70 |     else story.ChoosePathString(sequence.knotId);
 71 |     storyRef.current = story;
 72 |     const timer = window.setTimeout(() => pullNext(story), 0);
 73 |     return () => { window.clearTimeout(timer); storyRef.current = undefined; };
 74 |     // A dialogue sequence is intentionally instantiated once.
 75 |     // eslint-disable-next-line react-hooks/exhaustive-deps
 76 |   }, [sequence.id, storyContent]);
 77 | 
 78 |   useEffect(() => {
 79 |     if (!line || visibleLength >= line.text.length || speedMs[settings.dialogueSpeed] === 0) return;
 80 |     const timer = window.setTimeout(() => setVisibleLength((value) => Math.min(value + 1, line.text.length)), speedMs[settings.dialogueSpeed]);
 81 |     return () => window.clearTimeout(timer);
 82 |   }, [line, settings.dialogueSpeed, visibleLength]);
 83 | 
 84 |   const advance = useCallback(() => {
 85 |     if (!line) return;
 86 |     if (visibleLength < line.text.length) {
 87 |       setVisibleLength(line.text.length);
 88 |       return;
 89 |     }
 90 |     if (choices.length > 0) return;
 91 |     callbackRef.current.onSeen(line.lineId);
 92 |     const story = storyRef.current;
 93 |     if (story) pullNext(story);
 94 |   }, [choices.length, line, pullNext, visibleLength]);
 95 | 
 96 |   useEffect(() => {
 97 |     if (!autoplay || !line || visibleLength < line.text.length || choices.length > 0) return;
 98 |     const timer = window.setTimeout(advance, Math.max(1100, line.text.length * 75));
 99 |     return () => window.clearTimeout(timer);
100 |   }, [advance, autoplay, choices.length, line, visibleLength]);
101 | 
102 |   useEffect(() => {
103 |     const onKey = (event: KeyboardEvent) => {
104 |       if (event.code === "Space" || event.code === "Enter") {
105 |         event.preventDefault();
106 |         advance();
107 |       }
108 |     };
109 |     window.addEventListener("keydown", onKey);
110 |     return () => window.removeEventListener("keydown", onKey);
111 |   }, [advance]);
112 | 
113 |   const choose = (index: number) => {
114 |     const story = storyRef.current;
115 |     if (!story) return;
116 |     if (line) callbackRef.current.onSeen(line.lineId);
117 |     story.ChooseChoiceIndex(index);
118 |     setChoices([]);
119 |     pullNext(story);
120 |   };
121 | 
122 |   const left = speakerProfiles.zhaoying;
123 |   const right = speakerProfiles[rightSpeakerId] ?? speakerProfiles.steward;
124 |   const activeSpeaker = line ? speakerProfiles[line.speakerId] : undefined;
125 |   const leftExpression = line?.speakerId === "zhaoying" ? line.portrait : left.defaultPortrait;
126 |   const rightExpression = line?.speakerId === right.id ? line.portrait : right.defaultPortrait;
127 |   const leftImage = left.portraits[leftExpression ?? left.defaultPortrait];
128 |   const rightImage = right.portraits[rightExpression ?? right.defaultPortrait];
129 |   const shownText = line?.text.slice(0, visibleLength) ?? "";
130 |   const isRead = line ? seenLineIds.includes(line.lineId) : false;
131 | 
132 |   const rootClass = useMemo(() => `dialogue dialogue-${sequence.presentation}`, [sequence.presentation]);
133 | 
134 |   return (
135 |     <section className={rootClass} role="dialog" aria-modal={sequence.presentation === "stage"} aria-label="剧情对话">
136 |       {sequence.presentation === "stage" && sequence.backdrop && <div className="dialogue-scene" style={{ backgroundImage: `url(${sequence.backdrop})` }} aria-hidden="true" />}
137 |       {sequence.presentation === "stage" && <div className="dialogue-curtain" aria-hidden="true" />}
138 |       {sequence.presentation === "stage" && (
139 |         <div className={`portrait portrait-left ${line?.speakerId === "zhaoying" ? "active" : "inactive"}`}>
140 |           <img src={leftImage} alt="我" />
141 |         </div>
142 |       )}
143 |       {rightImage && (
144 |         <div className={`portrait portrait-right ${line?.speakerId === right.id ? "active" : "inactive"}`}>
145 |           <img src={rightImage} alt={right.name} />
146 |         </div>
147 |       )}
148 |       <div className="dialogue-box" style={{ "--speaker-color": activeSpeaker?.themeColor ?? "#b9a87b" } as React.CSSProperties}>
149 |         <div className="dialogue-toolbar">
150 |           <span>{sequence.presentation === "stage" ? "剧情对话" : "证词回声"}</span>
151 |           <button type="button" onClick={(event) => { event.stopPropagation(); setAutoplay((value) => !value); }}>{autoplay ? "停止自动" : "自动"}</button>
152 |           <button type="button" onClick={(event) => { event.stopPropagation(); setShowLog((value) => !value); }}>记录</button>
153 |           {isRead && <button type="button" onClick={(event) => { event.stopPropagation(); setVisibleLength(line?.text.length ?? 0); advance(); }}>跳过已读</button>}
154 |         </div>
155 |         <button type="button" className="dialogue-advance" onClick={advance} aria-label="推进对话">
156 |           <strong className="dialogue-name">{activeSpeaker?.name ?? "听雨轩"}</strong>
157 |           <p>{shownText}<i className={visibleLength >= (line?.text.length ?? 0) ? "ready" : ""} /></p>
158 |         </button>
159 |         {choices.length > 0 && visibleLength >= (line?.text.length ?? 0) && (
160 |           <div className="dialogue-choices">
161 |             {choices.map((choice) => <button key={choice.index} type="button" onClick={(event) => { event.stopPropagation(); choose(choice.index); }}>{choice.text}</button>)}
162 |           </div>
163 |         )}
164 |       </div>
165 |       {showLog && (
166 |         <aside className="dialogue-log">
167 |           <button type="button" onClick={() => setShowLog(false)}>关闭记录</button>
168 |           {history.map((item, index) => <p key={`${item.lineId}-${index}`}><b>{speakerProfiles[item.speakerId]?.name ?? "听雨轩"}</b>{item.text}</p>)}
169 |         </aside>
170 |       )}
171 |     </section>
172 |   );
173 | }
174 | 
```

### garden-of-shadows-game/app/game/runtime/PhysicsController.ts

Bytes: 4032
SHA-256: b69a0b2cf5f85e4e0d94de980f7a1a8b31d5aedc5eb41299c9eb29c5b2c9801d
Lines: 1-119 of 119

```typescript
  1 | import RAPIER from "@dimforge/rapier3d-compat";
  2 | import type { MemoryId } from "../types";
  3 | import type { LayoutCollider } from "./tingyuxuan-layout";
  4 | 
  5 | export interface PlayerPose {
  6 |   x: number;
  7 |   y: number;
  8 |   z: number;
  9 | }
 10 | 
 11 | const STATIC_GROUP = 0x0001_ffff;
 12 | const STATIC_WIFE_ONLY_GROUP = 0x0001_0002;
 13 | const STATIC_GARDENER_ONLY_GROUP = 0x0001_0004;
 14 | const WIFE_PLAYER_GROUP = 0x0002_ffff;
 15 | const GARDENER_PLAYER_GROUP = 0x0004_ffff;
 16 | 
 17 | export class PhysicsController {
 18 |   private constructor(
 19 |     private readonly world: RAPIER.World,
 20 |     private readonly body: RAPIER.RigidBody,
 21 |     private readonly collider: RAPIER.Collider,
 22 |     private readonly controller: RAPIER.KinematicCharacterController,
 23 |   ) {}
 24 | 
 25 |   static async create(spawn: PlayerPose, layoutColliders: LayoutCollider[]): Promise<PhysicsController> {
 26 |     await RAPIER.init();
 27 |     const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
 28 | 
 29 |     const body = world.createRigidBody(
 30 |       RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x, spawn.y, spawn.z),
 31 |     );
 32 |     const collider = world.createCollider(
 33 |       RAPIER.ColliderDesc.capsule(0.55, 0.32).setCollisionGroups(WIFE_PLAYER_GROUP),
 34 |       body,
 35 |     );
 36 |     const controller = world.createCharacterController(0.02);
 37 |     controller.enableAutostep(0.36, 0.18, false);
 38 |     controller.enableSnapToGround(0.25);
 39 |     controller.setMaxSlopeClimbAngle((42 * Math.PI) / 180);
 40 |     controller.setMinSlopeSlideAngle((48 * Math.PI) / 180);
 41 | 
 42 |     const addBox = (collider: LayoutCollider) => {
 43 |       const [x, y, z] = collider.center;
 44 |       const [hx, hy, hz] = collider.halfExtents;
 45 |       const memoryGroup = collider.memoryIds?.length === 1
 46 |         ? collider.memoryIds[0] === "wife" ? STATIC_WIFE_ONLY_GROUP
 47 |           : collider.memoryIds[0] === "gardener" ? STATIC_GARDENER_ONLY_GROUP
 48 |             : STATIC_GROUP
 49 |         : STATIC_GROUP;
 50 |       const descriptor = RAPIER.ColliderDesc.cuboid(hx, hy, hz)
 51 |         .setTranslation(x, y, z)
 52 |         .setCollisionGroups(memoryGroup);
 53 |       if (collider.rotationY) {
 54 |         descriptor.setRotation({ x: 0, y: Math.sin(collider.rotationY / 2), z: 0, w: Math.cos(collider.rotationY / 2) });
 55 |       }
 56 |       world.createCollider(descriptor);
 57 |     };
 58 |     layoutColliders.forEach(addBox);
 59 | 
 60 |     return new PhysicsController(world, body, collider, controller);
 61 |   }
 62 | 
 63 |   setMemory(memory: MemoryId): void {
 64 |     this.collider.setCollisionGroups(memory === "gardener" ? GARDENER_PLAYER_GROUP : WIFE_PLAYER_GROUP);
 65 |   }
 66 | 
 67 |   move(translation: PlayerPose): PlayerPose {
 68 |     this.controller.computeColliderMovement(this.collider, translation);
 69 |     const movement = this.controller.computedMovement();
 70 |     const current = this.body.translation();
 71 |     const next = { x: current.x + movement.x, y: current.y + movement.y, z: current.z + movement.z };
 72 |     this.body.setNextKinematicTranslation(next);
 73 |     this.world.step();
 74 |     return this.pose();
 75 |   }
 76 | 
 77 |   teleport(pose: PlayerPose): void {
 78 |     this.body.setTranslation(pose, true);
 79 |     this.body.setNextKinematicTranslation(pose);
 80 |   }
 81 | 
 82 |   pose(): PlayerPose {
 83 |     const value = this.body.translation();
 84 |     return { x: value.x, y: value.y, z: value.z };
 85 |   }
 86 | 
 87 |   isGrounded(): boolean {
 88 |     return this.controller.computedGrounded();
 89 |   }
 90 | 
 91 |   cameraSafeDistance(
 92 |     target: { x: number; y: number; z: number },
 93 |     desired: { x: number; y: number; z: number },
 94 |     margin = 0.16,
 95 |   ): number {
 96 |     const dx = desired.x - target.x;
 97 |     const dy = desired.y - target.y;
 98 |     const dz = desired.z - target.z;
 99 |     const maxDistance = Math.hypot(dx, dy, dz);
100 |     if (maxDistance <= 0.001) return maxDistance;
101 |     const ray = new RAPIER.Ray(target, { x: dx / maxDistance, y: dy / maxDistance, z: dz / maxDistance });
102 |     const hit = this.world.castRay(
103 |       ray,
104 |       maxDistance,
105 |       true,
106 |       RAPIER.QueryFilterFlags.EXCLUDE_SENSORS,
107 |       undefined,
108 |       this.collider,
109 |       this.body,
110 |     );
111 |     return hit ? Math.max(0.42, hit.timeOfImpact - margin) : maxDistance;
112 |   }
113 | 
114 |   dispose(): void {
115 |     this.controller.free();
116 |     this.world.free();
117 |   }
118 | }
119 | 
```

### garden-of-shadows-game/app/game/runtime/tingyuxuan-gameplay-map.ts

Bytes: 11654
SHA-256: b249c097b22bdf38993052ef2b00cc7bab402636b0f8b1e014fbc428a379150c
Lines: 1-188 of 188

```typescript
  1 | export type GameplayVec3 = readonly [number, number, number];
  2 | export type GameplayRegionId = "AREA_A" | "AREA_B" | "AREA_C" | "OUTSIDE";
  3 | export type RouteAnchorId =
  4 |   | "ROUTE_01_START"
  5 |   | "ROUTE_02_A_ENTRY"
  6 |   | "ROUTE_03_A_LOOP"
  7 |   | "ROUTE_04_A_EAST_EXIT"
  8 |   | "ROUTE_05_B_MAIN_COURT"
  9 |   | "ROUTE_06_B_NORTHEAST_LINK"
 10 |   | "ROUTE_07_C_ENTRY";
 11 | export type ChapterAnchorId =
 12 |   | "A_BASELINE"
 13 |   | "A_FALSE_PATH"
 14 |   | "A_LOOP_RETURN"
 15 |   | "A_WET_FOOTPRINT"
 16 |   | "B_TEA_TABLE"
 17 |   | "B_LEDGER"
 18 |   | "B_IMAGE_EVIDENCE"
 19 |   | "B_MISSING_ROOM"
 20 |   | "B_MISSING_DOOR"
 21 |   | "B_MISSING_WINDOW"
 22 |   | "B_MISSING_BOUNDARY"
 23 |   | "B_MISSING_FURNITURE"
 24 |   | "B_CHILD_BOX"
 25 |   | "C_WATER_EDGE"
 26 |   | "C_WOODEN_STEPS"
 27 |   | "C_FALL_POINT"
 28 |   | "C_FINAL_PAVILION";
 29 | 
 30 | export interface GameplayRegionDefinition {
 31 |   id: Exclude<GameplayRegionId, "OUTSIDE">;
 32 |   label: string;
 33 |   center: readonly [number, number];
 34 |   halfExtents: readonly [number, number];
 35 |   chapters: readonly string[];
 36 |   firstPass: "open" | "entry-only";
 37 | }
 38 | 
 39 | export interface GameplayAnchorDefinition {
 40 |   id: RouteAnchorId | ChapterAnchorId;
 41 |   position: GameplayVec3;
 42 |   yaw: number;
 43 |   regionId: Exclude<GameplayRegionId, "OUTSIDE">;
 44 |   firstPass: "open" | "locked";
 45 |   confidence: "blender-reviewed" | "annotated-plan-calibrated" | "provisional";
 46 | }
 47 | 
 48 | export interface GameplayColliderDefinition {
 49 |   id: string;
 50 |   center: GameplayVec3;
 51 |   halfExtents: GameplayVec3;
 52 |   rotationY?: number;
 53 |   category: "ground" | "route-ground" | "boundary" | "area-wall" | "progression-lock" | "memory-wall";
 54 |   memoryIds?: readonly ("wife" | "gardener")[];
 55 | }
 56 | 
 57 | export interface RuntimeGroundPatchDefinition {
 58 |   id: string;
 59 |   center: GameplayVec3;
 60 |   size: readonly [number, number];
 61 |   thickness: number;
 62 |   rotationY?: number;
 63 |   material: "mud-wet" | "stone-wet" | "stone-moss";
 64 |   layer: "base" | "region" | "route";
 65 |   regionId?: Exclude<GameplayRegionId, "OUTSIDE">;
 66 | }
 67 | 
 68 | export const TINGYUXUAN_GAMEPLAY_MAP_VERSION = "tingyuxuan-gameplay-map-v1";
 69 | 
 70 | // Runtime coordinates are calibrated from the annotated V2 route against the
 71 | // final Blender top view, then converted through the one allowed Master root
 72 | // transform. ROUTE_04 is additionally backed by the Blender connection review.
 73 | export const tingYuXuanRouteAnchors: readonly GameplayAnchorDefinition[] = [
 74 |   { id: "ROUTE_01_START", position: [15.8, 0.9, 51], yaw: 1.07, regionId: "AREA_A", firstPass: "open", confidence: "annotated-plan-calibrated" },
 75 |   { id: "ROUTE_02_A_ENTRY", position: [6.5, 0.9, 45.8], yaw: 0.79, regionId: "AREA_A", firstPass: "open", confidence: "annotated-plan-calibrated" },
 76 |   { id: "ROUTE_03_A_LOOP", position: [1.8, 0.9, 41.2], yaw: 0.73, regionId: "AREA_A", firstPass: "open", confidence: "annotated-plan-calibrated" },
 77 |   { id: "ROUTE_04_A_EAST_EXIT", position: [1.9, 0.9, 31.2], yaw: 0.37, regionId: "AREA_A", firstPass: "open", confidence: "blender-reviewed" },
 78 |   { id: "ROUTE_05_B_MAIN_COURT", position: [-1, 0.9, 24], yaw: 1.14, regionId: "AREA_B", firstPass: "open", confidence: "annotated-plan-calibrated" },
 79 |   { id: "ROUTE_06_B_NORTHEAST_LINK", position: [-11.5, 0.9, 19.2], yaw: 1.13, regionId: "AREA_B", firstPass: "open", confidence: "annotated-plan-calibrated" },
 80 |   { id: "ROUTE_07_C_ENTRY", position: [-22, 0.9, 14.2], yaw: 1.13, regionId: "AREA_C", firstPass: "open", confidence: "annotated-plan-calibrated" },
 81 | ] as const;
 82 | 
 83 | export const tingYuXuanChapterAnchors: readonly GameplayAnchorDefinition[] = [
 84 |   { id: "A_BASELINE", position: [6.1, 0.9, 44.8], yaw: 0.78, regionId: "AREA_A", firstPass: "open", confidence: "provisional" },
 85 |   { id: "A_FALSE_PATH", position: [4.1, 0.9, 42.9], yaw: 0.72, regionId: "AREA_A", firstPass: "open", confidence: "provisional" },
 86 |   { id: "A_LOOP_RETURN", position: [1.8, 0.9, 41.2], yaw: 0.73, regionId: "AREA_A", firstPass: "open", confidence: "provisional" },
 87 |   { id: "A_WET_FOOTPRINT", position: [2, 0.9, 32.2], yaw: 0.37, regionId: "AREA_A", firstPass: "open", confidence: "provisional" },
 88 |   { id: "B_TEA_TABLE", position: [-2.2, 0.9, 24.4], yaw: 1.1, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
 89 |   { id: "B_LEDGER", position: [-4.8, 0.9, 25.1], yaw: 1.25, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
 90 |   { id: "B_IMAGE_EVIDENCE", position: [-7.2, 0.9, 22.6], yaw: 0.9, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
 91 |   { id: "B_MISSING_ROOM", position: [-9.1, 0.9, 26.4], yaw: 1.55, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
 92 |   { id: "B_MISSING_DOOR", position: [-7.7, 0.9, 27.4], yaw: 1.55, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
 93 |   { id: "B_MISSING_WINDOW", position: [-10.4, 0.9, 27.8], yaw: 0.15, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
 94 |   { id: "B_MISSING_BOUNDARY", position: [-10.8, 0.9, 25.1], yaw: -1.4, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
 95 |   { id: "B_MISSING_FURNITURE", position: [-8.4, 0.9, 25.2], yaw: 2.85, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
 96 |   { id: "B_CHILD_BOX", position: [-9.15, 0.9, 26.0], yaw: 1.55, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
 97 |   { id: "C_WATER_EDGE", position: [-23.8, 0.9, 12.8], yaw: 1.05, regionId: "AREA_C", firstPass: "locked", confidence: "provisional" },
 98 |   { id: "C_WOODEN_STEPS", position: [-25.8, 0.9, 11.4], yaw: 1.05, regionId: "AREA_C", firstPass: "locked", confidence: "provisional" },
 99 |   { id: "C_FALL_POINT", position: [-27.2, 0.9, 10.1], yaw: 1.05, regionId: "AREA_C", firstPass: "locked", confidence: "provisional" },
100 |   { id: "C_FINAL_PAVILION", position: [-28.5, 0.9, 7.4], yaw: Math.PI, regionId: "AREA_C", firstPass: "locked", confidence: "provisional" },
101 | ] as const;
102 | 
103 | export const tingYuXuanGameplayAnchors = [...tingYuXuanRouteAnchors, ...tingYuXuanChapterAnchors] as const;
104 | 
105 | export const tingYuXuanGameplayRegions: readonly GameplayRegionDefinition[] = [
106 |   { id: "AREA_A", label: "旧园入口区", center: [7, 42.5], halfExtents: [12, 13.5], chapters: ["序章", "第一章"], firstPass: "open" },
107 |   { id: "AREA_B", label: "主宅调查区", center: [-5, 24], halfExtents: [11, 7], chapters: ["第二章", "第三章"], firstPass: "open" },
108 |   { id: "AREA_C", label: "深园水域区", center: [-22, 10], halfExtents: [13, 10], chapters: ["第五章", "终章"], firstPass: "entry-only" },
109 | ] as const;
110 | 
111 | const routeSegments = tingYuXuanRouteAnchors.slice(0, -1).map((from, index) => {
112 |   const to = tingYuXuanRouteAnchors[index + 1];
113 |   const dx = to.position[0] - from.position[0];
114 |   const dz = to.position[2] - from.position[2];
115 |   const length = Math.hypot(dx, dz);
116 |   return {
117 |     id: `route-ground-${String(index + 1).padStart(2, "0")}`,
118 |     center: [(from.position[0] + to.position[0]) / 2, -0.25, (from.position[2] + to.position[2]) / 2] as GameplayVec3,
119 |     halfExtents: [1.8, 0.25, length / 2 + 0.45] as GameplayVec3,
120 |     rotationY: Math.atan2(dx, dz),
121 |     category: "route-ground" as const,
122 |   };
123 | });
124 | 
125 | export const tingYuXuanGameplayColliders: readonly GameplayColliderDefinition[] = [
126 |   { id: "ground-area-a", center: [7, -0.25, 42.5], halfExtents: [12, 0.25, 13.5], category: "ground" },
127 |   { id: "ground-area-b", center: [-5, -0.25, 24], halfExtents: [11, 0.25, 7], category: "ground" },
128 |   ...routeSegments,
129 |   { id: "boundary-x-min", center: [-35.25, 1.8, 27.5], halfExtents: [0.25, 1.8, 28.5], category: "boundary" },
130 |   { id: "boundary-x-max", center: [19.25, 1.8, 27.5], halfExtents: [0.25, 1.8, 28.5], category: "boundary" },
131 |   { id: "boundary-z-min", center: [-8, 1.8, -1.25], halfExtents: [27, 1.8, 0.25], category: "boundary" },
132 |   { id: "boundary-z-max", center: [-8, 1.8, 56.25], halfExtents: [27, 1.8, 0.25], category: "boundary" },
133 |   { id: "a-x-min-wall", center: [-5.25, 1.6, 42.5], halfExtents: [0.25, 1.6, 13.5], category: "area-wall" },
134 |   { id: "a-b-wall-positive-x", center: [11, 1.6, 29], halfExtents: [8, 1.6, 0.25], category: "area-wall" },
135 |   { id: "a-b-wall-negative-x", center: [-2.25, 1.6, 29], halfExtents: [2.75, 1.6, 0.25], category: "area-wall" },
136 |   { id: "b-c-wall-upper-z", center: [-16, 1.6, 26], halfExtents: [0.25, 1.6, 5], category: "area-wall" },
137 |   { id: "b-x-max-wall", center: [6.25, 1.6, 24], halfExtents: [0.25, 1.6, 7], category: "area-wall" },
138 |   { id: "b-z-min-wall", center: [-3.5, 1.6, 16.75], halfExtents: [9.5, 1.6, 0.25], category: "area-wall" },
139 |   { id: "c-entry-bank-left", center: [-17.63, 1.4, 18.55], halfExtents: [0.18, 1.4, 6.25], rotationY: -2.016, category: "area-wall" },
140 |   { id: "c-entry-bank-right", center: [-15.87, 1.4, 14.85], halfExtents: [0.18, 1.4, 6.25], rotationY: -2.016, category: "area-wall" },
141 |   // Memory topology is collision, not just tint: the wife's version physically
142 |   // seals the side path while the gardener's version physically seals the east
143 |   // exit. Switching testimony changes the player collision group at runtime.
144 |   { id: "wife-sealed-side-path", center: [4.1, 1.45, 42.9], halfExtents: [1.55, 1.45, 0.18], rotationY: -0.78, category: "memory-wall", memoryIds: ["wife"] },
145 |   { id: "gardener-sealed-east-exit", center: [1.9, 1.45, 31.2], halfExtents: [1.45, 1.45, 0.18], rotationY: -0.38, category: "memory-wall", memoryIds: ["gardener"] },
146 |   { id: "c-deep-first-pass-lock", center: [-23.4, 1.8, 12.5], halfExtents: [0.3, 1.8, 8.5], category: "progression-lock" },
147 | ] as const;
148 | 
149 | const routeGroundPatches: RuntimeGroundPatchDefinition[] = routeSegments.map((segment, index) => ({
150 |   id: `route-patch-${String(index + 1).padStart(2, "0")}`,
151 |   center: [segment.center[0], -0.035, segment.center[2]],
152 |   size: [3.05, segment.halfExtents[2] * 2],
153 |   thickness: 0.04,
154 |   rotationY: segment.rotationY,
155 |   material: index < 3 ? "stone-moss" : index < 5 ? "stone-wet" : "mud-wet",
156 |   layer: "route",
157 |   regionId: index < 3 ? "AREA_A" : index < 5 ? "AREA_B" : "AREA_C",
158 | }));
159 | 
160 | export const tingYuXuanGroundPatches: readonly RuntimeGroundPatchDefinition[] = [
161 |   { id: "base-ground", center: [-8, -0.09, 27.5], size: [54, 57], thickness: 0.12, material: "mud-wet", layer: "base" },
162 |   { id: "area-a-ground", center: [7, -0.055, 42.5], size: [24, 27], thickness: 0.06, material: "stone-moss", layer: "region", regionId: "AREA_A" },
163 |   { id: "area-b-ground", center: [-5, -0.055, 24], size: [22, 14], thickness: 0.06, material: "stone-wet", layer: "region", regionId: "AREA_B" },
164 |   { id: "area-c-entry-ground", center: [-18.5, -0.06, 16.5], size: [13, 9], thickness: 0.06, material: "mud-wet", layer: "region", regionId: "AREA_C" },
165 |   ...routeGroundPatches,
166 | ] as const;
167 | 
168 | export const containsGameplayRegion = (region: GameplayRegionDefinition, point: { x: number; z: number }) =>
169 |   Math.abs(point.x - region.center[0]) <= region.halfExtents[0]
170 |   && Math.abs(point.z - region.center[1]) <= region.halfExtents[1];
171 | 
172 | export const resolveGameplayRegionForPoint = (point: { x: number; z: number }): GameplayRegionId =>
173 |   tingYuXuanGameplayRegions.find((region) => containsGameplayRegion(region, point))?.id ?? "OUTSIDE";
174 | 
175 | export const getGameplayAnchor = (id: RouteAnchorId | ChapterAnchorId): GameplayAnchorDefinition => {
176 |   const anchor = tingYuXuanGameplayAnchors.find((candidate) => candidate.id === id);
177 |   if (!anchor) throw new Error(`Unknown TingYuXuan gameplay anchor: ${id}`);
178 |   return anchor;
179 | };
180 | 
181 | export const resolveNearestRouteAnchor = (point: { x: number; z: number }) => {
182 |   const nearest = tingYuXuanRouteAnchors.reduce((best, anchor) => {
183 |     const distance = Math.hypot(point.x - anchor.position[0], point.z - anchor.position[2]);
184 |     return distance < best.distance ? { id: anchor.id as RouteAnchorId, distance } : best;
185 |   }, { id: tingYuXuanRouteAnchors[0].id as RouteAnchorId, distance: Number.POSITIVE_INFINITY });
186 |   return nearest;
187 | };
188 | 
```

### garden-of-shadows-game/app/game/runtime/tingyuxuan-layout.ts

Bytes: 16817
SHA-256: 1d347c81a96db93a5f541dbeca135a025645404131fba5b5e98af86ff1c3493d
Lines: 1-284 of 284

```typescript
  1 | import type { MemoryId } from "../types";
  2 | import type { RuntimeAssetId } from "./RuntimeAssetLoader";
  3 | import {
  4 |   getGameplayAnchor,
  5 |   TINGYUXUAN_GAMEPLAY_MAP_VERSION,
  6 |   tingYuXuanGameplayAnchors,
  7 |   tingYuXuanGameplayColliders,
  8 | } from "./tingyuxuan-gameplay-map";
  9 | 
 10 | export type Vec3 = readonly [number, number, number];
 11 | 
 12 | export interface LayoutAnchor {
 13 |   id: string;
 14 |   position: Vec3;
 15 |   yaw: number;
 16 |   role: "spawn" | "checkpoint" | "camera" | "landmark";
 17 | }
 18 | 
 19 | export interface LayoutCollider {
 20 |   id: string;
 21 |   center: Vec3;
 22 |   halfExtents: Vec3;
 23 |   rotationY?: number;
 24 |   category?: "ground" | "route-ground" | "boundary" | "area-wall" | "progression-lock" | "memory-wall";
 25 |   memoryIds?: readonly MemoryId[];
 26 | }
 27 | 
 28 | export interface LayoutTrigger {
 29 |   id: string;
 30 |   center: Vec3;
 31 |   halfExtents: Vec3;
 32 |   kind: "arrival" | "memory-loop" | "chapter-exit" | "chapter-route";
 33 |   memoryIds?: MemoryId[];
 34 |   destinationAnchorId?: string;
 35 | }
 36 | 
 37 | export type LayoutZone = "front-gate" | "front-hall" | "west-courtyard" | "corridor" | "water-court" | "rockery" | "north-house" | "inner-house";
 38 | 
 39 | export interface LayoutPlacement {
 40 |   id: string;
 41 |   assetId: RuntimeAssetId;
 42 |   nodeName?: string;
 43 |   position: Vec3;
 44 |   rotationY?: number;
 45 |   scale?: Vec3;
 46 |   load: "preload" | "deferred";
 47 |   zone: LayoutZone;
 48 |   loadZones?: readonly LayoutZone[];
 49 |   hiddenNodeNames?: readonly string[];
 50 | }
 51 | 
 52 | export interface LayoutZoneLoadVolume {
 53 |   zone: LayoutZone;
 54 |   center: readonly [number, number];
 55 |   radius: number;
 56 | }
 57 | 
 58 | export interface LayoutInteractable {
 59 |   id: "waterline-direction" | "corridor-count" | "wife-moon-gate";
 60 |   label: string;
 61 |   position: Vec3;
 62 |   memoryIds: MemoryId[];
 63 |   kind: "contradiction" | "portal";
 64 | }
 65 | 
 66 | export const TINGYUXUAN_LAYOUT_VERSION = TINGYUXUAN_GAMEPLAY_MAP_VERSION;
 67 | 
 68 | const gameplayAlias = (id: string, sourceId: Parameters<typeof getGameplayAnchor>[0], role: LayoutAnchor["role"]): LayoutAnchor => {
 69 |   const source = getGameplayAnchor(sourceId);
 70 |   return { id, position: source.position, yaw: source.yaw, role };
 71 | };
 72 | 
 73 | const anchors: LayoutAnchor[] = [
 74 |   ...tingYuXuanGameplayAnchors.map((anchor): LayoutAnchor => ({
 75 |     id: anchor.id,
 76 |     position: anchor.position,
 77 |     yaw: anchor.yaw,
 78 |     role: anchor.id === "ROUTE_01_START" ? "spawn" : anchor.id.startsWith("ROUTE_") ? "checkpoint" : "landmark",
 79 |   })),
 80 |   // Compatibility aliases preserve story/save IDs while all positions now
 81 |   // resolve onto Runtime Gameplay Map V1 instead of the deprecated layout.
 82 |   gameplayAlias("west-entry", "ROUTE_01_START", "spawn"),
 83 |   gameplayAlias("front-gate", "ROUTE_02_A_ENTRY", "camera"),
 84 |   gameplayAlias("front-hall", "A_BASELINE", "camera"),
 85 |   gameplayAlias("west-courtyard", "ROUTE_02_A_ENTRY", "checkpoint"),
 86 |   gameplayAlias("west-waterline", "A_FALSE_PATH", "checkpoint"),
 87 |   gameplayAlias("corridor-turn-one", "A_LOOP_RETURN", "checkpoint"),
 88 |   gameplayAlias("corridor-turn-two", "A_LOOP_RETURN", "checkpoint"),
 89 |   gameplayAlias("loop-seventh-window", "A_LOOP_RETURN", "checkpoint"),
 90 |   gameplayAlias("chase-retry", "A_BASELINE", "checkpoint"),
 91 |   gameplayAlias("wife-moon-gate", "ROUTE_04_A_EAST_EXIT", "checkpoint"),
 92 |   gameplayAlias("west-safe-courtyard", "ROUTE_05_B_MAIN_COURT", "checkpoint"),
 93 |   gameplayAlias("water-court", "C_WATER_EDGE", "camera"),
 94 |   gameplayAlias("pavilion-view", "C_FINAL_PAVILION", "camera"),
 95 |   gameplayAlias("bridge-approach", "C_WOODEN_STEPS", "checkpoint"),
 96 |   gameplayAlias("water-pavilion-entry", "C_FALL_POINT", "checkpoint"),
 97 |   gameplayAlias("pavilion-landmark", "C_FINAL_PAVILION", "landmark"),
 98 |   gameplayAlias("rockery-side-route", "ROUTE_06_B_NORTHEAST_LINK", "checkpoint"),
 99 |   gameplayAlias("rockery-mouth", "ROUTE_06_B_NORTHEAST_LINK", "camera"),
100 |   gameplayAlias("east-pavilion-landmark", "ROUTE_07_C_ENTRY", "landmark"),
101 |   gameplayAlias("north-tower-entry", "ROUTE_05_B_MAIN_COURT", "checkpoint"),
102 |   gameplayAlias("north-court", "B_TEA_TABLE", "camera"),
103 |   gameplayAlias("interior-entry", "B_MISSING_ROOM", "checkpoint"),
104 |   gameplayAlias("inner-court", "B_LEDGER", "camera"),
105 | ];
106 | 
107 | const colliders: LayoutCollider[] = tingYuXuanGameplayColliders.map((collider) => ({ ...collider }));
108 | 
109 | const triggers: LayoutTrigger[] = [
110 |   { id: "front-hall-to-west", center: [6.5, 1.2, 45.8], halfExtents: [1.5, 1.8, 1.5], kind: "arrival" },
111 |   { id: "gardener-corridor-loop", center: [1.8, 1.2, 41.2], halfExtents: [1.45, 1.8, 0.65], kind: "memory-loop", memoryIds: ["gardener"], destinationAnchorId: "A_BASELINE" },
112 |   { id: "wife-moon-gate-exit", center: [1.9, 1.2, 31.2], halfExtents: [1.25, 1.8, 0.65], kind: "chapter-exit", memoryIds: ["wife"], destinationAnchorId: "ROUTE_05_B_MAIN_COURT" },
113 |   { id: "rockery-chapter-two-route", center: [-11.5, 1.2, 19.2], halfExtents: [1.2, 1.8, 1.2], kind: "chapter-route", destinationAnchorId: "ROUTE_07_C_ENTRY" },
114 | ];
115 | 
116 | export const tingYuXuanLegacyPlacements: LayoutPlacement[] = [
117 |   // Phase-one formal visual layer: source geometry is preserved. The complete
118 |   // Siheyuan supplies the gate/front-hall compound; Courtyard Park supplies
119 |   // the west-garden and corridor transition instead of the old greybox kit.
120 |   // The authored exterior gate is on the source model's +X side. Rotate the
121 |   // complete source compound so that real gate faces the chapter's +Z entry.
122 |   { id: "siheyuan-front-compound", assetId: "tyx-arch-siheyuan-source-a", position: [0.05, 0.224, 23.25], rotationY: -Math.PI / 2, load: "preload", zone: "front-gate" },
123 |   // Source bounds are 143.33 × 16.54 × 175.58. A 0.185 scale made authored
124 |   // doors and corridor eaves shorter than the 0.9 m player eye. Preserve the
125 |   // real geometry at a legible architectural scale and align minY=-2.6553 to 0.
126 |   { id: "courtyard-park-west-garden", assetId: "tyx-env-courtyard-park-source-a", position: [-1.865, 0.903, -6.7], scale: [0.34, 0.34, 0.34], load: "deferred", zone: "west-courtyard", loadZones: ["west-courtyard", "corridor"] },
127 |   { id: "north-outline", assetId: "tyx-arch-house-a", position: [10, 0, 11], rotationY: Math.PI, scale: [1.05, 1, 1.05], load: "deferred", zone: "north-house" },
128 |   { id: "inner-outline", assetId: "tyx-arch-house-a", position: [-13, 0, 18], rotationY: Math.PI / 2, scale: [0.9, 0.85, 0.9], load: "deferred", zone: "inner-house" },
129 |   { id: "water-pavilion", assetId: "tyx-arch-pavilion-a", position: [10, 0.2, -32], rotationY: Math.PI, scale: [0.72, 0.72, 0.72], load: "deferred", zone: "water-court" },
130 |   { id: "water-bridge", assetId: "tyx-gmp-bridge-low-a", position: [7.3, 0.18, -25.5], rotationY: Math.PI / 2, scale: [0.82, 0.82, 0.82], load: "deferred", zone: "water-court" },
131 |   { id: "secondary-garden-pavilion", assetId: "tyx-arch-pavilion-b", position: [18, 0, -9], rotationY: -Math.PI / 2, scale: [0.9, 0.9, 0.9], load: "deferred", zone: "rockery" },
132 |   { id: "rockery-a", assetId: "tyx-nat-rock-set-a", nodeName: "Rock_A", position: [12.4, 0, -14.8], scale: [1.5, 1.7, 1.5], load: "deferred", zone: "rockery" },
133 |   { id: "rockery-b", assetId: "tyx-nat-rock-set-a", nodeName: "Rock_B", position: [15.2, 0, -18.5], rotationY: 0.8, scale: [1.35, 1.5, 1.35], load: "deferred", zone: "rockery" },
134 |   { id: "rockery-c", assetId: "tyx-nat-rock-set-a", nodeName: "Rock_C", position: [11.7, 0, -19.2], rotationY: 1.6, scale: [1.15, 1.2, 1.15], load: "deferred", zone: "rockery" },
135 |   { id: "cc0-rock-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Rock_A", position: [5.1, 0, -34.2], rotationY: 0.4, scale: [1.35, 1.35, 1.35], load: "deferred", zone: "water-court" },
136 |   { id: "cc0-rock-b", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Rock_B", position: [15.1, 0, -24.2], rotationY: 1.2, scale: [1.55, 1.55, 1.55], load: "deferred", zone: "water-court" },
137 |   { id: "cc0-rock-c", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Rock_C", position: [14.6, 0, -34.5], rotationY: 2.15, scale: [1.2, 1.2, 1.2], load: "deferred", zone: "water-court" },
138 |   { id: "cc0-bush-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Bush_A", position: [5.2, 0, -22.4], rotationY: -0.5, scale: [1.1, 1.1, 1.1], load: "deferred", zone: "water-court" },
139 |   { id: "cc0-bush-flowers-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Bush_Flowers_A", position: [15, 0, -24], rotationY: 0.8, scale: [1.15, 1.15, 1.15], load: "deferred", zone: "water-court" },
140 |   { id: "cc0-plant-big-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Plant_Big_A", position: [-11, 0, 14], rotationY: 1.7, scale: [0.9, 0.9, 0.9], load: "deferred", zone: "west-courtyard" },
141 |   { id: "cc0-tree-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Tree_A", position: [14, 0, -26], rotationY: -0.35, scale: [1.25, 1.25, 1.25], load: "deferred", zone: "water-court" },
142 |   { id: "cc0-tree-b", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Tree_B", position: [-11, 0, 7], rotationY: 0.65, scale: [1.05, 1.05, 1.05], load: "deferred", zone: "west-courtyard" },
143 |   { id: "cc0-grass-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Grass_A", position: [6.1, 0, -23.8], rotationY: -0.2, scale: [1.3, 1.3, 1.3], load: "deferred", zone: "water-court" },
144 |   { id: "cc0-fern-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Fern_A", position: [12.1, 0, -22.6], rotationY: 1.3, scale: [1.2, 1.2, 1.2], load: "deferred", zone: "water-court" },
145 | ];
146 | 
147 | // Blender uses centimetre-like working coordinates with Z-up converted to glTF
148 | // Y-up. A single Runtime root conversion maps the reviewed connection entrance
149 | // near (-300, -10, -5) onto the existing gameplay entrance near (0, 0, 30).
150 | // No child building transform is changed after loading.
151 | export const TINGYUXUAN_MASTER_ROOT_TRANSFORM = {
152 |   position: [1, 2, -30] as Vec3,
153 |   rotationY: Math.PI / 2,
154 |   scale: [0.2, 0.2, 0.2] as Vec3,
155 | } as const;
156 | 
157 | // Blender visibility flags are not represented by core glTF nodes. These roots
158 | // were hidden source/backup objects in the final .blend and must not reappear in
159 | // the browser as duplicate formal architecture.
160 | export const TINGYUXUAN_MASTER_HIDDEN_NODES = [
161 |   "A_ExpandedBoundary",
162 |   "A_TransitionPlanting",
163 |   "B_CoreGarden_Backup",
164 |   "CONN_SourcePavingTile",
165 |   "Cube",
166 |   "Sketchfab_model",
167 |   "Sketchfab_model.002",
168 |   "skfb_offset",
169 |   "skfb_offset.001",
170 | ] as const;
171 | 
172 | const placements: LayoutPlacement[] = [{
173 |   id: "master-scene",
174 |   assetId: "tyx-master-scene",
175 |   ...TINGYUXUAN_MASTER_ROOT_TRANSFORM,
176 |   load: "preload",
177 |   zone: "front-gate",
178 |   hiddenNodeNames: TINGYUXUAN_MASTER_HIDDEN_NODES,
179 | }];
180 | 
181 | export const TINGYUXUAN_LAYOUT_AUDIT = {
182 |   keep: ["roots", "memory-layers", "procedural-atmosphere"],
183 |   remap: ["legacy story aliases onto Gameplay Map V1"],
184 |   deprecate: ["legacy formal architecture placements"],
185 |   unknown: ["provisional chapter anchors until chapter walkthrough"],
186 | } as const;
187 | 
188 | // Streaming is driven by gameplay-space volumes rather than arbitrary chapter
189 | // milestones. The whole TingYuXuan topology can now stream in without forcing
190 | // every large visual asset into the entrance preload.
191 | export const TINGYUXUAN_RUNTIME_ZONES: readonly LayoutZone[] = [
192 |   "west-courtyard",
193 |   "corridor",
194 |   "rockery",
195 |   "water-court",
196 |   "north-house",
197 |   "inner-house",
198 | ] as const;
199 | 
200 | export const tingYuXuanZoneLoadVolumes: readonly LayoutZoneLoadVolume[] = [
201 |   { zone: "west-courtyard", center: [7, 42.5], radius: 14 },
202 |   { zone: "corridor", center: [2.5, 40], radius: 9 },
203 |   { zone: "rockery", center: [-12, 19], radius: 8 },
204 |   { zone: "water-court", center: [-22, 10], radius: 13 },
205 |   { zone: "north-house", center: [-3, 24], radius: 8 },
206 |   { zone: "inner-house", center: [-8, 25], radius: 7 },
207 | ] as const;
208 | 
209 | export const resolveLayoutZonesForPoint = (point: { x: number; z: number }): LayoutZone[] => {
210 |   const zones = tingYuXuanZoneLoadVolumes
211 |     .filter((volume) => Math.hypot(point.x - volume.center[0], point.z - volume.center[1]) <= volume.radius)
212 |     .map((volume) => volume.zone);
213 |   return [...new Set(zones)];
214 | };
215 | 
216 | export const placementLoadsInZones = (placement: LayoutPlacement, zones: ReadonlySet<LayoutZone>) =>
217 |   (placement.loadZones ?? [placement.zone]).some((zone) => zones.has(zone));
218 | 
219 | // Explicit opt-in fallback only. These instances never enter visualAssets and
220 | // are shown only with ?fallbackArchitecture=1 or during layout debugging.
221 | export const tingYuXuanFallbackPlacements: LayoutPlacement[] = [
222 |   { id: "fallback-gate-moon-frame", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Wall_MoonGate_Base", position: [0, 0, 30], load: "preload", zone: "front-gate" },
223 |   { id: "fallback-gate-door", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Door_Wood", position: [0, 0, 30.1], load: "preload", zone: "front-gate" },
224 |   { id: "fallback-front-hall", assetId: "tyx-arch-greybox-fallback-a", nodeName: "House_Small", position: [0, 0, 18.5], load: "preload", zone: "front-hall" },
225 |   { id: "fallback-west-house", assetId: "tyx-arch-greybox-fallback-a", nodeName: "House_Small", position: [-8, 0, 14], rotationY: Math.PI, load: "preload", zone: "west-courtyard" },
226 |   { id: "fallback-west-run-a", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [-8, 0, 7], load: "preload", zone: "corridor" },
227 |   { id: "fallback-west-run-b", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [-8, 0, 0], load: "preload", zone: "corridor" },
228 |   { id: "fallback-turn-one", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Corner", position: [-8, 0, -4], rotationY: -Math.PI / 2, load: "preload", zone: "corridor" },
229 |   { id: "fallback-cross-run", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [-3, 0, -4], rotationY: Math.PI / 2, load: "preload", zone: "corridor" },
230 |   { id: "fallback-turn-two", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Corner", position: [2, 0, -4], rotationY: Math.PI, load: "preload", zone: "corridor" },
231 |   { id: "fallback-loop-run-a", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [2, 0, -9], load: "preload", zone: "corridor" },
232 |   { id: "fallback-loop-run-b", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [2, 0, -16.5], load: "preload", zone: "corridor" },
233 |   { id: "fallback-loop-window-a", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Wall_Window", position: [3.9, 0, -11], rotationY: Math.PI / 2, load: "preload", zone: "corridor" },
234 |   { id: "fallback-loop-window-b", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Window_Lattice", position: [3.9, 0, -15], rotationY: Math.PI / 2, load: "preload", zone: "corridor" },
235 |   { id: "fallback-story-moon-gate", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Wall_MoonGate_Base", position: [2, 0, -21], load: "preload", zone: "corridor" },
236 | ];
237 | 
238 | const interactables: LayoutInteractable[] = [
239 |   { id: "waterline-direction", label: "勘验墙脚与侧路痕迹", position: [4.1, 1.1, 42.9], memoryIds: ["wife", "gardener"], kind: "contradiction" },
240 |   { id: "corridor-count", label: "核对重复地标", position: [1.8, 1.2, 41.2], memoryIds: ["wife", "gardener"], kind: "contradiction" },
241 |   { id: "wife-moon-gate", label: "穿过 A 区东侧门洞", position: [1.9, 1.2, 31.2], memoryIds: ["wife"], kind: "portal" },
242 | ];
243 | 
244 | export const tingYuXuanLayout = {
245 |   id: "ting-yu-xuan",
246 |   version: TINGYUXUAN_LAYOUT_VERSION,
247 |   roots: ["gameplaySkeleton", "visualAssets", "proceduralDressing"] as const,
248 |   anchors,
249 |   colliders,
250 |   triggers,
251 |   placements,
252 |   interactables,
253 | };
254 | 
255 | export const getLayoutAnchor = (id: string): LayoutAnchor => {
256 |   const anchor = anchors.find((candidate) => candidate.id === id);
257 |   if (!anchor) throw new Error(`Unknown TingYuXuan anchor: ${id}`);
258 |   return anchor;
259 | };
260 | 
261 | export const getLayoutTrigger = (id: string): LayoutTrigger => {
262 |   const trigger = triggers.find((candidate) => candidate.id === id);
263 |   if (!trigger) throw new Error(`Unknown TingYuXuan trigger: ${id}`);
264 |   return trigger;
265 | };
266 | 
267 | export const containsLayoutPoint = (trigger: LayoutTrigger, point: { x: number; y: number; z: number }) =>
268 |   Math.abs(point.x - trigger.center[0]) <= trigger.halfExtents[0]
269 |   && Math.abs(point.y - trigger.center[1]) <= trigger.halfExtents[1]
270 |   && Math.abs(point.z - trigger.center[2]) <= trigger.halfExtents[2];
271 | 
272 | export const resolveLayoutTriggerDestination = (triggerId: string, memoryId: MemoryId, point: { x: number; y: number; z: number }) => {
273 |   const trigger = getLayoutTrigger(triggerId);
274 |   if (trigger.memoryIds?.length && !trigger.memoryIds.includes(memoryId)) return undefined;
275 |   if (!containsLayoutPoint(trigger, point) || !trigger.destinationAnchorId) return undefined;
276 |   return getLayoutAnchor(trigger.destinationAnchorId);
277 | };
278 | 
279 | export const interactablePosition = (id: LayoutInteractable["id"]): [number, number, number] => {
280 |   const position = interactables.find((item) => item.id === id)?.position;
281 |   if (!position) throw new Error(`Unknown TingYuXuan interactable: ${id}`);
282 |   return [...position];
283 | };
284 | 
```

### garden-of-shadows-game/app/game/runtime/TingYuXuanScene.ts

Bytes: 36039
SHA-256: b5cd206247873b0b3999256e94536e6367e66a1744691f4fa6eaccbf84ab7d02
Lines: 1-721 of 721

```typescript
  1 | import * as THREE from "three/webgpu";
  2 | import type { MemoryId, MemoryLayer } from "../types";
  3 | import { RuntimeAssetLoader, type RuntimeAssetId } from "./RuntimeAssetLoader";
  4 | import { createUnifiedMaterials, hydrateUnifiedMaterials } from "./UnifiedMaterials";
  5 | import { getGameplayAnchor, tingYuXuanGameplayRegions, tingYuXuanGroundPatches, tingYuXuanRouteAnchors } from "./tingyuxuan-gameplay-map";
  6 | import { placementLoadsInZones, resolveLayoutZonesForPoint, TINGYUXUAN_RUNTIME_ZONES, tingYuXuanFallbackPlacements, tingYuXuanLayout, tingYuXuanLegacyPlacements, type LayoutPlacement, type LayoutZone } from "./tingyuxuan-layout";
  7 | 
  8 | export interface SceneInteractable {
  9 |   id: string;
 10 |   label: string;
 11 |   position: THREE.Vector3;
 12 |   memoryIds: MemoryId[];
 13 |   kind: "contradiction" | "portal";
 14 | }
 15 | 
 16 | const placeObject = (object: THREE.Object3D, placement: LayoutPlacement) => {
 17 |   object.name = placement.id;
 18 |   object.position.set(...placement.position);
 19 |   object.rotation.y = placement.rotationY ?? 0;
 20 |   if (placement.scale) object.scale.set(...placement.scale);
 21 |   object.updateMatrixWorld(true);
 22 |   return object;
 23 | };
 24 | 
 25 | const disposeObject = (object: THREE.Object3D) => {
 26 |   const geometries = new Set<THREE.BufferGeometry>();
 27 |   const materials = new Set<THREE.Material>();
 28 |   const textures = new Set<THREE.Texture>();
 29 |   object.traverse((child) => {
 30 |     if (!(child instanceof THREE.Mesh || child instanceof THREE.Points)) return;
 31 |     geometries.add(child.geometry);
 32 |     const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
 33 |     childMaterials.forEach((material) => {
 34 |       materials.add(material);
 35 |       Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) textures.add(value); });
 36 |     });
 37 |   });
 38 |   textures.forEach((texture) => texture.dispose());
 39 |   materials.forEach((material) => material.dispose());
 40 |   geometries.forEach((geometry) => geometry.dispose());
 41 | };
 42 | 
 43 | const mulberry32 = (seed: number) => () => {
 44 |   let value = seed += 0x6d2b79f5;
 45 |   value = Math.imul(value ^ value >>> 15, value | 1);
 46 |   value ^= value + Math.imul(value ^ value >>> 7, value | 61);
 47 |   return ((value ^ value >>> 14) >>> 0) / 4294967296;
 48 | };
 49 | 
 50 | export class TingYuXuanScene {
 51 |   readonly scene = new THREE.Scene();
 52 |   readonly camera = new THREE.PerspectiveCamera(64, 16 / 9, 0.05, 180);
 53 |   readonly gameplaySkeleton = new THREE.Group();
 54 |   readonly visualAssets = new THREE.Group();
 55 |   readonly proceduralDressing = new THREE.Group();
 56 |   readonly interactables: SceneInteractable[];
 57 |   private readonly wifeLayer = new THREE.Group();
 58 |   private readonly gardenerLayer = new THREE.Group();
 59 |   private readonly facelessOwner = new THREE.Group();
 60 |   private readonly guidanceMarker = new THREE.Group();
 61 |   private readonly waterRipples = new THREE.Group();
 62 |   private readonly moonGateMaterial: THREE.MeshStandardMaterial;
 63 |   private readonly waterMaterial: THREE.MeshPhysicalMaterial;
 64 |   private readonly memoryLight: THREE.PointLight;
 65 |   private readonly materials = createUnifiedMaterials();
 66 |   private rain: THREE.Points;
 67 |   private memory: MemoryId = "wife";
 68 |   private elapsed = 0;
 69 |   private readonly loadedDeferredPlacementIds = new Set<string>();
 70 |   private readonly pendingDeferredPlacementIds = new Set<string>();
 71 |   private deferredLoadQueue: Promise<void> = Promise.resolve();
 72 |   private materialHydrationPromise?: Promise<void>;
 73 |   private lastAreaSignature = "";
 74 | 
 75 |   private constructor(
 76 |     private readonly layers: MemoryLayer[],
 77 |     private readonly quality: "high" | "stable" | "low",
 78 |     private readonly assetLoader: RuntimeAssetLoader,
 79 |     private readonly fallbackEnabled: boolean,
 80 |     private readonly legacyEnabled: boolean,
 81 |     private readonly placements: readonly LayoutPlacement[],
 82 |   ) {
 83 |     this.scene.name = "TingYuXuanScene";
 84 |     this.gameplaySkeleton.name = "gameplaySkeleton";
 85 |     this.visualAssets.name = "visualAssets";
 86 |     this.proceduralDressing.name = "proceduralDressing";
 87 |     this.scene.add(this.gameplaySkeleton, this.visualAssets, this.proceduralDressing);
 88 |     this.scene.background = new THREE.Color("#07100f");
 89 |     this.scene.fog = new THREE.FogExp2("#10201e", 0.022);
 90 |     this.camera.rotation.order = "YXZ";
 91 | 
 92 |     this.scene.add(new THREE.HemisphereLight("#8ab0a4", "#101613", 1.8));
 93 |     const moonKey = new THREE.DirectionalLight("#b9d1c8", quality === "low" ? 1.8 : 3.2);
 94 |     moonKey.position.set(-12, 18, 16);
 95 |     moonKey.castShadow = quality !== "low";
 96 |     this.proceduralDressing.add(moonKey);
 97 |     const courtyardFill = new THREE.PointLight("#e3b66e", quality === "low" ? 7 : 13, 34, 1.4);
 98 |     courtyardFill.position.set(0, 5.8, 22);
 99 |     this.proceduralDressing.add(courtyardFill);
100 |     this.memoryLight = new THREE.PointLight("#e2b677", 20, 28, 1.5);
101 |     this.memoryLight.position.set(-4, 3.2, 8);
102 |     // A shadow-casting point light renders six shadow-map faces. In the first
103 |     // source-faithful browser capture this multiplied the untouched Siheyuan
104 |     // into ~4.9M rendered triangles by itself. Keep the atmospheric fill while
105 |     // the directional moon key provides the formal architecture shadow.
106 |     this.memoryLight.castShadow = false;
107 |     this.scene.add(this.memoryLight);
108 |     const moonLight = new THREE.PointLight("#d99b4c", quality === "low" ? 5 : 9, 13, 1.7);
109 |     moonLight.position.set(2, 2.4, -18.5);
110 |     this.proceduralDressing.add(moonLight);
111 |     this.waterMaterial = new THREE.MeshPhysicalMaterial({
112 |       color: "#0b302d",
113 |       roughness: 0.12,
114 |       metalness: 0.12,
115 |       transmission: 0.08,
116 |       transparent: true,
117 |       opacity: 0.9,
118 |     });
119 | 
120 |     this.buildDebugSkeleton();
121 |     this.buildPreloadedArchitecture();
122 |     if (fallbackEnabled) this.buildFallbackArchitecture();
123 |     this.buildGroundAndWater();
124 |     this.buildDressing();
125 |     this.buildMemoryLayers();
126 |     this.moonGateMaterial = new THREE.MeshStandardMaterial({
127 |       name: "TYX_MAT_MoonGate_Memory",
128 |       color: "#9d8a69",
129 |       emissive: "#6d4b18",
130 |       emissiveIntensity: 2.1,
131 |       roughness: 0.48,
132 |       metalness: 0.04,
133 |       transparent: true,
134 |       opacity: 0.3,
135 |       depthWrite: false,
136 |     });
137 |     this.buildMoonGateMemoryFrame();
138 |     this.buildFacelessOwner();
139 |     this.buildGuidanceMarker();
140 |     this.rain = this.buildRain(quality === "high" ? 2200 : quality === "stable" ? 1100 : 480);
141 |     this.proceduralDressing.add(this.rain, this.wifeLayer, this.gardenerLayer, this.facelessOwner, this.guidanceMarker);
142 |     this.facelessOwner.visible = false;
143 |     this.guidanceMarker.visible = false;
144 | 
145 |     this.interactables = tingYuXuanLayout.interactables.map((item) => ({
146 |       ...item,
147 |       memoryIds: [...item.memoryIds],
148 |       position: new THREE.Vector3(...item.position),
149 |     }));
150 |   }
151 | 
152 |   static async create(layers: MemoryLayer[], quality: "high" | "stable" | "low", renderer: THREE.WebGPURenderer) {
153 |     const loader = await RuntimeAssetLoader.create(renderer);
154 |     const params = typeof window === "undefined" ? undefined : new URLSearchParams(window.location.search);
155 |     const fallbackEnabled = params?.get("fallbackArchitecture") === "1";
156 |     const legacyEnabled = params?.get("legacyArchitecture") === "1";
157 |     const placements = legacyEnabled ? tingYuXuanLegacyPlacements : tingYuXuanLayout.placements;
158 |     const primaryIds = [...new Set(placements.filter((placement) => placement.load === "preload").map((placement) => placement.assetId))];
159 |     await Promise.all(primaryIds.map((id) => loader.load(id)));
160 |     if (fallbackEnabled) await loader.load("tyx-arch-greybox-fallback-a");
161 |     const runtimeScene = new TingYuXuanScene(layers, quality, loader, fallbackEnabled, legacyEnabled, placements);
162 |     if (!legacyEnabled) {
163 |       // The final Master has no deferred architecture requirement on first load,
164 |       // so the old deferred-only hydration path left Runtime Ground Patches as
165 |       // flat debug-looking colors. Hydrate the four ground materials up front;
166 |       // failure is non-fatal and falls back to the authored base colors.
167 |       await hydrateUnifiedMaterials(
168 |         runtimeScene.materials,
169 |         (url) => loader.loadTexture(url),
170 |         ["mud-wet", "stone-old", "stone-wet", "stone-moss"],
171 |       ).catch(() => undefined);
172 |     }
173 |     return runtimeScene;
174 |   }
175 | 
176 |   private prepareFormalVisual(object: THREE.Object3D, placement: LayoutPlacement) {
177 |     placement.hiddenNodeNames?.forEach((name) => {
178 |       const hidden = object.getObjectByName(name);
179 |       if (hidden) hidden.visible = false;
180 |     });
181 |     const clonedMaterials = new Map<THREE.Material, THREE.Material>();
182 |     object.traverse((child) => {
183 |       if (!(child instanceof THREE.Mesh)) return;
184 |       child.castShadow = this.quality === "high" && placement.assetId !== "tyx-nat-quaternius-set-a";
185 |       child.receiveShadow = this.quality !== "low";
186 |       const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
187 |       const prepared = sourceMaterials.map((source) => {
188 |         const cached = clonedMaterials.get(source);
189 |         if (cached) return cached;
190 |         const material = source.clone();
191 |         if (material instanceof THREE.MeshStandardMaterial && !material.transparent) {
192 |           const name = material.name.toLowerCase();
193 |           const foliage = /leaf|grass|plant|foliage|flower|bush/.test(name);
194 |           material.roughness = foliage
195 |             ? Math.max(0.48, material.roughness)
196 |             : Math.max(0.2, Math.min(0.82, material.roughness * 0.74));
197 |           material.envMapIntensity = foliage ? 0.8 : 1.15;
198 |           material.needsUpdate = true;
199 |         }
200 |         clonedMaterials.set(source, material);
201 |         return material;
202 |       });
203 |       child.material = Array.isArray(child.material) ? prepared : prepared[0];
204 |     });
205 |     return object;
206 |   }
207 | 
208 |   async loadDeferredAssets(zones: LayoutZone[]) {
209 |     const allowedZones = new Set(zones);
210 |     const placements = this.placements.filter((placement) =>
211 |       placement.load === "deferred"
212 |       && placementLoadsInZones(placement, allowedZones)
213 |       && !this.loadedDeferredPlacementIds.has(placement.id)
214 |       && !this.pendingDeferredPlacementIds.has(placement.id));
215 | 
216 |     if (placements.length === 0) return;
217 |     if (!this.materialHydrationPromise) {
218 |       this.materialHydrationPromise = hydrateUnifiedMaterials(this.materials, (url) => this.assetLoader.loadTexture(url));
219 |     }
220 | 
221 |     placements.forEach((placement) => this.pendingDeferredPlacementIds.add(placement.id));
222 |     const ids = [...new Set(placements.map((placement) => placement.assetId))] as RuntimeAssetId[];
223 |     try {
224 |       await Promise.all([
225 |         ...ids.map((id) => this.assetLoader.load(id)),
226 |         this.materialHydrationPromise,
227 |       ]);
228 |       placements.forEach((placement) => {
229 |         const object = this.prepareFormalVisual(
230 |           placeObject(this.assetLoader.clone(placement.assetId, placement.nodeName), placement),
231 |           placement,
232 |         );
233 |         this.visualAssets.add(object);
234 |         this.loadedDeferredPlacementIds.add(placement.id);
235 |       });
236 |     } finally {
237 |       placements.forEach((placement) => this.pendingDeferredPlacementIds.delete(placement.id));
238 |     }
239 |   }
240 | 
241 |   async ensureAreaAssets(point: { x: number; z: number }) {
242 |     const request = this.deferredLoadQueue.then(async () => {
243 |       const allowed = new Set<LayoutZone>(TINGYUXUAN_RUNTIME_ZONES);
244 |       const zones = resolveLayoutZonesForPoint(point).filter((zone) => allowed.has(zone));
245 |       const signature = zones.slice().sort().join("|");
246 |       const activeZones = new Set<LayoutZone>(zones);
247 |       const allAreaPlacementsLoaded = this.placements
248 |         .filter((placement) => placement.load === "deferred" && placementLoadsInZones(placement, activeZones))
249 |         .every((placement) => this.loadedDeferredPlacementIds.has(placement.id));
250 |       if (signature === this.lastAreaSignature && allAreaPlacementsLoaded) return;
251 |       await this.loadDeferredAssets(zones);
252 |       this.lastAreaSignature = signature;
253 |     });
254 |     this.deferredLoadQueue = request.catch(() => undefined);
255 |     return request;
256 |   }
257 | 
258 |   private buildPreloadedArchitecture() {
259 |     this.placements.filter((placement) => placement.load === "preload").forEach((placement) => {
260 |       const object = this.prepareFormalVisual(
261 |         placeObject(this.assetLoader.clone(placement.assetId, placement.nodeName), placement),
262 |         placement,
263 |       );
264 |       this.visualAssets.add(object);
265 |     });
266 |   }
267 | 
268 |   private buildFallbackArchitecture() {
269 |     tingYuXuanFallbackPlacements.forEach((placement) => {
270 |       this.gameplaySkeleton.add(placeObject(this.assetLoader.clone(placement.assetId, placement.nodeName), placement));
271 |     });
272 |   }
273 | 
274 |   private buildDebugSkeleton() {
275 |     const debugEnabled = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debugLayout") === "1";
276 |     const colliderMaterial = new THREE.MeshBasicMaterial({ color: "#36d684", wireframe: true, transparent: true, opacity: 0.35 });
277 |     const lockMaterial = new THREE.MeshBasicMaterial({ color: "#ed5b4f", wireframe: true, transparent: true, opacity: 0.72 });
278 |     const memoryWallMaterial = new THREE.MeshBasicMaterial({ color: "#b56cff", wireframe: true, transparent: true, opacity: 0.78 });
279 |     const triggerMaterial = new THREE.MeshBasicMaterial({ color: "#e8b84b", wireframe: true, transparent: true, opacity: 0.65 });
280 |     tingYuXuanLayout.colliders.forEach((collider) => {
281 |       const material = collider.category === "memory-wall" ? memoryWallMaterial
282 |         : collider.category === "progression-lock" || collider.category === "area-wall" ? lockMaterial
283 |           : colliderMaterial;
284 |       const mesh = new THREE.Mesh(new THREE.BoxGeometry(...collider.halfExtents.map((value) => value * 2) as [number, number, number]), material);
285 |       mesh.name = `Collider_${collider.id}`;
286 |       mesh.position.set(...collider.center);
287 |       mesh.rotation.y = collider.rotationY ?? 0;
288 |       mesh.visible = debugEnabled;
289 |       this.gameplaySkeleton.add(mesh);
290 |     });
291 |     tingYuXuanLayout.triggers.forEach((trigger) => {
292 |       const mesh = new THREE.Mesh(new THREE.BoxGeometry(...trigger.halfExtents.map((value) => value * 2) as [number, number, number]), triggerMaterial);
293 |       mesh.name = `Trigger_${trigger.id}`;
294 |       mesh.position.set(...trigger.center);
295 |       mesh.visible = debugEnabled;
296 |       this.gameplaySkeleton.add(mesh);
297 |     });
298 |     const regionColors = { AREA_A: "#4aa3ff", AREA_B: "#efbd4d", AREA_C: "#70db72" } as const;
299 |     tingYuXuanGameplayRegions.forEach((region) => {
300 |       const material = new THREE.MeshBasicMaterial({ color: regionColors[region.id], wireframe: true, transparent: true, opacity: 0.52 });
301 |       const mesh = new THREE.Mesh(new THREE.BoxGeometry(region.halfExtents[0] * 2, 0.08, region.halfExtents[1] * 2), material);
302 |       mesh.name = `Region_${region.id}`;
303 |       mesh.position.set(region.center[0], 0.08, region.center[1]);
304 |       mesh.visible = debugEnabled;
305 |       this.gameplaySkeleton.add(mesh);
306 |     });
307 |     const routePoints = tingYuXuanRouteAnchors.map((anchor) => new THREE.Vector3(anchor.position[0], 0.18, anchor.position[2]));
308 |     const routeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePoints), new THREE.LineBasicMaterial({ color: "#ff4b3e" }));
309 |     routeLine.name = "Route_01_07";
310 |     routeLine.visible = debugEnabled;
311 |     this.gameplaySkeleton.add(routeLine);
312 |     tingYuXuanRouteAnchors.forEach((anchor) => {
313 |       const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 1.4, 12), new THREE.MeshBasicMaterial({ color: "#ff6458", transparent: true, opacity: 0.88 }));
314 |       marker.name = `Anchor_${anchor.id}`;
315 |       marker.position.set(anchor.position[0], 0.7, anchor.position[2]);
316 |       marker.visible = debugEnabled;
317 |       this.gameplaySkeleton.add(marker);
318 |     });
319 |     this.gameplaySkeleton.visible = debugEnabled || this.fallbackEnabled;
320 |   }
321 | 
322 |   private buildGroundAndWater() {
323 |     if (!this.legacyEnabled) {
324 |       tingYuXuanGroundPatches.forEach((patch) => {
325 |         const ground = new THREE.Mesh(new THREE.BoxGeometry(patch.size[0], patch.thickness, patch.size[1]), this.materials[patch.material]);
326 |         ground.name = `GroundPatch_${patch.id}`;
327 |         ground.position.set(...patch.center);
328 |         ground.rotation.y = patch.rotationY ?? 0;
329 |         ground.receiveShadow = true;
330 |         ground.userData.groundPatchLayer = patch.layer;
331 |         ground.userData.gameplayRegion = patch.regionId;
332 |         this.proceduralDressing.add(ground);
333 |       });
334 |       return;
335 |     }
336 | 
337 |     const ground = new THREE.Mesh(new THREE.BoxGeometry(46, 0.18, 78), this.materials["mud-wet"]);
338 |     ground.position.set(2, -0.13, 3);
339 |     ground.receiveShadow = true;
340 |     this.proceduralDressing.add(ground);
341 | 
342 |     const makePath = (name: string, size: [number, number], position: [number, number]) => {
343 |       const path = new THREE.Mesh(new THREE.BoxGeometry(size[0], 0.035, size[1]), this.materials["stone-wet"]);
344 |       path.name = name;
345 |       path.position.set(position[0], 0.005, position[1]);
346 |       path.receiveShadow = true;
347 |       this.proceduralDressing.add(path);
348 |     };
349 |     if (this.fallbackEnabled) {
350 |       makePath("Path_Front", [4, 16], [0, 23]);
351 |       makePath("Path_West_Court", [12, 7], [-6, 12]);
352 |       makePath("Path_West_Run", [3.2, 16], [-8, 4]);
353 |       makePath("Path_Cross_Run", [10, 3.2], [-3, -4]);
354 |       makePath("Path_Loop_Run", [3.2, 17], [2, -13]);
355 |     }
356 | 
357 |     const water = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.06, 13.8), this.waterMaterial);
358 |     water.name = "WaterCourt_Pond";
359 |     water.position.set(10, 0.05, -29);
360 |     this.proceduralDressing.add(water);
361 |     const pondFloor = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.12, 14.2), this.materials["stone-moss"]);
362 |     pondFloor.position.set(10, -0.22, -29);
363 |     this.proceduralDressing.add(pondFloor);
364 |     const pavilionDeck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 3.8), this.materials["stone-wet"]);
365 |     pavilionDeck.name = "PavilionStoneDeck";
366 |     pavilionDeck.position.set(10, 0.02, -32);
367 |     pavilionDeck.receiveShadow = true;
368 |     this.proceduralDressing.add(pavilionDeck);
369 | 
370 |     const bankMaterial = this.materials["stone-wet"];
371 |     const banks: Array<[string, [number, number, number], [number, number, number]]> = [
372 |       ["PondBank_West", [4.55, 0.03, -29], [0.72, 0.22, 15.1]],
373 |       ["PondBank_East", [15.45, 0.03, -29], [0.72, 0.22, 15.1]],
374 |       ["PondBank_North", [10, 0.03, -21.55], [11.5, 0.22, 0.72]],
375 |       ["PondBank_South", [10, 0.03, -36.45], [11.5, 0.22, 0.72]],
376 |     ];
377 |     banks.forEach(([name, position, size]) => {
378 |       const bank = new THREE.Mesh(new THREE.BoxGeometry(...size), bankMaterial);
379 |       bank.name = name;
380 |       bank.position.set(...position);
381 |       bank.receiveShadow = true;
382 |       this.proceduralDressing.add(bank);
383 |     });
384 | 
385 |     const rippleMaterial = new THREE.MeshBasicMaterial({ color: "#8bb8ab", transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
386 |     for (const [index, x, z, scale] of [[0, 7.2, -25.8, 1], [1, 11.2, -30.8, 1.35], [2, 13.7, -34, 0.85]] as const) {
387 |       const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.39, 40), rippleMaterial.clone());
388 |       ring.name = `WaterRipple_${index}`;
389 |       ring.rotation.x = -Math.PI / 2;
390 |       ring.position.set(x, 0.095, z);
391 |       ring.scale.setScalar(scale);
392 |       this.waterRipples.add(ring);
393 |     }
394 |     this.proceduralDressing.add(this.waterRipples);
395 |   }
396 | 
397 |   private buildDressing() {
398 |     if (!this.legacyEnabled) {
399 |       ["ROUTE_01_START", "ROUTE_02_A_ENTRY", "ROUTE_04_A_EAST_EXIT", "ROUTE_05_B_MAIN_COURT", "ROUTE_06_B_NORTHEAST_LINK", "ROUTE_07_C_ENTRY"].forEach((id, index) => {
400 |         const anchor = getGameplayAnchor(id as Parameters<typeof getGameplayAnchor>[0]);
401 |         const light = new THREE.PointLight(index >= 4 ? "#90b7a8" : "#d98a43", this.quality === "low" ? 3 : 6.5, 8, 1.9);
402 |         light.name = `LanternLight_${id}`;
403 |         light.userData.baseIntensity = light.intensity;
404 |         light.userData.flickerPhase = index * 0.73;
405 |         light.position.set(anchor.position[0] - 0.8, 2.25, anchor.position[2]);
406 |         this.proceduralDressing.add(light);
407 |       });
408 |       const cEntryFill = new THREE.PointLight("#4d8179", this.quality === "low" ? 2.5 : 5, 18, 1.8);
409 |       cEntryFill.name = "CEntry_WaterFill";
410 |       cEntryFill.position.set(-22, 1.2, 12.5);
411 |       this.proceduralDressing.add(cEntryFill);
412 |       this.buildMasterGroundSeams();
413 |       return;
414 |     }
415 | 
416 |     for (const [x, z] of [[0, 27], [0, 20], [-8, 10], [-8, 2], [2, -8], [2, -16]] as const) {
417 |       // The old CylinderGeometry lantern body read as a floating black proxy
418 |       // against the source-faithful architecture. Keep only the authored
419 |       // atmosphere light until a real lantern asset is selected.
420 |       const light = new THREE.PointLight("#d98a43", this.quality === "low" ? 3.5 : 7, 7, 1.9);
421 |       light.name = `LanternLight_${x}_${z}`;
422 |       light.userData.baseIntensity = light.intensity;
423 |       light.userData.flickerPhase = (Math.abs(x * 17 + z * 11) % 19) * 0.37;
424 |       light.position.set(x - 1.1, 2.25, z);
425 |       this.proceduralDressing.add(light);
426 |     }
427 | 
428 |     const addSlab = (name: string, x: number, z: number, sx = 1.35, sz = 0.78, rotation = 0) => {
429 |       const slab = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.05, sz), this.materials["stone-wet"]);
430 |       slab.name = name;
431 |       slab.position.set(x, 0.035, z);
432 |       slab.rotation.y = rotation;
433 |       slab.receiveShadow = true;
434 |       this.proceduralDressing.add(slab);
435 |     };
436 | 
437 |     [
438 |       [3.0, -22.6, -0.18], [4.2, -23.1, -0.26], [5.3, -23.8, -0.35],
439 |       [6.25, -24.6, -0.28], [7.15, -25.25, -0.12],
440 |     ].forEach(([x, z, rotation], index) => addSlab(`WaterApproach_${index}`, x, z, 1.45, 0.82, rotation));
441 |     [
442 |       [7.35, -28.65, -0.12], [8.05, -29.45, -0.48], [8.85, -30.15, -0.62], [9.55, -30.75, -0.7],
443 |     ].forEach(([x, z, rotation], index) => addSlab(`PavilionCauseway_${index}`, x, z, 1.35, 0.76, rotation));
444 | 
445 |     [
446 |       [8.8, -20.2, 0.35], [10.1, -19.55, 0.45], [11.25, -18.75, 0.58],
447 |       [12.25, -17.8, 0.68], [13.2, -16.8, 0.78],
448 |     ].forEach(([x, z, rotation], index) => addSlab(`RockeryPath_${index}`, x, z, 1.25, 0.7, rotation));
449 | 
450 |     for (let index = 0; index < 5; index += 1) addSlab(`NorthCourt_${index}`, 10, 6.5 + index * 1.25, 2.1, 0.88, 0);
451 |     for (let index = 0; index < 4; index += 1) addSlab(`InnerCourt_${index}`, -7.5 - index * 1.35, 18, 1.55, 0.84, Math.PI / 2);
452 | 
453 |     const pavilionGlow = new THREE.PointLight("#d7a65c", this.quality === "low" ? 4 : 8, 18, 1.7);
454 |     pavilionGlow.position.set(10, 3.2, -31.5);
455 |     this.proceduralDressing.add(pavilionGlow);
456 |     const waterFill = new THREE.PointLight("#4d8179", this.quality === "low" ? 2.5 : 5, 16, 1.8);
457 |     waterFill.position.set(9.5, 1.2, -27.5);
458 |     this.proceduralDressing.add(waterFill);
459 | 
460 |   }
461 | 
462 |   private buildMasterGroundSeams() {
463 |     const random = mulberry32(0x51ea0f);
464 |     const regions = [
465 |       { center: [7, 42.5] as const, half: [12, 13.5] as const },
466 |       { center: [-5, 24] as const, half: [11, 7] as const },
467 |       { center: [-18.5, 16.5] as const, half: [6.5, 4.5] as const },
468 |     ];
469 |     const tuftCount = this.quality === "high" ? 108 : this.quality === "stable" ? 64 : 30;
470 |     const tufts = new THREE.InstancedMesh(
471 |       new THREE.ConeGeometry(0.11, 0.34, 5),
472 |       new THREE.MeshStandardMaterial({ color: "#24382a", roughness: 0.94, metalness: 0 }),
473 |       tuftCount,
474 |     );
475 |     tufts.name = "GroundSeam_Tufts";
476 |     const matrix = new THREE.Matrix4();
477 |     const rotation = new THREE.Quaternion();
478 |     const scale = new THREE.Vector3();
479 |     const position = new THREE.Vector3();
480 |     const up = new THREE.Vector3(0, 1, 0);
481 |     for (let index = 0; index < tuftCount; index += 1) {
482 |       const region = regions[index % regions.length];
483 |       const edge = index % 4;
484 |       const edgeNoise = (random() - 0.5) * 0.85;
485 |       let x = region.center[0];
486 |       let z = region.center[1];
487 |       if (edge < 2) {
488 |         x += (random() * 2 - 1) * region.half[0];
489 |         z += (edge === 0 ? -region.half[1] : region.half[1]) + edgeNoise;
490 |       } else {
491 |         x += (edge === 2 ? -region.half[0] : region.half[0]) + edgeNoise;
492 |         z += (random() * 2 - 1) * region.half[1];
493 |       }
494 |       position.set(x, 0.17, z);
495 |       rotation.setFromAxisAngle(up, random() * Math.PI * 2);
496 |       const size = 0.65 + random() * 0.9;
497 |       scale.set(size, 0.72 + random() * 0.7, size);
498 |       matrix.compose(position, rotation, scale);
499 |       tufts.setMatrixAt(index, matrix);
500 |     }
501 |     tufts.instanceMatrix.needsUpdate = true;
502 |     tufts.receiveShadow = true;
503 |     this.proceduralDressing.add(tufts);
504 | 
505 |     const stoneCount = this.quality === "high" ? 48 : this.quality === "stable" ? 30 : 14;
506 |     const stones = new THREE.InstancedMesh(
507 |       new THREE.DodecahedronGeometry(0.13, 0),
508 |       new THREE.MeshStandardMaterial({ color: "#46504a", roughness: 0.88, metalness: 0.02 }),
509 |       stoneCount,
510 |     );
511 |     stones.name = "GroundSeam_Stones";
512 |     for (let index = 0; index < stoneCount; index += 1) {
513 |       const region = regions[(index + 1) % regions.length];
514 |       const side = index % 4;
515 |       const inset = 0.25 + random() * 0.75;
516 |       let x = region.center[0];
517 |       let z = region.center[1];
518 |       if (side < 2) {
519 |         x += (random() * 2 - 1) * region.half[0];
520 |         z += (side === 0 ? -region.half[1] : region.half[1]) + (random() - 0.5) * inset;
521 |       } else {
522 |         x += (side === 2 ? -region.half[0] : region.half[0]) + (random() - 0.5) * inset;
523 |         z += (random() * 2 - 1) * region.half[1];
524 |       }
525 |       position.set(x, 0.07, z);
526 |       rotation.setFromEuler(new THREE.Euler(random() * 0.35, random() * Math.PI * 2, random() * 0.35));
527 |       const sx = 0.55 + random() * 1.1;
528 |       scale.set(sx, 0.45 + random() * 0.55, 0.65 + random() * 1.2);
529 |       matrix.compose(position, rotation, scale);
530 |       stones.setMatrixAt(index, matrix);
531 |     }
532 |     stones.instanceMatrix.needsUpdate = true;
533 |     stones.castShadow = this.quality === "high";
534 |     stones.receiveShadow = true;
535 |     this.proceduralDressing.add(stones);
536 |   }
537 | 
538 |   private buildMemoryLayers() {
539 |     if (!this.legacyEnabled) {
540 |       // The same spot must read as two mutually exclusive pieces of topology,
541 |       // not merely as a color grade. Wife: a continuous wall. Gardener: a worn
542 |       // mossy service path with footprints leading through it.
543 |       const sealedWall = new THREE.Mesh(new THREE.BoxGeometry(3.15, 1.55, 0.24), this.materials["stone-old"]);
544 |       sealedWall.name = "Wife_SealedSidePath";
545 |       sealedWall.position.set(4.1, 0.78, 42.9);
546 |       sealedWall.rotation.y = -0.78;
547 |       sealedWall.castShadow = true;
548 |       sealedWall.receiveShadow = true;
549 |       this.wifeLayer.add(sealedWall);
550 |       const rainScuff = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.88), new THREE.MeshStandardMaterial({ color: "#584c36", roughness: 0.96 }));
551 |       rainScuff.name = "Wife_RainScuff";
552 |       rainScuff.position.set(4.05, 0.16, 42.85);
553 |       this.wifeLayer.add(rainScuff);
554 | 
555 |       const sidePath = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.045, 6.4), this.materials["stone-moss"]);
556 |       sidePath.name = "Gardener_SidePath";
557 |       sidePath.position.set(4.1, 0.13, 42.9);
558 |       sidePath.rotation.y = -2.35;
559 |       sidePath.receiveShadow = true;
560 |       this.gardenerLayer.add(sidePath);
561 |       const arrowMaterial = new THREE.MeshStandardMaterial({ color: "#6fb49b", emissive: "#2c725d", emissiveIntensity: 1.35, roughness: 0.75 });
562 |       [[5.2, 44], [4.1, 42.9], [3, 41.9]].forEach(([x, z]) => {
563 |         const marker = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.45, 5), arrowMaterial);
564 |         marker.rotation.x = -Math.PI / 2;
565 |         marker.rotation.z = 0.78;
566 |         marker.position.set(x, 0.22, z);
567 |         this.gardenerLayer.add(marker);
568 |       });
569 |       [[2.8, 42.2], [1.8, 41.2], [2.5, 40.2]].forEach(([x, z]) => {
570 |         const glyph = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.27, 24), new THREE.MeshBasicMaterial({ color: "#729a83", transparent: true, opacity: 0.72, side: THREE.DoubleSide }));
571 |         glyph.position.set(x, 1.35, z);
572 |         this.gardenerLayer.add(glyph);
573 |       });
574 |       return;
575 |     }
576 | 
577 |     const dryChannel = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.055, 12), this.materials["stone-old"]);
578 |     dryChannel.position.set(-8.95, 0.11, 5.5);
579 |     this.wifeLayer.add(dryChannel);
580 |     const nameSlip = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.025, 0.78), new THREE.MeshStandardMaterial({ color: "#b49d72", emissive: "#493413", emissiveIntensity: 1.1 }));
581 |     nameSlip.position.set(-8.92, 0.16, 6.1);
582 |     this.wifeLayer.add(nameSlip);
583 | 
584 |     const waterline = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.045, 13), new THREE.MeshStandardMaterial({ color: "#0c413b", emissive: "#082820", emissiveIntensity: 1.6, roughness: 0.08, metalness: 0.25 }));
585 |     waterline.position.set(-8.95, 0.13, 5.4);
586 |     this.gardenerLayer.add(waterline);
587 |     const arrowMaterial = new THREE.MeshStandardMaterial({ color: "#6fb49b", emissive: "#2c725d", emissiveIntensity: 2.5 });
588 |     for (let z = 10; z >= 1; z -= 2.5) {
589 |       const marker = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.45, 5), arrowMaterial);
590 |       marker.rotation.x = -Math.PI / 2;
591 |       marker.position.set(-8.94, 0.22, z);
592 |       this.gardenerLayer.add(marker);
593 |     }
594 |     for (let repeat = 0; repeat < 3; repeat += 1) {
595 |       const glyph = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.27, 24), new THREE.MeshBasicMaterial({ color: "#729a83", transparent: true, opacity: 0.72, side: THREE.DoubleSide }));
596 |       glyph.position.set(3.72, 1.35, -11.8 - repeat * 2.1);
597 |       glyph.rotation.y = -Math.PI / 2;
598 |       this.gardenerLayer.add(glyph);
599 |     }
600 |   }
601 | 
602 |   private buildMoonGateMemoryFrame() {
603 |     // Memory-only highlight: the real Courtyard Park geometry remains the architectural gate.
604 |     const gate = new THREE.Mesh(new THREE.TorusGeometry(1.24, 0.045, 12, 56), this.moonGateMaterial);
605 |     gate.name = "wife-moon-gate-memory-frame";
606 |     gate.position.set(this.legacyEnabled ? 2 : 1.9, 1.45, this.legacyEnabled ? -20.76 : 31.2);
607 |     this.wifeLayer.add(gate);
608 |     const darkness = new THREE.Mesh(new THREE.CircleGeometry(1.13, 48), new THREE.MeshBasicMaterial({ color: "#020504", transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
609 |     darkness.position.set(this.legacyEnabled ? 2 : 1.9, 1.45, this.legacyEnabled ? -20.72 : 31.16);
610 |     this.gardenerLayer.add(darkness);
611 |   }
612 | 
613 |   private buildGuidanceMarker() {
614 |     const material = new THREE.MeshBasicMaterial({ color: "#dfbd70", transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false });
615 |     const outer = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.49, 40), material);
616 |     outer.rotation.x = -Math.PI / 2;
617 |     outer.position.y = 0.04;
618 |     const inner = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 32), material.clone());
619 |     inner.rotation.x = -Math.PI / 2;
620 |     inner.position.y = 0.055;
621 |     const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.12, 1.55, 16, 1, true), new THREE.MeshBasicMaterial({ color: "#e4c67e", transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide }));
622 |     beam.position.y = 0.78;
623 |     this.guidanceMarker.add(outer, inner, beam);
624 |   }
625 | 
626 |   private buildFacelessOwner() {
627 |     const robe = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 1.05, 6, 14), new THREE.MeshStandardMaterial({ color: "#070807", roughness: 0.92 }));
628 |     robe.position.y = 0.85;
629 |     const face = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 12), new THREE.MeshStandardMaterial({ color: "#d0c9ae", roughness: 0.55, emissive: "#332d23", emissiveIntensity: 0.4 }));
630 |     face.scale.set(0.75, 1, 0.55);
631 |     face.position.y = 1.75;
632 |     this.facelessOwner.add(robe, face);
633 |   }
634 | 
635 |   private buildRain(count: number) {
636 |     const random = mulberry32(0x7159a11);
637 |     const geometry = new THREE.BufferGeometry();
638 |     const positions = new Float32Array(count * 3);
639 |     for (let index = 0; index < count; index += 1) {
640 |       positions[index * 3] = -34 + random() * 53;
641 |       positions[index * 3 + 1] = random() * 8;
642 |       positions[index * 3 + 2] = 57 - random() * 58;
643 |     }
644 |     geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
645 |     return new THREE.Points(geometry, new THREE.PointsMaterial({ color: "#9bb8b7", size: 0.035, transparent: true, opacity: 0.46, depthWrite: false }));
646 |   }
647 | 
648 |   setMemory(memory: MemoryId) {
649 |     this.memory = memory;
650 |     const layer = this.layers.find((item) => item.id === memory) ?? this.layers[0];
651 |     this.wifeLayer.visible = memory === "wife";
652 |     this.gardenerLayer.visible = memory === "gardener";
653 |     this.scene.background = new THREE.Color(layer.visual.fog);
654 |     this.scene.fog = new THREE.FogExp2(layer.visual.fog, memory === "gardener" ? 0.038 : 0.022);
655 |     this.memoryLight.color.set(layer.visual.keyLight);
656 |     this.memoryLight.intensity = memory === "gardener" ? 14 : 20;
657 |     this.waterMaterial.color.set(memory === "gardener" ? "#0b453c" : "#0b302d");
658 |     this.waterMaterial.roughness = memory === "gardener" ? 0.08 : 0.16;
659 |     this.moonGateMaterial.emissive.set(memory === "wife" ? "#72501e" : "#07100b");
660 |   }
661 | 
662 |   setOwnerVisible(visible: boolean, position?: THREE.Vector3) {
663 |     this.facelessOwner.visible = visible;
664 |     if (position) this.facelessOwner.position.copy(position);
665 |   }
666 | 
667 |   setGuidanceTarget(position?: THREE.Vector3) {
668 |     this.guidanceMarker.visible = Boolean(position);
669 |     if (position) this.guidanceMarker.position.set(position.x, 0, position.z);
670 |   }
671 | 
672 |   update(delta: number, player: THREE.Vector3, chasing: boolean) {
673 |     this.elapsed += delta;
674 |     const positions = this.rain.geometry.getAttribute("position") as THREE.BufferAttribute;
675 |     for (let index = 0; index < positions.count; index += 1) {
676 |       let y = positions.getY(index) - delta * 8;
677 |       if (y < 0) y = 5.5 + (index % 31) / 15;
678 |       positions.setY(index, y);
679 |     }
680 |     positions.needsUpdate = true;
681 |     if (this.guidanceMarker.visible) {
682 |       const pulse = 1 + Math.sin(this.elapsed * 3.2) * 0.08;
683 |       this.guidanceMarker.scale.set(pulse, 1, pulse);
684 |       this.guidanceMarker.rotation.y = this.elapsed * 0.35;
685 |     }
686 |     this.proceduralDressing.children.forEach((child) => {
687 |       if (!(child instanceof THREE.PointLight) || !child.name.startsWith("LanternLight_")) return;
688 |       const base = Number(child.userData.baseIntensity ?? child.intensity);
689 |       const phase = Number(child.userData.flickerPhase ?? 0);
690 |       child.intensity = base * (0.94 + Math.sin(this.elapsed * 5.7 + phase) * 0.035 + Math.sin(this.elapsed * 2.1 + phase * 0.7) * 0.02);
691 |     });
692 |     this.waterMaterial.opacity = 0.865 + Math.sin(this.elapsed * 0.55) * 0.025;
693 |     this.waterRipples.children.forEach((child, index) => {
694 |       const phase = (this.elapsed * 0.34 + index * 0.8) % 2.4;
695 |       const scale = 0.8 + phase * 0.55;
696 |       child.scale.setScalar(scale);
697 |       const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
698 |       material.opacity = Math.max(0, 0.18 * (1 - phase / 2.4));
699 |     });
700 |     if (chasing) {
701 |       this.facelessOwner.visible = true;
702 |       const direction = player.clone().setY(0).sub(this.facelessOwner.position);
703 |       const distance = direction.length();
704 |       if (distance > 0.01) this.facelessOwner.position.add(direction.normalize().multiplyScalar(delta * 2.35));
705 |       this.facelessOwner.rotation.y = Math.atan2(direction.x, direction.z);
706 |     }
707 |   }
708 | 
709 |   ownerDistance(player: THREE.Vector3) { return this.facelessOwner.position.distanceTo(player); }
710 |   activeMemory() { return this.memory; }
711 |   visibleModelNames() { return this.visualAssets.children.map((child) => child.name); }
712 |   loadedAssetIds() { return this.assetLoader.loadedAssetIds(); }
713 |   loadedAssetBytes() { return this.assetLoader.loadedByteEstimate(); }
714 |   architectureMode() { return this.legacyEnabled ? "legacy" : "master"; }
715 | 
716 |   dispose() {
717 |     this.assetLoader.dispose();
718 |     disposeObject(this.scene);
719 |   }
720 | }
721 | 
```

### garden-of-shadows-game/app/globals.css

Bytes: 43601
SHA-256: 9d6bde9414f0b67e8ce42a402de6d09f6052a480f0a1bb3a1ec3c3b983319d4d
Lines: 1-422 of 422

```css
  1 | :root {
  2 |   --night: #050a09;
  3 |   --ink: #0b1210;
  4 |   --ink-soft: #111b18;
  5 |   --jade: #173b34;
  6 |   --jade-bright: #5d927f;
  7 |   --paper: #ddd5c2;
  8 |   --paper-dim: #9e9a8c;
  9 |   --gold: #c1a56d;
 10 |   --gold-dark: #725a34;
 11 |   --red: #9a3f30;
 12 |   --line: rgba(194, 169, 112, 0.22);
 13 | }
 14 | 
 15 | * { box-sizing: border-box; }
 16 | html { scroll-behavior: smooth; background: var(--night); }
 17 | body { margin: 0; background: var(--night); color: var(--paper); font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif; }
 18 | button, select, input { font: inherit; }
 19 | button { color: inherit; }
 20 | a { color: inherit; text-decoration: none; }
 21 | .eyebrow { margin: 0; color: var(--gold); font: 600 10px/1.4 Arial, sans-serif; letter-spacing: .24em; text-transform: uppercase; }
 22 | .primary-button, .ghost-button, .danger-button { min-height: 48px; padding: 0 24px; border: 1px solid var(--gold); cursor: pointer; transition: .25s ease; }
 23 | .primary-button { background: var(--gold); color: #10130f; font-weight: 700; }
 24 | .primary-button:hover { background: #dfc184; box-shadow: 0 0 35px rgba(193,165,109,.18); }
 25 | .primary-button span { margin-left: 26px; }
 26 | .ghost-button { background: rgba(4,9,8,.4); color: var(--paper); border-color: rgba(221,213,194,.34); }
 27 | .ghost-button:hover { border-color: var(--paper); background: rgba(221,213,194,.08); }
 28 | .danger-button { background: #54251e; border-color: #9a4c3c; }
 29 | .danger-button:hover { background: #753127; }
 30 | 
 31 | /* Project shell */
 32 | .site-shell { min-height: 100vh; overflow: hidden; background: #090b0c; }
 33 | .site-nav { position: absolute; z-index: 20; top: 0; left: 0; right: 0; height: 88px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(22px, 5vw, 78px); border-bottom: 1px solid rgba(221,213,194,.1); }
 34 | .wordmark { display: flex; align-items: center; gap: 13px; }
 35 | .wordmark > i { display: grid; place-items: center; width: 39px; height: 39px; border: 1px solid var(--gold); color: var(--gold); font-style: normal; transform: rotate(45deg); }
 36 | .wordmark > i::first-letter { transform: rotate(-45deg); }
 37 | .wordmark span { font-size: 15px; letter-spacing: .15em; }
 38 | .wordmark small { display: block; margin-top: 4px; color: #837a69; font: 8px Arial, sans-serif; letter-spacing: .34em; }
 39 | .site-nav nav { display: flex; align-items: center; gap: clamp(18px, 3vw, 42px); color: #b1aa9b; font-size: 12px; letter-spacing: .1em; }
 40 | .site-nav nav a:hover { color: var(--gold); }
 41 | .site-nav nav button { padding: 8px 14px; border: 1px solid rgba(221,213,194,.24); background: transparent; cursor: pointer; }
 42 | 
 43 | .hero { position: relative; height: max(720px, 100vh); min-height: 680px; display: flex; align-items: center; padding: 90px clamp(24px, 8vw, 130px) 40px; border-bottom: 1px solid var(--line); overflow: hidden; }
 44 | .hero-image { position: absolute; inset: 0; background-image: url("/media/hero-hearing-rain.png"), radial-gradient(circle at 73% 42%, #203f37, #07100e 65%); background-size: cover; background-position: center; transform: scale(1.02); filter: saturate(.68) contrast(1.06); }
 45 | .hero-wash { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(4,8,7,.96) 0%, rgba(4,8,7,.72) 38%, rgba(4,8,7,.08) 75%), linear-gradient(0deg, #050a09 0%, transparent 24%, rgba(1,4,3,.28) 100%); }
 46 | .hero-content { position: relative; z-index: 2; max-width: 650px; }
 47 | .hero h1 { margin: 21px 0 0; color: #e4dccb; font-size: clamp(68px, 9.2vw, 138px); font-weight: 400; line-height: .92; letter-spacing: .12em; text-shadow: 0 10px 50px #000; }
 48 | .hero-subtitle { margin: 19px 0 34px; color: var(--gold); font-size: clamp(18px, 2vw, 28px); letter-spacing: .72em; }
 49 | .hero-logline { margin: 0 0 32px; color: #c0baa9; font-size: clamp(15px, 1.4vw, 19px); line-height: 2; letter-spacing: .06em; }
 50 | .hero-actions { display: flex; gap: 13px; }
 51 | .hero-meta { display: block; margin-top: 28px; color: #706b60; font: 9px Arial, sans-serif; letter-spacing: .24em; }
 52 | .scroll-mark { position: absolute; z-index: 2; right: 5vw; bottom: 42px; display: flex; align-items: center; gap: 15px; color: #777468; font-size: 9px; letter-spacing: .2em; writing-mode: vertical-rl; }
 53 | .scroll-mark i { width: 1px; height: 50px; background: linear-gradient(var(--gold), transparent); }
 54 | 
 55 | /* Home / case archive */
 56 | .case-directory {
 57 |   --archive-bg: #090b0c;
 58 |   --archive-copy: #d6d1c8;
 59 |   --archive-muted: #817f7a;
 60 |   --archive-gold: #a48650;
 61 |   --archive-line: rgba(164, 134, 80, .28);
 62 |   position: relative;
 63 |   min-height: 100svh;
 64 |   overflow: hidden;
 65 |   border-bottom: 1px solid var(--archive-line);
 66 |   background: var(--archive-bg);
 67 |   font-family: "Source Han Serif SC", "Noto Serif SC", "思源宋体", "Songti SC", "STSong", serif;
 68 | }
 69 | .case-directory-image { position: absolute; inset: 0; background-image: url("/media/hero-hearing-rain.png"), radial-gradient(circle at 78% 42%, #18252b 0%, #0b1115 46%, #090b0c 78%); background-size: cover; background-position: 72% center; filter: saturate(.72) contrast(1.07) brightness(.78); transform: scale(1.015); }
 70 | .case-directory-wash { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(9,11,12,.99) 0%, rgba(9,11,12,.97) 30%, rgba(9,11,12,.72) 48%, rgba(9,11,12,.18) 72%, rgba(9,11,12,.28) 100%), linear-gradient(0deg, rgba(9,11,12,.82) 0%, transparent 34%, rgba(5,8,9,.22) 100%); }
 71 | .case-directory-rule { position: absolute; z-index: 2; top: clamp(26px, 4.2vh, 52px); bottom: clamp(26px, 4.2vh, 52px); left: min(47vw, 720px); width: 1px; background: linear-gradient(transparent, var(--archive-line) 12%, var(--archive-line) 88%, transparent); opacity: .7; }
 72 | .case-directory-panel { position: relative; z-index: 3; display: grid; grid-template-rows: auto minmax(120px, .68fr) auto 1fr auto; width: min(47vw, 720px); min-height: 100svh; padding: clamp(28px, 5vh, 58px) clamp(28px, 5vw, 76px) clamp(28px, 4.5vh, 48px); border-right: 1px solid rgba(214,209,200,.04); background: linear-gradient(90deg, rgba(9,11,12,.36), transparent); }
 73 | .case-brand { position: relative; display: flex; width: fit-content; align-items: center; gap: 17px; padding-bottom: 20px; }
 74 | .case-brand::after { content: ""; position: absolute; left: 0; bottom: 0; width: clamp(180px, 20vw, 300px); height: 1px; background: linear-gradient(90deg, var(--archive-gold), transparent); opacity: .6; }
 75 | .case-brand-mark { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid var(--archive-gold); transform: rotate(45deg); }
 76 | .case-brand-mark i { color: var(--archive-gold); font-size: 15px; font-style: normal; transform: rotate(-45deg); }
 77 | .case-brand-copy { display: grid; gap: 5px; }
 78 | .case-brand-copy strong { color: var(--archive-copy); font-size: 17px; font-weight: 400; letter-spacing: .22em; }
 79 | .case-brand-copy small { color: var(--archive-gold); font-size: 10px; letter-spacing: .48em; }
 80 | .case-directory-heading { align-self: end; padding-bottom: clamp(24px, 3.8vh, 44px); }
 81 | .case-kicker { display: block; margin-bottom: 14px; color: var(--archive-muted); font-family: "Cormorant Garamond", "EB Garamond", Georgia, serif; font-size: 10px; letter-spacing: .26em; }
 82 | .case-directory-heading h1 { margin: 0; color: var(--archive-copy); font-size: clamp(38px, 4.4vw, 66px); font-weight: 400; line-height: 1.12; letter-spacing: .14em; }
 83 | .case-directory-heading p { margin: 12px 0 0; color: var(--archive-gold); font-family: "Cormorant Garamond", "Cinzel", "EB Garamond", Georgia, serif; font-size: clamp(11px, 1vw, 14px); letter-spacing: .26em; }
 84 | .home-menu { display: grid; align-content: center; border-top: 1px solid rgba(164,134,80,.18); }
 85 | .home-menu-item { position: relative; display: grid; grid-template-columns: 48px minmax(0, 1fr) 24px; gap: 14px; align-items: center; min-height: 78px; padding: 11px 14px 11px 4px; border: 0; border-bottom: 1px solid rgba(164,134,80,.17); background: transparent; color: var(--archive-copy); text-align: left; cursor: pointer; transition: border-color .22s ease, background .22s ease, box-shadow .22s ease, transform .22s ease; }
 86 | .home-menu-item::before { content: ""; position: absolute; left: -1px; top: 11px; bottom: 11px; width: 1px; background: transparent; box-shadow: none; transition: .22s ease; }
 87 | .home-menu-item:hover, .home-menu-item:focus-visible, .home-menu-item.active { z-index: 1; outline: none; border-color: rgba(164,134,80,.58); background: linear-gradient(90deg, rgba(164,134,80,.105), rgba(164,134,80,.018) 72%, transparent); box-shadow: inset 0 0 0 1px rgba(164,134,80,.26), 0 0 28px rgba(164,134,80,.055); }
 88 | .home-menu-item:hover::before, .home-menu-item:focus-visible::before, .home-menu-item.active::before { background: #b79a66; box-shadow: 0 0 15px rgba(183,154,102,.5); }
 89 | .home-menu-number { color: #716344; font-family: "Cormorant Garamond", "Cinzel", Georgia, serif; font-size: 19px; font-weight: 400; letter-spacing: .08em; transition: color .22s ease; }
 90 | .home-menu-copy { display: grid; gap: 5px; }
 91 | .home-menu-copy strong { color: #cfc9be; font-size: clamp(16px, 1.45vw, 20px); font-weight: 400; letter-spacing: .09em; }
 92 | .home-menu-copy small { color: #686660; font-family: "Cormorant Garamond", "Cinzel", "EB Garamond", Georgia, serif; font-size: 9px; letter-spacing: .2em; transition: color .22s ease; }
 93 | .home-menu-item > i { color: #514a3a; font-family: Georgia, serif; font-size: 13px; font-style: normal; opacity: 0; transform: translate(-6px, 4px); transition: .22s ease; }
 94 | .home-menu-item:hover .home-menu-number, .home-menu-item:focus-visible .home-menu-number, .home-menu-item.active .home-menu-number { color: #b79a66; }
 95 | .home-menu-item:hover .home-menu-copy strong, .home-menu-item:focus-visible .home-menu-copy strong, .home-menu-item.active .home-menu-copy strong { color: #eee7d9; }
 96 | .home-menu-item:hover .home-menu-copy small, .home-menu-item:focus-visible .home-menu-copy small, .home-menu-item.active .home-menu-copy small { color: #9f8a62; }
 97 | .home-menu-item:hover > i, .home-menu-item:focus-visible > i, .home-menu-item.active > i { opacity: .72; transform: translate(0, 0); }
 98 | .case-directory-meta { align-self: end; display: grid; gap: 13px; padding-top: clamp(22px, 3vh, 34px); color: #686660; font-family: "Cormorant Garamond", "EB Garamond", Georgia, serif; font-size: 9px; letter-spacing: .22em; }
 99 | .case-directory-meta i { display: block; width: min(250px, 74%); height: 1px; background: linear-gradient(90deg, var(--archive-line), transparent); }
100 | 
101 | .case-section, .chapters-section, .roadmap-section { padding: 110px clamp(24px, 8vw, 130px); }
102 | .section-heading { max-width: 810px; margin-bottom: 62px; }
103 | .section-heading.compact { margin-bottom: 46px; }
104 | .section-heading h2, .roadmap-section h2 { margin: 15px 0 19px; color: #e2dac8; font-size: clamp(34px, 4.2vw, 62px); font-weight: 400; line-height: 1.2; }
105 | .section-heading > p:last-child { color: var(--paper-dim); font-size: 15px; line-height: 1.9; }
106 | .case-section { position: relative; background: linear-gradient(135deg, #0b1412, #070b0a 60%); }
107 | .case-section::before { content: "证"; position: absolute; right: 4%; top: 2%; color: rgba(193,165,109,.025); font-size: 34vw; line-height: 1; }
108 | .case-grid { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
109 | .case-grid article { min-height: 250px; padding: 34px 28px; border-right: 1px solid var(--line); }
110 | .case-grid article:last-child { border-right: 0; }
111 | .case-grid span { color: var(--gold-dark); font: 11px Arial, sans-serif; }
112 | .case-grid h3 { margin: 47px 0 15px; font-size: 22px; font-weight: 400; letter-spacing: .08em; }
113 | .case-grid p { margin: 0; color: #8e8b80; font-size: 13px; line-height: 1.8; }
114 | 
115 | .chapters-section { background: #070b0a; }
116 | .chapter-list { border-top: 1px solid var(--line); }
117 | .chapter-list article { position: relative; display: grid; grid-template-columns: 70px 1fr 90px 44px; gap: 18px; align-items: center; min-height: 116px; padding: 16px 0; border-bottom: 1px solid rgba(193,165,109,.16); opacity: .5; transition: .25s ease; }
118 | .chapter-list article:hover, .chapter-list article.playable, .chapter-list article.completed { opacity: 1; }
119 | .chapter-list article.playable { background: linear-gradient(90deg, rgba(41,91,77,.16), transparent 70%); }
120 | .chapter-list article > b { color: #5b5548; font: 24px Arial, sans-serif; }
121 | .chapter-list article div > span { color: var(--gold-dark); font: 9px Arial, sans-serif; letter-spacing: .14em; }
122 | .chapter-list h3 { display: inline-block; margin: 8px 18px 4px 0; font-size: 24px; font-weight: 400; letter-spacing: .08em; }
123 | .chapter-list p { display: inline; margin: 0; color: #858276; font-size: 12px; }
124 | .chapter-list em { justify-self: end; color: #706b60; font-size: 10px; font-style: normal; letter-spacing: .12em; }
125 | .chapter-list article.playable > em { color: var(--jade-bright); }
126 | .chapter-list article.completed > em { color: var(--gold); }
127 | .chapter-list article > button { width: 38px; height: 38px; border: 1px solid var(--gold-dark); background: transparent; cursor: pointer; }
128 | .chapter-list article > button:hover { border-color: var(--gold); background: var(--gold); color: #111; }
129 | 
130 | .roadmap-section { display: grid; grid-template-columns: .85fr 1.15fr; gap: 8vw; background: linear-gradient(135deg, #101a17, #08100e); border-block: 1px solid var(--line); }
131 | .roadmap-section ol { position: relative; margin: 0; padding: 0; list-style: none; }
132 | .roadmap-section ol::before { content: ""; position: absolute; left: 11px; top: 14px; bottom: 16px; width: 1px; background: var(--line); }
133 | .roadmap-section li { position: relative; display: grid; grid-template-columns: 70px 1fr; padding: 0 0 36px 44px; }
134 | .roadmap-section li::before { content: ""; position: absolute; left: 6px; top: 7px; width: 10px; height: 10px; border: 1px solid var(--gold-dark); border-radius: 50%; background: #0b1412; }
135 | .roadmap-section li.active::before { background: var(--gold); box-shadow: 0 0 20px var(--gold); }
136 | .roadmap-section li b { color: var(--gold); font: 11px Arial, sans-serif; }
137 | .roadmap-section li span { font-size: 17px; }
138 | .roadmap-section li small { grid-column: 2; margin-top: 7px; color: #7f7c71; line-height: 1.6; }
139 | .site-footer { display: flex; justify-content: space-between; padding: 30px clamp(24px, 8vw, 130px); color: #645f55; font: 9px Arial, sans-serif; letter-spacing: .14em; }
140 | .site-footer a { color: #9d8961; text-decoration: none; }
141 | 
142 | /* Panels */
143 | .page-modal-backdrop, .runtime-modal-backdrop, .notebook-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(1,4,3,.83); backdrop-filter: blur(12px); }
144 | .prologue-panel, .settings-panel { position: relative; width: min(720px, 94vw); max-height: 90vh; overflow: auto; padding: clamp(32px, 6vw, 64px); border: 1px solid rgba(193,165,109,.38); background: linear-gradient(145deg, #15201c, #0a0f0d); box-shadow: 0 30px 100px #000; }
145 | .prologue-panel::before { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(193,165,109,.08); pointer-events: none; }
146 | .panel-close, .notebook-close { position: absolute; right: 18px; top: 13px; width: 34px; height: 34px; border: 0; background: transparent; color: #aaa18d; font-size: 26px; cursor: pointer; }
147 | .prologue-panel h2, .settings-panel h2 { margin: 14px 0 31px; font-size: clamp(35px, 5vw, 54px); font-weight: 400; }
148 | .prologue-copy { color: #b5afa0; font-size: 15px; line-height: 2; }
149 | .prologue-copy blockquote, .runtime-modal blockquote { margin: 25px 0; padding: 13px 20px; border-left: 1px solid var(--gold); color: #d5cab4; background: rgba(193,165,109,.05); }
150 | .settings-panel .setting-row { display: flex; justify-content: space-between; align-items: center; gap: 28px; padding: 18px 0; border-bottom: 1px solid var(--line); }
151 | .settings-panel .setting-row span { display: grid; gap: 5px; }
152 | .settings-panel .setting-row label { font-weight: 400; }
153 | .settings-panel label small, .settings-note { color: #777368; font-size: 11px; }
154 | .settings-panel select { min-width: 130px; padding: 8px 10px; border: 1px solid #51482f; background: #0b100e; color: var(--paper); }
155 | .settings-panel input[type="checkbox"] { width: 20px; height: 20px; accent-color: var(--gold); }
156 | .settings-panel input[type="range"] { accent-color: var(--gold); }
157 | .reset-button { margin-top: 32px; padding: 8px 0; border: 0; border-bottom: 1px solid #804033; background: transparent; color: #b66f60; cursor: pointer; }
158 | 
159 | /* Runtime */
160 | .runtime { position: relative; width: 100vw; height: 100dvh; overflow: hidden; background: #030706; color: var(--paper); }
161 | .runtime-loading { width: 100vw; height: 100dvh; display: grid; place-content: center; gap: 12px; text-align: center; background: radial-gradient(circle, #14231e, #040807 70%); }
162 | .runtime-loading strong { font-size: 24px; font-weight: 400; letter-spacing: .12em; }
163 | .runtime-canvas { display: block; width: 100%; height: 100%; outline: none; }
164 | .visual-regression-mode:not(.visual-regression-ui):not(.runtime-phase-error) > :not(.runtime-canvas):not(.vignette) { display: none !important; }
165 | .vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle, transparent 45%, rgba(0,0,0,.48) 100%), linear-gradient(0deg, rgba(2,5,4,.7), transparent 18%, transparent 84%, rgba(2,5,4,.55)); }
166 | .runtime-gardener .vignette { background: radial-gradient(circle, transparent 38%, rgba(0,20,14,.56) 100%), linear-gradient(0deg, rgba(2,7,5,.72), transparent 22%); }
167 | .runtime-north-past .vignette { background: radial-gradient(circle, transparent 42%, rgba(39,28,15,.42) 100%), linear-gradient(0deg, rgba(18,12,5,.56), transparent 25%, rgba(159,123,63,.08)); }
168 | .runtime-accountant .memory-card { border-left-color: #73a9c6; }
169 | .north-transition { position: absolute; z-index: 60; inset: 0; display: grid; place-items: center; overflow: hidden; pointer-events: none; background: rgba(2,7,7,.92); animation: north-transition-veil 2.6s ease-in-out both; }
170 | .north-transition::before, .north-transition::after { content: ""; position: absolute; left: 50%; top: 50%; width: 42vmin; height: 42vmin; border: 1px solid rgba(124,185,196,.34); border-radius: 50%; transform: translate(-50%, -50%); animation: borrowed-ripple 1.45s ease-out infinite; }
171 | .north-transition::after { animation-delay: .42s; }
172 | .north-transition > i { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent 0 54px, rgba(202,177,112,.11) 55px 56px); opacity: .34; transform: perspective(520px) rotateX(64deg) scale(1.5); }
173 | .north-transition > div { position: relative; z-index: 2; width: min(720px, 82vw); padding: 30px; text-align: center; text-shadow: 0 4px 24px #000; animation: north-transition-copy 2.6s ease-in-out both; }
174 | .north-transition span { display: block; color: #a99563; font: 10px Arial, sans-serif; letter-spacing: .22em; }
175 | .north-transition strong { display: block; margin-top: 16px; color: #eee3cb; font-size: clamp(25px, 4vw, 48px); font-weight: 400; letter-spacing: .08em; }
176 | .north-transition p { color: #aaa697; font-size: 13px; letter-spacing: .08em; }
177 | .north-transition-to-past, .north-transition-to-present { animation-duration: 2.1s; background: rgba(3,14,15,.92); }
178 | .north-transition-to-past > div, .north-transition-to-present > div { animation-duration: 2.1s; }
179 | .north-transition-to-present::before, .north-transition-to-present::after { border-color: rgba(205,178,112,.34); }
180 | .north-transition-stairs { animation-name: north-stairs-veil; }
181 | .north-transition-stairs::before, .north-transition-stairs::after { display: none; }
182 | @keyframes north-transition-veil { 0% { opacity: 0; background: rgba(2,7,7,0); } 18%, 78% { opacity: 1; } 48%, 58% { background: rgba(2,7,7,.98); } 100% { opacity: 0; background: rgba(2,7,7,0); } }
183 | @keyframes north-stairs-veil { 0%, 100% { opacity: 0; background: rgba(2,7,7,0); } 18%, 82% { opacity: 1; background: rgba(2,7,7,.42); } 48%, 58% { background: rgba(2,7,7,.64); } }
184 | @keyframes north-transition-copy { 0%, 14%, 86%, 100% { opacity: 0; transform: translateY(14px); } 34%, 68% { opacity: 1; transform: translateY(0); } }
185 | @keyframes borrowed-ripple { from { opacity: .8; transform: translate(-50%, -50%) scale(.35); } to { opacity: 0; transform: translate(-50%, -50%) scale(2.4); } }
186 | .runtime-topbar { position: absolute; z-index: 10; top: 0; left: 0; right: 0; height: 75px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 34px; border-bottom: 1px solid rgba(221,213,194,.13); background: linear-gradient(#050907d6, transparent); }
187 | .text-button { justify-self: start; padding: 8px; border: 0; background: transparent; color: #9f9889; cursor: pointer; }
188 | .runtime-topbar > div:nth-child(2) { display: flex; align-items: baseline; gap: 12px; }
189 | .runtime-topbar span { color: var(--gold); font-size: 9px; letter-spacing: .16em; }
190 | .runtime-topbar strong { font-size: 18px; font-weight: 400; letter-spacing: .12em; }
191 | .runtime-status { justify-self: end; color: #8d887c; font: 9px Arial, sans-serif; }
192 | .status-dot { display: inline-block; width: 6px; height: 6px; margin-right: 6px; border-radius: 50%; background: #65a687; box-shadow: 0 0 9px #65a687; }
193 | .runtime-debug-hud { position: absolute; z-index: 24; top: 86px; left: 50%; display: grid; grid-template-columns: repeat(2, auto); gap: 5px 16px; min-width: 280px; padding: 10px 13px; transform: translateX(-50%); border: 1px solid rgba(101,166,135,.42); background: rgba(2,8,7,.86); color: #a9c8b8; font: 10px/1.35 Consolas, monospace; pointer-events: none; }
194 | .runtime-debug-hud strong { grid-column: 1 / -1; color: #d8c184; font-size: 10px; letter-spacing: .08em; }
195 | .runtime-debug-hud span { color: #a9c8b8; }
196 | .memory-card, .case-progress, .objective-card { position: absolute; z-index: 10; width: 250px; padding: 18px; border: 1px solid rgba(193,165,109,.28); background: rgba(5,10,8,.8); backdrop-filter: blur(10px); box-shadow: 0 12px 45px rgba(0,0,0,.18); }
197 | .objective-card { top: 96px; left: 28px; width: min(330px, calc(100vw - 56px)); border-left: 3px solid var(--gold); }
198 | .objective-card::after { content: ""; position: absolute; left: -3px; top: 0; width: 3px; height: 38%; background: #e0c783; box-shadow: 0 0 16px #d9b969; }
199 | .objective-card span, .memory-card span, .case-progress span { display: block; color: var(--gold-dark); font: 9px Arial, sans-serif; letter-spacing: .14em; }
200 | .objective-card strong { display: block; margin: 9px 0 8px; color: #eee3cc; font-size: 19px; font-weight: 400; letter-spacing: .08em; }
201 | .objective-card p { margin: 0; color: #d7cebd; font-size: 13px; line-height: 1.65; }
202 | .objective-card small { display: block; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--line); color: #c4b58f; font-size: 11px; line-height: 1.6; }
203 | .chapter-test-route { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(193,165,109,.2); }
204 | .chapter-test-route b { color: #bca66e; font: 10px Arial, sans-serif; letter-spacing: .1em; }
205 | .chapter-test-route ol { display: grid; gap: 5px; margin: 9px 0 0; padding: 0; list-style: none; }
206 | .chapter-test-route li { display: grid; grid-template-columns: 18px 1fr; align-items: center; color: #736f66; font-size: 10px; line-height: 1.35; }
207 | .chapter-test-route li i { display: grid; place-items: center; width: 14px; height: 14px; border: 1px solid #4d4b44; border-radius: 50%; font: 8px Arial, sans-serif; font-style: normal; }
208 | .chapter-test-route li.active { color: #ead8aa; }
209 | .chapter-test-route li.active i { border-color: #d0ae60; color: #e2c779; box-shadow: 0 0 8px rgba(208,174,96,.32); }
210 | .chapter-test-route li.done { color: #6f9f89; }
211 | .chapter-test-route li.done i { border-color: #568672; color: #8bc1a8; }
212 | .memory-card { top: auto; bottom: 22px; left: 28px; border-left: 2px solid var(--jade-bright); }
213 | .case-progress { top: 96px; right: 28px; text-align: right; }
214 | .memory-card strong, .case-progress strong { display: block; margin: 8px 0 7px; font-size: 19px; font-weight: 400; }
215 | .memory-card small, .case-progress small { color: #858176; font-size: 10px; line-height: 1.6; }
216 | .investigation-traces { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; padding-top: 9px; border-top: 1px solid rgba(193,165,109,.14); }
217 | .investigation-traces i { padding: 3px 6px; border: 1px solid rgba(115,169,198,.3); background: rgba(29,60,70,.34); color: #91b8c6; font: 8px Arial, sans-serif; font-style: normal; letter-spacing: .08em; }
218 | .case-progress button { display: block; width: 100%; margin-top: 13px; padding: 8px; border: 1px solid #4e493c; background: transparent; color: #aaa08e; font-size: 10px; cursor: pointer; }
219 | .interaction-prompt { position: absolute; z-index: 12; left: 50%; top: 58%; transform: translate(-50%, -50%); padding: 10px 15px; border: 1px solid rgba(193,165,109,.5); background: rgba(4,8,7,.72); color: #e4d8bd; font-size: 12px; letter-spacing: .08em; }
220 | .pointer-lock-callout { position: absolute; z-index: 16; left: 50%; top: 70%; transform: translateX(-50%); padding: 10px 16px; border: 1px solid rgba(193,165,109,.5); background: rgba(4,8,7,.88); color: #d9ceb7; cursor: pointer; }
221 | .objective-direction { position: absolute; z-index: 14; top: 88px; left: 50%; display: grid; justify-items: center; gap: 3px; transform: translateX(-50%); color: #dfc986; font: 10px Arial, sans-serif; letter-spacing: .12em; text-shadow: 0 2px 8px #000; }
222 | .objective-direction i { display: grid; place-items: center; width: 34px; height: 34px; font-size: 27px; font-style: normal; filter: drop-shadow(0 0 8px rgba(223,201,134,.7)); transition: transform .12s linear; }
223 | .bark-subtitle { position: absolute; z-index: 18; left: 50%; bottom: 58px; display: flex; align-items: end; width: min(760px, 82vw); min-height: 74px; transform: translateX(-50%); pointer-events: none; }
224 | .bark-subtitle img { width: 88px; height: 116px; object-fit: contain; object-position: bottom; filter: drop-shadow(0 7px 14px #000); }
225 | .bark-subtitle p { flex: 1; margin: 0 0 3px -9px; padding: 13px 20px 13px 24px; border-left: 2px solid var(--gold); background: rgba(2,5,4,.82); color: #e3ddcf; font-size: 13px; line-height: 1.65; text-shadow: 0 2px 5px #000; backdrop-filter: blur(8px); }
226 | .bark-subtitle b { display: block; margin-bottom: 3px; color: var(--gold); font-size: 10px; font-weight: 400; letter-spacing: .14em; }
227 | .runtime-controls { position: absolute; z-index: 11; right: 26px; bottom: 20px; color: rgba(221,213,194,.45); font: 9px Arial, sans-serif; letter-spacing: .12em; }
228 | .touch-controls { display: none; }
229 | .runtime-modal-backdrop { position: absolute; z-index: 50; background: rgba(1,4,3,.6); }
230 | .runtime-modal { width: min(610px, 92vw); padding: clamp(32px, 5vw, 55px); border: 1px solid rgba(193,165,109,.46); border-left: 2px solid var(--gold); background: rgba(10,17,14,.95); box-shadow: 0 30px 100px #000; }
231 | .runtime-modal h1 { margin: 13px 0 20px; font-size: clamp(31px, 5vw, 54px); font-weight: 400; line-height: 1.2; }
232 | .runtime-modal > p:not(.eyebrow) { color: #aaa596; line-height: 1.8; }
233 | .choice-stack { display: grid; gap: 10px; margin-top: 25px; }
234 | .choice-stack button { padding: 16px 18px; border: 1px solid #4f493b; background: #121b18; color: #cfc7b8; text-align: left; cursor: pointer; }
235 | .choice-stack button:hover { border-color: var(--gold); background: #1b2823; }
236 | 
237 | /* Dialogue stage */
238 | .dialogue { position: absolute; z-index: 70; inset: 0; }
239 | .dialogue-stage { overflow: hidden; background: rgba(1,4,3,.25); }
240 | .dialogue-scene { position: absolute; inset: 0; background-position: center; background-size: cover; filter: saturate(.9) contrast(1.04); transform: scale(1.015); animation: dialogue-scene-enter 1.2s ease-out both; }
241 | .dialogue-curtain { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(2,5,4,.9) 0%, rgba(2,5,4,.08) 58%, rgba(2,5,4,.38) 100%); backdrop-filter: blur(1.5px) saturate(.78); }
242 | @keyframes dialogue-scene-enter { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: scale(1.015); } }
243 | .portrait { position: absolute; z-index: 2; bottom: 0; width: min(34vw, 520px); height: min(78vh, 820px); pointer-events: none; transition: opacity .25s ease, filter .25s ease, transform .25s ease; }
244 | .portrait img { width: 100%; height: 100%; object-fit: contain; object-position: bottom; filter: drop-shadow(0 20px 38px rgba(0,0,0,.75)); }
245 | .portrait-left { left: max(0px, calc(50% - 760px)); transform-origin: bottom left; }
246 | .portrait-right { right: max(0px, calc(50% - 760px)); transform-origin: bottom right; }
247 | .portrait.inactive { opacity: .43; filter: grayscale(.32) brightness(.62); transform: scale(.96) translateY(12px); }
248 | .portrait.active { opacity: 1; filter: saturate(1.04) brightness(1.03); transform: scale(1.02); }
249 | .dialogue-box { --speaker-color: var(--gold); position: absolute; z-index: 5; left: 50%; bottom: 28px; width: min(780px, 72vw); min-height: 172px; transform: translateX(-50%); padding: 24px 30px 22px; border: 1px solid rgba(216,194,142,.48); border-top: 2px solid var(--speaker-color); background: linear-gradient(135deg, rgba(12,20,17,.96), rgba(5,9,8,.98)); box-shadow: 0 24px 80px rgba(0,0,0,.75), inset 0 1px rgba(255,255,255,.04); cursor: pointer; }
250 | .dialogue-box::before { content: ""; position: absolute; inset: 8px; border: 1px solid rgba(193,165,109,.09); pointer-events: none; }
251 | .dialogue-toolbar { position: relative; display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-bottom: 5px; color: #777267; font: 9px Arial, sans-serif; letter-spacing: .1em; }
252 | .dialogue-toolbar > span { margin-right: auto; color: #827659; }
253 | .dialogue-toolbar button { padding: 4px 7px; border: 0; border-bottom: 1px solid #4c4638; background: transparent; color: #8e887c; font-size: 9px; cursor: pointer; }
254 | .dialogue-name { position: relative; display: block; color: var(--speaker-color); font-size: 13px; font-weight: 400; letter-spacing: .14em; }
255 | .dialogue-advance { position: relative; display: block; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
256 | .dialogue-advance > p { position: relative; min-height: 54px; margin: 11px 0 0; color: #eee7d9; font-size: clamp(15px, 1.2vw, 18px); line-height: 1.85; letter-spacing: .035em; }
257 | .dialogue-advance > p i { display: inline-block; width: 5px; height: 5px; margin-left: 10px; border-right: 1px solid var(--gold); border-bottom: 1px solid var(--gold); opacity: 0; transform: rotate(45deg) translateY(-2px); }
258 | .dialogue-advance > p i.ready { opacity: 1; animation: dialogue-caret 1.3s ease-in-out infinite; }
259 | .dialogue-choices { position: relative; display: grid; gap: 8px; margin-top: 12px; }
260 | .dialogue-choices button { padding: 11px 15px; border: 1px solid rgba(193,165,109,.32); background: rgba(26,39,33,.85); color: #d9d0bd; text-align: left; cursor: pointer; }
261 | .dialogue-choices button:hover, .dialogue-choices button:focus-visible { border-color: var(--gold); background: #23372f; outline: none; }
262 | .dialogue-log { position: absolute; z-index: 20; top: 76px; right: 26px; bottom: 26px; width: min(440px, calc(100vw - 52px)); overflow: auto; padding: 24px; border: 1px solid var(--line); background: rgba(6,11,9,.97); box-shadow: 0 20px 70px #000; }
263 | .dialogue-log > button { float: right; padding: 5px 9px; border: 1px solid #4f493b; background: transparent; font-size: 10px; cursor: pointer; }
264 | .dialogue-log p { clear: both; margin: 0; padding: 14px 0; border-bottom: 1px solid var(--line); color: #aaa596; font-size: 12px; line-height: 1.7; }
265 | .dialogue-log b { display: block; margin-bottom: 4px; color: var(--gold); font-weight: 400; }
266 | 
267 | .dialogue-bark { z-index: 22; pointer-events: none; }
268 | .dialogue-bark .portrait { width: 118px; height: 170px; right: calc(50% + min(300px, 35vw)); left: auto; bottom: 48px; opacity: 1; filter: none; transform: none; }
269 | .dialogue-bark .portrait-left { display: none; }
270 | .dialogue-bark .dialogue-box { width: min(650px, 70vw); min-height: 112px; bottom: 48px; padding: 16px 22px; pointer-events: auto; }
271 | .dialogue-bark .dialogue-advance > p { min-height: 32px; margin-top: 6px; font-size: 14px; }
272 | .dialogue-bark .dialogue-toolbar > span { display: none; }
273 | 
274 | .resume-control { position: absolute; z-index: 30; left: 50%; top: 52%; display: grid; gap: 5px; transform: translate(-50%,-50%); min-width: 220px; padding: 17px 24px; border: 1px solid var(--gold); background: rgba(7,13,11,.9); color: #e0d6c2; cursor: pointer; box-shadow: 0 10px 50px #000; }
275 | .resume-control span { font-size: 16px; letter-spacing: .12em; }
276 | .resume-control small { color: #858075; font-size: 9px; letter-spacing: .08em; }
277 | .notebook-rule { display: flex; justify-content: space-between; gap: 18px; margin-bottom: 18px; padding: 12px 14px; border: 1px solid rgba(193,165,109,.24); background: rgba(193,165,109,.05); color: #c9bea7; font-size: 11px; }
278 | .notebook-rule b { color: var(--gold); font-weight: 400; }
279 | 
280 | @keyframes dialogue-caret { 50% { transform: rotate(45deg) translate(2px, 0); opacity: .35; } }
281 | 
282 | .notebook-backdrop { z-index: 80; }
283 | .notebook { position: relative; width: min(700px, 94vw); padding: 42px; border: 1px solid #6c5f42; background: #131914; box-shadow: 0 35px 100px #000; }
284 | .notebook h2 { margin: 10px 0 28px; font-size: 36px; font-weight: 400; }
285 | .notebook article { display: grid; grid-template-columns: 42px 1fr auto; gap: 16px; align-items: center; padding: 18px 0; border-top: 1px solid var(--line); opacity: .55; }
286 | .notebook article.confirmed { opacity: 1; }
287 | .notebook article b { color: var(--gold-dark); font: 11px Arial, sans-serif; }
288 | .notebook article strong { font-weight: 400; }
289 | .notebook article p { margin: 5px 0 0; color: #817d72; font-size: 11px; }
290 | .notebook article > span { color: var(--gold-dark); font-size: 9px; }
291 | .notebook article.confirmed > span { color: #6ca287; }
292 | 
293 | @media (max-width: 900px) {
294 |   .site-nav nav a { display: none; }
295 |   .case-directory-rule { left: 56vw; }
296 |   .case-directory-panel { width: 56vw; padding-inline: 34px; }
297 |   .case-grid { grid-template-columns: 1fr 1fr; }
298 |   .case-grid article:nth-child(2) { border-right: 0; }
299 |   .case-grid article:nth-child(-n+2) { border-bottom: 1px solid var(--line); }
300 |   .roadmap-section { grid-template-columns: 1fr; }
301 |   .objective-card { top: 82px; left: 14px; width: 290px; }
302 |   .memory-card { left: 14px; bottom: 14px; width: 210px; }
303 |   .case-progress { top: 82px; right: 14px; width: 180px; }
304 |   .dialogue-box { width: min(720px, 78vw); }
305 | }
306 | 
307 | @media (max-width: 620px) {
308 |   .site-nav { height: 72px; }
309 |   .site-nav nav { gap: 8px; }
310 |   .hero { min-height: 720px; align-items: flex-end; padding-bottom: 100px; }
311 |   .hero-image { background-position: 66% center; }
312 |   .hero-wash { background: linear-gradient(0deg, #050a09 6%, rgba(4,8,7,.76) 55%, rgba(4,8,7,.28)); }
313 |   .hero h1 { font-size: 60px; }
314 |   .hero-actions { flex-direction: column; align-items: stretch; }
315 |   .case-directory { min-height: 760px; }
316 |   .case-directory-image { background-position: 67% center; filter: saturate(.64) contrast(1.05) brightness(.6); }
317 |   .case-directory-wash { background: linear-gradient(0deg, rgba(9,11,12,.99) 0%, rgba(9,11,12,.94) 58%, rgba(9,11,12,.5) 100%); }
318 |   .case-directory-rule { display: none; }
319 |   .case-directory-panel { grid-template-rows: auto minmax(86px, .5fr) auto 1fr auto; width: 100%; min-height: 760px; padding: 28px 22px 26px; background: linear-gradient(0deg, rgba(9,11,12,.9), rgba(9,11,12,.38)); }
320 |   .case-brand-mark { width: 36px; height: 36px; }
321 |   .case-brand-copy strong { font-size: 15px; }
322 |   .case-directory-heading h1 { font-size: 42px; }
323 |   .home-menu-item { grid-template-columns: 42px minmax(0, 1fr) 18px; min-height: 68px; }
324 |   .home-menu-copy strong { font-size: 16px; }
325 |   .case-section, .chapters-section, .roadmap-section { padding: 78px 22px; }
326 |   .case-grid { grid-template-columns: 1fr; }
327 |   .case-grid article { min-height: 200px; border-right: 0; border-bottom: 1px solid var(--line); }
328 |   .chapter-list article { grid-template-columns: 45px 1fr 38px; }
329 |   .chapter-list article > em { display: none; }
330 |   .chapter-list h3, .chapter-list p { display: block; }
331 |   .site-footer { padding: 24px 22px; flex-direction: column; gap: 9px; }
332 |   .runtime-topbar { grid-template-columns: 1fr 1fr; padding: 0 15px; }
333 |   .runtime-topbar > div:nth-child(2) { justify-self: end; }
334 |   .runtime-status { display: none; }
335 |   .runtime-debug-hud { top: 70px; min-width: 0; width: calc(100% - 20px); font-size: 9px; }
336 |   .objective-card { top: 78px; left: 10px; width: calc(100% - 20px); padding: 12px 14px; }
337 |   .objective-card strong { margin: 5px 0; font-size: 16px; }
338 |   .objective-card p { font-size: 11px; }
339 |   .memory-card { display: none; }
340 |   .case-progress { top: auto; right: 10px; bottom: 150px; width: 126px; padding: 9px; }
341 |   .runtime-controls { display: none; }
342 |   .bark-subtitle { bottom: 13px; width: calc(100% - 20px); }
343 |   .bark-subtitle img { width: 64px; height: 88px; }
344 |   .bark-subtitle p { padding: 10px 12px 10px 17px; font-size: 11px; }
345 |   .interaction-prompt { top: 54%; }
346 |   .settings-panel .setting-row { align-items: flex-start; }
347 |   .touch-controls { position: absolute; z-index: 20; left: 10px; right: 10px; bottom: 92px; display: flex; justify-content: space-between; align-items: end; pointer-events: none; }
348 |   .touch-controls button { width: 46px; height: 42px; border: 1px solid rgba(193,165,109,.45); background: rgba(4,9,7,.72); color: #cfc6b2; pointer-events: auto; touch-action: none; }
349 |   .touch-move { display: grid; grid-template-columns: repeat(3, 46px); gap: 4px; }
350 |   .touch-move button:first-child { grid-column: 2; }
351 |   .touch-move button:nth-child(2) { grid-column: 1; }
352 |   .touch-actions { display: grid; gap: 7px; }
353 |   .touch-actions button { width: 68px; font-size: 11px; }
354 |   .portrait { width: 61vw; height: 62vh; bottom: 155px; }
355 |   .portrait-left { left: -16vw; }
356 |   .portrait-right { right: -16vw; }
357 |   .dialogue-box { bottom: 10px; width: calc(100% - 20px); min-height: 158px; padding: 18px 17px 15px; }
358 |   .dialogue-advance > p { font-size: 14px; line-height: 1.7; }
359 |   .dialogue-toolbar { gap: 3px; }
360 |   .dialogue-toolbar button { padding-inline: 4px; }
361 |   .dialogue-bark .portrait { display: none; }
362 |   .dialogue-bark .dialogue-box { width: calc(100% - 20px); bottom: 86px; }
363 |   .objective-direction { top: 180px; }
364 |   .notebook-rule { display: grid; }
365 | }
366 | 
367 | @media (prefers-reduced-motion: reduce) {
368 |   *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .001ms !important; animation-duration: .001ms !important; }
369 | }
370 | 
371 | .asset-preview-shell { min-height: 100vh; padding: 26px; background: radial-gradient(circle at 70% 20%, #173029 0, #07100f 44%, #030706 100%); color: #d7d1c3; }
372 | .asset-preview-header { display: flex; align-items: end; justify-content: space-between; max-width: 1500px; margin: 0 auto 22px; }
373 | .asset-preview-header h1 { margin: 4px 0 5px; color: #e2d9c5; font-size: clamp(32px, 5vw, 56px); font-weight: 400; letter-spacing: .08em; }
374 | .asset-preview-header p { margin: 0; color: #81948d; }
375 | .asset-preview-header > a { padding: 10px 16px; border: 1px solid rgba(193,165,109,.35); color: #c1a56d; text-decoration: none; }
376 | .asset-preview-workspace { display: grid; grid-template-columns: 320px minmax(0, 1fr); min-height: 720px; max-width: 1500px; margin: 0 auto; border: 1px solid rgba(193,165,109,.24); background: rgba(4,9,8,.78); box-shadow: 0 30px 90px rgba(0,0,0,.48); }
377 | .asset-preview-panel { padding: 24px; border-right: 1px solid rgba(193,165,109,.18); background: rgba(9,17,14,.9); }
378 | .asset-preview-panel > label { display: block; margin-bottom: 8px; color: #8e9c96; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; }
379 | .asset-preview-panel select { width: 100%; margin-bottom: 18px; padding: 11px 10px; border: 1px solid #33453f; background: #09110f; color: #d8d0bf; }
380 | .asset-preview-panel .asset-preview-toggle { display: flex; align-items: center; gap: 9px; margin: 4px 0 22px; color: #b4aa95; letter-spacing: normal; text-transform: none; }
381 | .asset-preview-stats { margin: 0; border-top: 1px solid rgba(193,165,109,.17); }
382 | .asset-preview-stats div { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid rgba(193,165,109,.1); }
383 | .asset-preview-stats dt { color: #70847d; font-size: 11px; }
384 | .asset-preview-stats dd { margin: 0; color: #d0c7b4; font: 11px Arial, sans-serif; text-align: right; }
385 | .asset-preview-note, .asset-preview-license { margin-top: 20px; padding: 15px; border: 1px solid rgba(193,165,109,.16); background: rgba(193,165,109,.04); }
386 | .asset-preview-note strong { color: #c8aa6c; font-size: 12px; font-weight: 400; }
387 | .asset-preview-note p { margin: 8px 0; color: #9da8a1; font-size: 12px; line-height: 1.7; }
388 | .asset-preview-note small { color: #bd7c68; overflow-wrap: anywhere; }
389 | .asset-preview-license { display: grid; gap: 8px; color: #7f8d87; font-size: 10px; overflow-wrap: anywhere; }
390 | .asset-preview-license a { color: #c1a56d; }
391 | .asset-preview-canvas-wrap { position: relative; min-width: 0; min-height: 720px; }
392 | .asset-preview-canvas-wrap canvas { display: block; width: 100%; height: 100%; min-height: 720px; outline: none; }
393 | .asset-preview-message { position: absolute; top: 50%; left: 50%; padding: 12px 18px; transform: translate(-50%,-50%); border: 1px solid rgba(193,165,109,.3); background: rgba(4,9,7,.84); color: #d8c79d; }
394 | .asset-preview-message.error { max-width: 560px; border-color: rgba(181,90,70,.5); color: #dc9f8d; }
395 | .asset-preview-controls { position: absolute; right: 17px; bottom: 14px; color: #6f817a; font: 10px Arial, sans-serif; letter-spacing: .1em; }
396 | 
397 | .credits-page { min-height: 100vh; padding: 90px max(24px, 8vw); background: #070b09; color: #cec8bb; }
398 | .credits-page > header { position: relative; max-width: 920px; margin-bottom: 54px; }
399 | .credits-page h1 { margin: 12px 0 20px; color: #e0d7c2; font-size: clamp(48px, 8vw, 86px); font-weight: 400; letter-spacing: .08em; }
400 | .credits-page header > p:not(.eyebrow) { max-width: 760px; color: #8b928d; line-height: 1.9; }
401 | .credits-page header > a { position: absolute; top: 0; right: 0; color: #b89c64; text-decoration: none; }
402 | .credits-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 1280px; border-top: 1px solid rgba(193,165,109,.22); border-left: 1px solid rgba(193,165,109,.22); }
403 | .credits-grid article { min-height: 300px; padding: 30px; border-right: 1px solid rgba(193,165,109,.22); border-bottom: 1px solid rgba(193,165,109,.22); }
404 | .credits-grid article > span { color: #9f885c; font: 9px Arial, sans-serif; letter-spacing: .16em; }
405 | .credits-grid h2 { margin: 18px 0 10px; color: #d7cfbd; font-size: 24px; font-weight: 400; }
406 | .credits-grid article > p { min-height: 42px; color: #78817c; font-size: 12px; line-height: 1.7; }
407 | .credits-grid dl { margin: 22px 0 0; }
408 | .credits-grid dl div { display: grid; grid-template-columns: 72px 1fr; gap: 14px; padding: 8px 0; border-top: 1px solid rgba(193,165,109,.08); font-size: 10px; }
409 | .credits-grid dt { color: #65726d; }
410 | .credits-grid dd { margin: 0; overflow-wrap: anywhere; }
411 | .credits-grid a { color: #b99e69; }
412 | 
413 | @media (max-width: 820px) {
414 |   .asset-preview-shell { padding: 12px; }
415 |   .asset-preview-header { align-items: start; }
416 |   .asset-preview-workspace { grid-template-columns: 1fr; }
417 |   .asset-preview-panel { border-right: 0; border-bottom: 1px solid rgba(193,165,109,.18); }
418 |   .asset-preview-canvas-wrap, .asset-preview-canvas-wrap canvas { min-height: 520px; }
419 |   .credits-grid { grid-template-columns: 1fr; }
420 |   .credits-page header > a { position: static; display: inline-block; margin-top: 18px; }
421 | }
422 | 
```

### garden-of-shadows-game/app/page.tsx

Bytes: 12880
SHA-256: bdd644c226229673c70b6236535f7a583c1cbd849c423bf0b394bc6e14ba53f2
Lines: 1-275 of 275

```typescript
  1 | "use client";
  2 | 
  3 | import { lazy, Suspense, useEffect, useState } from "react";
  4 | import { createCheckpoint, createDefaultSave, loadCampaignSave, resetGardenSave, storeCampaignSave } from "./game/campaign-save";
  5 | import { getChapter } from "./game/manifests/campaign";
  6 | import type { CampaignSave, GameSettings } from "./game/types";
  7 | 
  8 | const GameRuntime = lazy(() => import("./game/GameRuntime").then((module) => ({ default: module.GameRuntime })));
  9 | const NorthTowerRuntime = lazy(() => import("./game/NorthTowerRuntime").then((module) => ({ default: module.NorthTowerRuntime })));
 10 | const MissingRoomRuntime = lazy(() => import("./game/MissingRoomRuntime").then((module) => ({ default: module.MissingRoomRuntime })));
 11 | 
 12 | type View = "hub" | "west-corridor-loop" | "north-tower-ledger" | "missing-room" | "settings";
 13 | type HomeMenuId = "01" | "02" | "03" | "04" | "05";
 14 | 
 15 | export default function Home() {
 16 |   const [save, setSave] = useState<CampaignSave>(() => createDefaultSave());
 17 |   const [view, setView] = useState<View>("hub");
 18 |   const [activeMenu, setActiveMenu] = useState<HomeMenuId>("02");
 19 | 
 20 |   useEffect(() => {
 21 |     const timer = window.setTimeout(() => {
 22 |       const params = new URLSearchParams(window.location.search);
 23 |       if (process.env.NODE_ENV === "development" && params.get("visualTest") === "1") {
 24 |         const anchorId = params.get("visualAnchor") ?? "front-gate";
 25 |         const checkpoint = {
 26 |           ...createCheckpoint("west-corridor-loop", "wife"),
 27 |           anchorId,
 28 |           earnedFlags: ["prologue.dialogue.complete"],
 29 |         };
 30 |         const visualSave = createDefaultSave();
 31 |         setSave({
 32 |           ...visualSave,
 33 |           activeCheckpoint: checkpoint,
 34 |           settings: {
 35 |             ...visualSave.settings,
 36 |             renderer: params.get("renderer") === "webgl" ? "webgl" : "auto",
 37 |             quality: "high",
 38 |             masterVolume: 0,
 39 |             subtitles: false,
 40 |           },
 41 |         });
 42 |         setView("west-corridor-loop");
 43 |         return;
 44 |       }
 45 |       setSave(loadCampaignSave());
 46 |     }, 0);
 47 |     return () => window.clearTimeout(timer);
 48 |   }, []);
 49 | 
 50 |   const persist = (next: CampaignSave) => {
 51 |     setSave(next);
 52 |     storeCampaignSave(next);
 53 |   };
 54 | 
 55 |   const startOnboarding = (restart = false) => {
 56 |     if (restart) {
 57 |       const checkpoint = { ...createCheckpoint("west-corridor-loop", "wife"), anchorId: "ROUTE_01_START" };
 58 |       persist({ ...save, activeCheckpoint: checkpoint, completedChapters: save.completedChapters.filter((id) => !["prologue-rain", "west-corridor-loop"].includes(id)) });
 59 |     }
 60 |     setView("west-corridor-loop");
 61 |   };
 62 | 
 63 |   const startNorthTower = (restart = false) => {
 64 |     if (restart || save.activeCheckpoint.chapterId !== "north-tower-ledger") {
 65 |       const checkpoint = { ...createCheckpoint("north-tower-ledger", "wife"), anchorId: "ROUTE_05_B_MAIN_COURT", activeObjectiveId: "north-life-evidence", objectiveStepId: "inspect-sixth-cup" };
 66 |       persist({
 67 |         ...save,
 68 |         activeCheckpoint: checkpoint,
 69 |         completedChapters: restart ? save.completedChapters.filter((id) => id !== "north-tower-ledger") : save.completedChapters,
 70 |       });
 71 |     }
 72 |     setView("north-tower-ledger");
 73 |   };
 74 | 
 75 |   const startMissingRoom = () => {
 76 |     if (save.activeCheckpoint.chapterId !== "missing-room") {
 77 |       const checkpoint = { ...createCheckpoint("missing-room", "gardener"), anchorId: "ROUTE_06_B_NORTHEAST_LINK" };
 78 |       persist({ ...save, activeCheckpoint: checkpoint });
 79 |     }
 80 |     setView("missing-room");
 81 |   };
 82 | 
 83 |   if (view === "west-corridor-loop") {
 84 |     const chapter = getChapter("west-corridor-loop");
 85 |     if (!chapter) return null;
 86 |     return (
 87 |       <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">LOADING RUNTIME</p><strong>正在载入园林与证词…</strong></main>}>
 88 |         <GameRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} />
 89 |       </Suspense>
 90 |     );
 91 |   }
 92 | 
 93 |   if (view === "north-tower-ledger") {
 94 |     const chapter = getChapter("north-tower-ledger");
 95 |     if (!chapter) return null;
 96 |     return (
 97 |       <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">LOADING CHAPTER 02</p><strong>正在载入 B 区主宅与三类证据…</strong></main>}>
 98 |         <NorthTowerRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} onContinue={startMissingRoom} />
 99 |       </Suspense>
100 |     );
101 |   }
102 | 
103 |   if (view === "missing-room") {
104 |     const chapter = getChapter("missing-room");
105 |     if (!chapter) return null;
106 |     return (
107 |       <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">LOADING CHAPTER 03</p><strong>正在载入 B 区深部与缺失房间重构层…</strong></main>}>
108 |         <MissingRoomRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} />
109 |       </Suspense>
110 |     );
111 |   }
112 | 
113 |   return (
114 |     <main className="site-shell">
115 |       <section className="case-directory" id="top">
116 |         <div className="case-directory-image" aria-hidden="true" />
117 |         <div className="case-directory-wash" aria-hidden="true" />
118 |         <div className="case-directory-rule" aria-hidden="true" />
119 | 
120 |         <div className="case-directory-panel">
121 |           <a href="#top" className="case-brand" aria-label="游园惊梦：四面证词">
122 |             <span className="case-brand-mark"><i>园</i></span>
123 |             <span className="case-brand-copy"><strong>游园惊梦</strong><small>四面证词</small></span>
124 |           </a>
125 | 
126 |           <div className="case-directory-heading">
127 |             <span className="case-kicker">CASE ARCHIVE · TING YU XUAN</span>
128 |             <h1>案卷目录</h1>
129 |             <p>CHOOSE YOUR INVESTIGATION</p>
130 |           </div>
131 | 
132 |           <HomeMenu
133 |             activeId={activeMenu}
134 |             onActiveChange={setActiveMenu}
135 |             onStartPrologue={() => startOnboarding()}
136 |             onRestartChapterTwo={() => startNorthTower(true)}
137 |             onRestartPrologue={() => startOnboarding(true)}
138 |             onRoadmap={() => document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth" })}
139 |             onSettings={() => setView("settings")}
140 |           />
141 | 
142 |           <div className="case-directory-meta">
143 |             <span>PC WEB · 实时 3D · 叙事解谜 · 16+</span>
144 |             <i aria-hidden="true" />
145 |           </div>
146 |         </div>
147 |       </section>
148 | 
149 |       <section className="roadmap-section" id="roadmap">
150 |         <div>
151 |           <p className="eyebrow">LONG-RANGE DEVELOPMENT</p>
152 |           <h2>先把一个案件做完，<br />再让园林继续长。</h2>
153 |         </div>
154 |         <ol>
155 |           <li className="active"><b>V0.2</b><span>A 区垂直切片</span><small>左下入口冲突、双认知侧路、Loop、东侧出口与追逐</small></li>
156 |           <li><b>V0.2</b><span>系统 Alpha</span><small>前三章白盒、四种记忆、画中门与完整存档</small></li>
157 |           <li><b>V0.3</b><span>叙事 Alpha</span><small>死亡证据形成唯一因果链，4–5 小时连续流程</small></li>
158 |           <li><b>V0.4–1.0</b><span>内容完整至正式版</span><small>第五视角、三结局、最终资产与全量审计</small></li>
159 |         </ol>
160 |       </section>
161 | 
162 |       <footer className="site-footer">
163 |         <span>《游园惊梦：四面证词》 · CASE ARCHIVE</span>
164 |         <span><a href="/credits">制作与授权</a> · 存档：{save.completedChapters.length} 段完成</span>
165 |       </footer>
166 | 
167 |       {view === "settings" && (
168 |         <SettingsPanel
169 |           settings={save.settings}
170 |           onClose={() => setView("hub")}
171 |           onChange={(settings) => persist({ ...save, settings })}
172 |           onReset={() => {
173 |             resetGardenSave();
174 |             setSave(createDefaultSave());
175 |           }}
176 |         />
177 |       )}
178 |     </main>
179 |   );
180 | }
181 | 
182 | function HomeMenu({
183 |   activeId,
184 |   onActiveChange,
185 |   onStartPrologue,
186 |   onRestartChapterTwo,
187 |   onRestartPrologue,
188 |   onRoadmap,
189 |   onSettings,
190 | }: {
191 |   activeId: HomeMenuId;
192 |   onActiveChange: (id: HomeMenuId) => void;
193 |   onStartPrologue: () => void;
194 |   onRestartChapterTwo: () => void;
195 |   onRestartPrologue: () => void;
196 |   onRoadmap: () => void;
197 |   onSettings: () => void;
198 | }) {
199 |   const items: Array<{ id: HomeMenuId; titleCn: string; titleEn: string; onClick: () => void }> = [
200 |     { id: "01", titleCn: "开始序章", titleEn: "NEW CASE", onClick: onStartPrologue },
201 |     { id: "02", titleCn: "从头测试第二章", titleEn: "CHAPTER TWO", onClick: onRestartChapterTwo },
202 |     { id: "03", titleCn: "从序章重新开始", titleEn: "RESTART FROM PROLOGUE", onClick: onRestartPrologue },
203 |     { id: "04", titleCn: "长线规划", titleEn: "ROADMAP", onClick: onRoadmap },
204 |     { id: "05", titleCn: "系统设置", titleEn: "SETTINGS", onClick: onSettings },
205 |   ];
206 | 
207 |   return (
208 |     <nav className="home-menu" aria-label="案卷目录">
209 |       {items.map((item) => (
210 |         <MenuItem
211 |           key={item.id}
212 |           number={item.id}
213 |           titleCn={item.titleCn}
214 |           titleEn={item.titleEn}
215 |           active={activeId === item.id}
216 |           onActive={() => onActiveChange(item.id)}
217 |           onClick={item.onClick}
218 |         />
219 |       ))}
220 |     </nav>
221 |   );
222 | }
223 | 
224 | function MenuItem({ number, titleCn, titleEn, active, onActive, onClick }: {
225 |   number: HomeMenuId;
226 |   titleCn: string;
227 |   titleEn: string;
228 |   active: boolean;
229 |   onActive: () => void;
230 |   onClick: () => void;
231 | }) {
232 |   return (
233 |     <button
234 |       type="button"
235 |       className={`home-menu-item${active ? " active" : ""}`}
236 |       onMouseEnter={onActive}
237 |       onFocus={onActive}
238 |       onClick={() => {
239 |         onActive();
240 |         onClick();
241 |       }}
242 |     >
243 |       <span className="home-menu-number">{number}</span>
244 |       <span className="home-menu-copy"><strong>{titleCn}</strong><small>{titleEn}</small></span>
245 |       <i aria-hidden="true">↗</i>
246 |     </button>
247 |   );
248 | }
249 | 
250 | function SettingsPanel({ settings, onClose, onChange, onReset }: {
251 |   settings: GameSettings;
252 |   onClose: () => void;
253 |   onChange: (settings: GameSettings) => void;
254 |   onReset: () => void;
255 | }) {
256 |   const update = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => onChange({ ...settings, [key]: value });
257 |   return (
258 |     <div className="page-modal-backdrop">
259 |       <section className="settings-panel" role="dialog" aria-modal="true" aria-label="游戏设置">
260 |         <button type="button" className="panel-close" onClick={onClose}>×</button>
261 |         <p className="eyebrow">DISPLAY & ACCESSIBILITY</p>
262 |         <h2>设置</h2>
263 |         <div className="setting-row"><span><label htmlFor="quality">画质</label><small>稳定与低画质会限制像素比和雨滴数量</small></span><select id="quality" value={settings.quality} onChange={(event) => update("quality", event.target.value as GameSettings["quality"])}><option value="high">高画质</option><option value="stable">稳定模式</option><option value="low">最低画质</option></select></div>
264 |         <div className="setting-row"><span><label htmlFor="renderer">渲染后端</label><small>自动优先 WebGPU，失败时可强制 WebGL 2</small></span><select id="renderer" value={settings.renderer} onChange={(event) => update("renderer", event.target.value as GameSettings["renderer"])}><option value="auto">自动</option><option value="webgl">强制 WebGL 2</option></select></div>
265 |         <div className="setting-row"><span><label htmlFor="stable-camera">稳定镜头</label><small>关闭追逐镜头扰动；不会影响解谜</small></span><input id="stable-camera" type="checkbox" checked={settings.stableCamera} onChange={(event) => update("stableCamera", event.target.checked)} /></div>
266 |         <div className="setting-row"><span><label htmlFor="subtitles">字幕</label><small>显示证词、提示与追逐揭示</small></span><input id="subtitles" type="checkbox" checked={settings.subtitles} onChange={(event) => update("subtitles", event.target.checked)} /></div>
267 |         <div className="setting-row"><span><label htmlFor="dialogue-speed">对话速度</label><small>控制剧情文字逐字显示速度</small></span><select id="dialogue-speed" value={settings.dialogueSpeed} onChange={(event) => update("dialogueSpeed", event.target.value as GameSettings["dialogueSpeed"])}><option value="slow">慢</option><option value="normal">标准</option><option value="fast">快</option><option value="instant">立即显示</option></select></div>
268 |         <div className="setting-row"><span><label htmlFor="master-volume">主音量</label><small>{Math.round(settings.masterVolume * 100)}%</small></span><input id="master-volume" type="range" min="0" max="1" step="0.05" value={settings.masterVolume} onChange={(event) => update("masterVolume", Number(event.target.value))} /></div>
269 |         <button type="button" className="reset-button" onClick={onReset}>仅清除《游园惊梦》存档</button>
270 |         <p className="settings-note">不会读取、迁移或删除旧项目的 `undying-world.game.save.v1`。</p>
271 |       </section>
272 |     </div>
273 |   );
274 | }
275 | 
```

### README.md

Bytes: 1767
SHA-256: b65db8f0ca3508f56fca8a57cbc8992b75b3407a8f67854bac5b59f172002a4e
Lines: 1-49 of 49

```markdown
 1 | # 《游园惊梦：四面证词》开发仓库
 2 | 
 3 | 《游园惊梦》已取代《不死世界》成为正式项目。新开发只进入 `garden-of-shadows-game/`；旧工程与独立章节原型保持原样，作为历史参考。
 4 | 
 5 | ## 仓库分区
 6 | 
 7 | | 区域 | 用途 | 状态 |
 8 | |---|---|---|
 9 | | `garden-of-shadows-game/` | 正式 Vinext/React + Three.js/Rapier 项目 | **主开发入口** |
10 | | `GDD_游园惊梦_完整版.md` | 原始 GDD v1 | 只读历史稿 |
11 | | `undying-world-game/` | 《不死世界》五章 PPT 式整合工程 | 历史参考，不继续开发 |
12 | | `game-chapter-01/` | 旧第一章独立原型 | 历史参考 |
13 | | `game-chapter-02/` | 旧第二章独立原型 | 历史参考 |
14 | | `docs/development-records/` | 旧项目开发记录 | 保留 |
15 | 
16 | ## 当前交付
17 | 
18 | `garden-of-shadows-game/` 已完成 V0.0 设计定案和 V0.1 可玩垂直切片基础：
19 | 
20 | - 序章加八章的战役清单、唯一案件时间线、证据矩阵和谜题依赖图。
21 | - PC Web 项目页与序章交互。
22 | - 实时 3D“西廊回环”：夫人/园丁双记忆、空间矛盾、回环、信任重构、无面园主追逐。
23 | - Three.js WebGPU 自动降级 WebGL 2，Rapier 胶囊体控制器。
24 | - `garden-of-shadows.save.v2` 独立存档和章节完成事件。
25 | - 美术规范、第三方许可台账、AIGC 台账及测试门禁。
26 | 
27 | ## 启动
28 | 
29 | ```bash
30 | cd garden-of-shadows-game
31 | npm install
32 | npm run dev
33 | ```
34 | 
35 | 验证：
36 | 
37 | ```bash
38 | npm test
39 | npm run typecheck
40 | npm run lint
41 | npm run build
42 | ```
43 | 
44 | 详细入口见 [`garden-of-shadows-game/README.md`](./garden-of-shadows-game/README.md)。
45 | 
46 | ## 存档隔离
47 | 
48 | 新作只使用 `garden-of-shadows.save.v2`。旧《不死世界》的 `undying-world.game.save.v1` 不迁移、不读取、不删除，避免无关剧情状态映射进新作。
49 | 
```

## Skipped Files

None.
