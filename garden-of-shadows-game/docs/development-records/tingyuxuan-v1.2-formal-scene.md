# 听雨轩正式场景 V1.2 开发记录

## 本轮目标

完成第一章正式视觉层的真实浏览器落地：禁止以 Greybox 代替正式建筑视觉，必须生成运行时资产、实拍五个固定机位并记录真实性能数据。

## 已实施

### 正式视觉与空间

- `Traditional Chinese Siheyuan` 继续作为正门 / 前厅正式建筑基线。
- `Ancient Chinese Courtyard Park` 作为西院 / 曲廊 / 园墙 / 月洞门过渡主视觉来源，区域延迟加载。
- Siheyuan 按原件真实入口侧旋转 90°；Courtyard Park 按审计包围盒恢复到 0.34 建筑尺度并贴地，未做减面。
- 旧 `CylinderGeometry` 灯笼占位已退出正式画面，只保留程序点光源。
- 区域加载请求已串行化，修复定时流式检查抢先宣告 assets-ready、导致西院漏载 Park 的竞态。
- `TINGYUXUAN_RUNTIME_ZONES` 已覆盖 `west-courtyard / corridor / rockery / water-court / north-house / inner-house`。
- 水院增加池岸、桥前石径、水面细微波纹、冷暖分层灯光；程序部分属于水体 / 地表 / dressing，不冒充建筑。
- 假山侧路增加连续石板过渡；真实 Rock Set 仍承担假山主体。
- 北楼 / 内宅真实 House Outline 保留，并增加前庭过渡石径以避免模型“单独摆放”的割裂感。
- 园丁 / 夫人记忆会改变水体颜色与粗糙度，继续强化“同地异景”。
- 布局版本提升到 `tingyuxuan-v1.2`，旧存档仍通过现有 layoutVersion 迁移逻辑回收位置。

### Pavilion / Bridge

- `Chinese Pavilion Memoriam` 继续作为 Pavilion A / 水榭正式主视觉。
- `Chinese Pavilion` 新增 Pavilion B 处理链：Blender 统一 Pivot、落地、比例，并输出 `TYX_ARCH_Pavilion_B.glb`。
- Pavilion B 已进入 `prepare-runtime` 与 `RuntimeAssetLoader`，并作为东侧次级园林地标的 deferred placement；不替代 Pavilion A。
- Low Bridge 不再依赖手工生成的 `preview/low_bridge_metalrough.glb` 作为 Runtime 构建输入。
- Runtime 构建改为直接读取审计原始 `low_bridge.glb`，经 Blender 导入 / 导出产生可复现的 Metallic/Roughness 工作衍生物，再进入正式优化链。
- Asset Preview 的 bridge compatibility copy 指向同一可复现 runtime-raw 衍生物。

### 工程整合

- `package.json` 中并行开发产生的重复 `dialogue:compile` / `validate:content` 键已合并；资产脚本、West Chapter、North Tower 已有的编译 / 测试入口同时保留。
- `assets:approve` 仍受真实视觉验收阻断，不允许静态开发完成后自动标记 approved。
- Pavilion B 加入 Runtime Asset ID / URL / byte estimate 和 chapter deferred asset pack。
- `ASSET_DECISIONS.md` 更新为完整听雨轩运行拓扑，不再保留“后续区域永不激活”的旧阶段描述。

## 明确保留为 Gameplay / Dressing 的程序几何

- Rapier collider boxes。
- Trigger boxes。
- 地表与石板路径。
- 池面、池底、池岸。
- 雨、雾、灯光、水波纹。
- 任务 Guidance Marker。
- 记忆层的水痕、箭头、重复漏窗提示、月洞门记忆高亮。
- `TYX_ARCH_Kit_A.glb` 仅显式 fallback/debug。

以上内容不得被描述为正式建筑视觉。

## 2026-08-28 实际验证结果

- `assets:build-blender`：通过，生成 7 组 Blender runtime source。
- `assets:prepare`：通过，生成 10 个 runtime；总计 159.88 MiB，章节 preload 98.72 MiB。25 / 18 MiB 均仅作 advisory。
- 两套第一阶段主模型保持 source-faithful：Siheyuan 98.17 MiB、Courtyard Park 23.67 MiB；没有减面。其余兼容派生资产继续使用 KTX2 / Meshopt。
- `assets:validate`：通过，6 个 CC BY 来源、8 个 CC0 材质、10 个 CC0 自然模块和 10 个 runtime 均通过清单 / 哈希 / 节点检查。
- `typecheck`：通过。
- `lint`：通过。
- `test`：10 个测试文件、36 项测试全部通过。
- `build`：通过。
- `visual:capture`：WebGL2 下完成 5 / 5 正式截图，无 fallback 泄漏；状态为 `captured-pending-user-visual-acceptance`。
- `visual:verify`：通过。五个机位实测 FPS 为 21.3–34.9，仍低于 45 FPS 参考线；这是真实未达标项，不自动批准。
- 关闭高模点光源六面阴影后，正门从约 4.90M triangles / 171 draw calls / 15.5 FPS 改善到约 1.23M / 108 / 34.9 FPS；没有删除或减面原始几何。

## 当前待办

1. 等待用户审核五张正式截图与 `phase-one-comparison.jpg`，`release-approval` 继续保持 pending。
2. 在视觉方向确认后，按实测热点继续做纹理颜色空间兼容、材质 / draw-call 合并、阴影策略、可见几何拆分和 LOD；不先减面。
3. WebGPU 路径尚未在本轮重拍，需在发布门禁前补齐。
4. 不在第一阶段视觉批准前扩建第二章或把 Greybox 标记为正式视觉。
