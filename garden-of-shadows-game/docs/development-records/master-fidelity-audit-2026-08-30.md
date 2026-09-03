# Master Fidelity Audit — 2026-08-30

## 结论

PASS。正式运行时只加载 `tyx-master-scene` 作为预载建筑；未通过性能优化隐藏正式窗、门、格栅、墙、屋顶、门框或主建筑。`fallbackArchitecture=1` 与 `legacyArchitecture=1` 仍是显式回滚路径，不会进入默认正式画面。

## `TINGYUXUAN_MASTER_HIDDEN_NODES`

当前白名单只包含以下来源类别：

- 穿过可玩入口的山体 backdrop 与 transition planting；
- `B_CoreGarden_Backup`、`CONN_SourcePavingTile` 等备份/源模板；
- Sketchfab 导入包装根；
- 位于主门构图前、导出后呈破损平面卡的植被节点及其 GLTFLoader 规范化别名。

测试会拒绝隐藏节点名中出现 `window / door / lattice / wall / roof / gate / frame / building` 等正式建筑语义。主门所属的 `A_ExpandedBoundary` 明确保留。

## `prepareFormalVisual()`

- 每个材质先 `clone()`，不会修改 RuntimeAssetLoader 缓存中的原 GLB 材质。
- 不移除 base-color、normal、roughness、metalness 或 alpha 贴图，不改正式网格 visibility。
- 只对不透明 `MeshStandardMaterial` 收拢粗糙度，并调整环境反射强度；颜色、透明模式和贴图引用保持不变。
- Master 网格不启用逐网格动态 shadow caster；1024² directional key 只为明确的 Runtime dressing caster 服务。这避免了对约 38 万三角形 Master 重复生成阴影图，但没有删除或隐藏 Master 几何。

## Performance Profile 后的无损优化

九组基线表明雨、PointLight、动态 shadow 与 renderer backend 必须分别评估。实现仅对已经超出自身 `distance` 衰减半径 0.5 m 余量的 PointLight 设置 `visible=false`；该位置理论光照贡献为零。玩家进入灯的有效半径时会自动恢复，因此没有永久删灯，也没有以降分辨率、关闭 AA 或隐藏正式建筑换性能。

数据见：

- `performance-profile-2026-08-30.md`
- `performance-profile-2026-08-30.json`
