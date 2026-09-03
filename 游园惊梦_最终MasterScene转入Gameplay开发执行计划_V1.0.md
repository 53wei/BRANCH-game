# 《游园惊梦：四面证词》
# 最终 Master Scene 转入 Gameplay 开发执行计划 V1.0

**版本日期：** 2026-08-29  
**执行状态：** 正式进入 Gameplay Integration / First Walkable 阶段  
**空间 Source of Truth：** `E:\C_Projects\game\TingYuXuan_Master.blend`  
**Runtime 场景源：** `E:\C_Projects\game\TingYuXuan_Master.glb`  
**主工程：** `E:\C_Projects\game\garden-of-shadows-game`  

## 执行进度（2026-08-30）

| 阶段 | 状态 | 当前结论 |
|---|---|---|
| P0 | 已完成 | 默认 Runtime 已切换到唯一 `tyx-master-scene`；旧两模型路径仅保留显式 rollback。 |
| P0.5 | 自动门禁通过，人工验收待执行 | Spawn、CameraRig、Physics、Ground、四侧空气墙和 Debug HUD 已接入；五视角均 `grounded=true`。仍需人工连续行走 5 分钟。 |
| P1 | 已开始 | Level A 第一版采用大地面与地图边界；建筑、水岸和主路径碰撞等待实际走图标注。 |
| P2 | 待开始 | 旧 Anchor / Trigger / Zone 已标记 REMAP，不提前强行套用旧空间命名。 |
| P7.5 | 已登记性能债 | 浏览器五视角实测约 19.4–45 FPS；优先做 Draw Call、材质、阴影与分区优化。 |

当前自动验证：`typecheck` 通过；布局/存档定向测试 14/14；构建通过；视觉回归 5/5、无 fallback 泄漏。完整测试套件另有 2 个既存剧情/存档失败，当前 lint 另有 3 个既存 `NorthTowerRuntime.tsx` ref-in-render 错误，资产校验另有 1 个既存 `low-bridge` 源哈希漂移，均不由本轮 Master 迁移引入。

---

# 0. 现在的项目状态与本计划解决的问题

听雨轩最终建模已经完成并确定。

从本版本开始，项目不再处于“根据剧情继续调整主建筑布局”的建模阶段，而是正式进入：

> **最终场景接入 Runtime → First Walkable → 碰撞与空气墙 → 实际试玩 → 剧情重新落位 → 章节内容接入 → 氛围与性能优化 → 全流程串联。**

本计划用于替代此前仍以“两套模型在 Runtime 内重新拼装”为前提的旧场景实施思路。

## 0.1 新的硬规则

1. `TingYuXuan_Master.blend` 是最终空间事实。
2. `TingYuXuan_Master.glb` 是当前正式 Runtime 场景输入。
3. Runtime 不得重新移动、旋转、缩放 Master Scene 内部核心建筑来迎合旧剧情坐标。
4. 旧的 `tingyuxuan-layout`、旧区域坐标、旧章节空间命名，只能作为历史参考，不再自动视为真实地图。
5. 剧情允许为了最终地图重新安排“发生在哪里、先后怎么走、证据放哪里、人物在哪里出现”。
6. 核心案件逻辑、核心人物关系、核心认知反转，不因为一堵墙或一栋楼不存在就随意推翻。
7. 空气墙、Trigger、Collider、Spawn、Portal、Evidence Anchor 属于 Gameplay Layer，不要求现在回 Blender 做死。
8. 当前第一优先级不是“把剧情文档全部重写完”，而是尽快得到一个真正能在最终场景中行走的游戏版本。

---

# 1. 当前可复用工程基础

当前项目并非从零开始。以下系统已经存在，应以复用和接入为主：

## 1.1 场景与资产

- `app/game/runtime/TingYuXuanScene.ts`
- `app/game/runtime/RuntimeAssetLoader.ts`
- `app/game/runtime/tingyuxuan-layout.ts`
- 既有 runtime asset pipeline
- 既有材质统一与场景加载逻辑

## 1.2 玩家与镜头

- `app/game/mechanics/CameraRig.ts`
- `app/game/mechanics/PlayerPhysics.ts`
- `app/game/runtime/PhysicsController.ts`

## 1.3 交互与玩法

- `InteractionController.ts`
- `MechanicsOrchestrator.ts`
- `CognitionController.ts`
- `BorrowedViewPortal.ts`
- `LoopController.ts`
- `BorrowAnchorController.ts`
- `EvidenceLedger.ts`
- `NarrativeGateController.ts`
- `PuzzleController.ts`

## 1.4 剧情与章节

- `GameRuntime.tsx`
- `NorthTowerRuntime.tsx`
- `manifests/campaign.ts`
- `manifests/west-*`
- `manifests/north-tower-*`
- Ink 对话系统
- 存档 / checkpoint 系统

## 1.5 当前已知未完成项

- CameraRig 尚未完全替换 GameRuntime 中旧手写相机逻辑。
- InteractionController 尚未完全替换旧 inline interaction scan。
- AudioZone 缺失。
- 第二章 Evidence Skeleton 尚未完成。
- CharacterAnimationState 仅部分接入。
- 旧 Runtime 场景逻辑仍带有此前两套源模型拼装时代的空间假设。

因此本轮正确策略不是重建底层，而是：

> **先迁移最终 Master Scene，再让已有系统围绕新场景重新绑定。**

---

# 2. 总开发策略

## 2.1 先可玩，后精确

当前开发顺序：

```text
最终 Master GLB
    ↓
浏览器正确加载
    ↓
玩家出生
    ↓
WASD + 镜头
    ↓
基础地面碰撞
    ↓
粗建筑碰撞 / 空气墙
    ↓
第一次完整走图
    ↓
真实区域划分
    ↓
剧情重新落位
    ↓
章节玩法接入
```

禁止反过来：

```text
先把六章所有剧情重新写完
    ↓
再想地图怎么放
    ↓
最后才发现路线走不通
```

## 2.2 允许临时 Gameplay 几何

以下内容允许由 Runtime / Rapier / Debug Layer 生成：

- Ground Collider
- 建筑粗碰撞盒
- Invisible Wall / 空气墙
- Trigger Box
- Portal Trigger
- Interaction Volume
- Audio Zone
- Spawn Point
- Checkpoint
- Evidence Anchor
- Guidance Marker

这些不属于正式建筑视觉，不需要追求和 Mesh 1:1 完美贴合。

## 2.3 不允许 Runtime 再造正式建筑

Runtime 不得为了旧剧情坐标重新创建：

- 假房子
- 假围墙
- 大型建筑 Blockout
- 用程序几何冒充正式回廊 / 门楼 / 水榭

如果最终 Master Scene 中某区域不适合剧情，优先改剧情占位和路径，而不是再造一套建筑覆盖它。

---

# 3. 开发优先级总表

| 阶段 | 目标 | 优先级 | 是否阻塞后续 |
|---|---|---:|---:|
| P0 | Master Scene 正式接入 Runtime | 最高 | 是 |
| P0.5 | First Walkable | 最高 | 是 |
| P1 | 粗碰撞 + 空气墙 + 可走边界 | 最高 | 是 |
| P2 | 实际走图 + Gameplay 空间重新划分 | 高 | 是 |
| P3 | 剧情 / 章节重新映射 | 高 | 是 |
| P4 | 第一章 Vertical Slice | 高 | 是 |
| P5 | 第二章完整接入 | 高 | 否 |
| P6 | 第三、四章及终章扩展 | 中高 | 否 |
| P7 | 氛围、性能、视觉优化 | 中高 | 发布前必须 |
| P8 | 全流程 QA / 存档 / 发布门禁 | 最高 | 发布必须 |

---

# 4. P0 —— 最终 Master Scene Runtime 迁移

## 4.1 目标

让浏览器中的听雨轩不再由旧的两套模型分别加载、缩放和拼接，而是直接以最终 `TingYuXuan_Master.glb` 为核心场景。

## 4.2 实施任务

### A. Runtime Asset Pipeline

1. 将 `TingYuXuan_Master.glb` 纳入正式资产清单和 Runtime Loader。
2. 为 Master Scene 建立唯一稳定 Asset ID，例如：

```text
tyx-master-scene
```

3. 保证内部节点 Transform 原样保留。
4. 如果 Three.js / glTF 坐标系需要处理，只允许在场景根节点做一次统一转换；不得逐建筑重新定位。
5. 保留旧两模型加载方式作为短期 rollback，但默认入口切换至 Master Scene。
6. 标记旧 `Siheyuan + Courtyard Park` 拼装路径为 `legacy/deprecated`，禁止继续新增依赖。

### B. TingYuXuanScene

1. 修改 `TingYuXuanScene.ts`，以 Master Scene 为核心视觉根节点。
2. 旧区域 deferred placement 如果会重新移动正式建筑，应关闭或改造成仅控制可见性 / 加载，不再改变建筑 Transform。
3. 程序生成的雨、雾、灯、池水效果、Gameplay Marker 可继续保留。

### C. 旧 Layout 数据审计

对 `tingyuxuan-layout.ts` 分类：

- **KEEP：** 不依赖旧建筑坐标的通用配置。
- **REMAP：** Spawn / Trigger / Evidence / Audio / Checkpoint 等坐标。
- **DEPRECATE：** 用于重新摆放 Siheyuan / Courtyard Park 的位置数据。
- **UNKNOWN：** 需要实际走图后确认。

## 4.3 P0 验收

- 浏览器能成功加载 `TingYuXuan_Master.glb`。
- 与 Blender 俯视布局一致，无建筑二次错位。
- 无重复加载旧两套完整建筑造成重叠。
- 页面不报致命加载错误。
- 可通过 debug 信息确认实际加载的是 Master Scene。

---

# 5. P0.5 —— First Walkable

## 5.1 唯一目标

> **玩家能够在最终听雨轩中稳定走起来。**

本阶段不要求最终剧情、不要求最终碰撞、不要求最终灯光。

## 5.2 必做任务

1. 接入 / 修正 `CameraRig`。
2. 接入 `PlayerPhysics`。
3. 确定临时 Spawn Point。
4. 给主可玩区域建立 Ground Collider。
5. 解决：
   - 出生在模型内部；
   - 相机卡墙；
   - 玩家无限下坠；
   - 角色速度与场景比例明显失衡；
   - 坐标尺度异常。
6. 增加 Debug HUD：
   - Player XYZ
   - 当前 FPS
   - 当前区域 ID（暂可为空）
   - Grounded 状态

## 5.3 First Walkable 验收标准

玩家至少连续行走 5 分钟：

- 不掉出世界；
- 镜头不持续抖动；
- 移动速度合理；
- 可以从出生点进入核心宅院 / 园林至少一个主要区域；
- 页面无持续 fatal error。

达成后立即进入 P1，不等待美术精修。

---

# 6. P1 —— 碰撞、空气墙与第一版可玩边界

## 6.1 原则

第一版碰撞追求：

> **不穿、不掉、能走。**

不是：

> **每根柱子都拥有精确 Mesh Collider。**

## 6.2 Collider 分级

### Level A：必须立即有

- 地面
- 主围墙
- 大型建筑外墙
- 深水边界
- 地图边缘
- 悬空 / 模型裂缝

### Level B：试玩后增加

- 主要回廊
- 桥
- 假山主要阻挡
- 门框
- 台阶
- 大型家具 / 景观物

### Level C：最后再做

- 柱子细节
- 花盆
- 小石头
- 小型装饰

## 6.3 空气墙使用规范

允许空气墙解决：

- 建模接缝；
- 暂不开放的区域；
- 玩家看得到但不应该走到的山体；
- 水体深处；
- 复杂建筑内部；
- 当前阶段无法快速生成可靠碰撞的区域。

空气墙不得：

- 横在主路径中间且毫无视觉解释；
- 让玩家在宽阔空地突然被挡住；
- 取代本来应当开放的关键剧情路线。

## 6.4 P1 验收

完成一次“从 Spawn 出发，持续探索主场景”的人工试玩，并记录：

```text
[BLOCK] 走不通
[CLIP] 穿模
[FALL] 掉图
[CAM] 相机问题
[SCALE] 尺度问题
[GOOD] 值得做剧情的区域
[DEAD] 无需开放的区域
```

---

# 7. P2 —— 用实际游戏重新划分听雨轩 Gameplay 空间

这一阶段不再依赖旧平面图猜位置。

## 7.1 建立客观区域编号

第一次走图后先使用中性编号：

```text
AREA_A01
AREA_A02
AREA_A03
COURT_C01
BUILDING_B01
PATH_P01
WATER_W01
GATE_G01
```

不要一开始就把建筑强行命名为“西院”“北楼”。

## 7.2 每个区域记录

- 世界坐标范围
- 入口数量
- 出口数量
- 是否形成 Loop
- 是否可做封闭调查
- 是否可做追逐
- 是否有二层 / 高差
- 视线能看到什么
- 是否靠近水
- 是否靠近主宅
- 是否适合恐怖演出
- 是否适合放 NPC
- 是否适合放证据
- 性能负载
- 是否需要空气墙

## 7.3 输出

产出：

`听雨轩_Runtime空间与Gameplay区域映射_V1.0.md`

其中包含：

- 区域表
- 主路径
- 次路径
- 暂不开放区域
- 适合剧情核心的候选区域

---

# 8. P3 —— 剧情重新落位，而不是重写一切

## 8.1 可调整内容

允许根据最终地图修改：

- 每章发生的具体地点；
- 玩家先去哪里；
- 哪条路什么时候开放；
- 证据位置；
- NPC 出现位置；
- 追逐路线；
- 调查顺序；
- 月洞门 / 假山 / 水域等视觉意象承担哪一段剧情；
- 第一章和第二章使用哪个院落 / 建筑。

## 8.2 暂不随意修改

除非明确发现不可实现，否则先冻结：

- 核心案件真相；
- 人物核心关系；
- 四面证词结构；
- 不可靠认知主题；
- 核心反转；
- 多结局认知结构；
- 已经稳定的核心机制。

## 8.3 章节重新映射方法

建立矩阵：

| 章节 | 剧情功能 | 需要的空间功能 | 最终地图候选区域 | 是否需要改剧情 |
|---|---|---|---|---|
| 序章 | 入园 / 建立不安 | 单入口、强视觉地标 | 待 P2 | 待定 |
| 第一章 | 初次调查 / 建立矛盾 | 中型院落 + 环路 + 遮挡 | 待 P2 | 待定 |
| 第二章 | 账目 / 第六只茶杯 / 视角证据 | 室内外转换 + 可控门禁 | 待 P2 | 待定 |
| 第三章 | 证词升级 | 多路径 / NPC 活动区 | 待 P2 | 待定 |
| 第四章 | 认知重构 | 重访旧区 / 同地异景 | 待 P2 | 待定 |
| 终章 | 真相 / 结局 | 强终点空间 | 待 P2 | 待定 |

## 8.4 P3 验收

不是产出长篇剧本，而是先确定：

- 六段分别在哪里发生；
- 玩家主要怎么走；
- 哪些区域会重复访问；
- 哪些地点用于认知切换；
- 哪些旧剧情空间名被废弃 / 改名 / 合并。

---

# 9. P4 —— 第一章 Vertical Slice

第一章必须成为“质量模板”，而不是一次把所有章节都铺开。

## 9.1 必须打通的闭环

```text
进入区域
→ 环境提示
→ 调查
→ 获得证据
→ 对话 / 证词
→ 发现矛盾
→ 认知变化 / 玩法变化
→ 章节高潮
→ 离开 / 存档
```

## 9.2 第一章应复用

- InteractionController
- EvidenceLedger
- NarrativeGateController
- CognitionController
- Loop / Borrow / Anchor（按剧情需要，不强行全部使用）
- DialogueRunner
- Save / Checkpoint

## 9.3 第一章完成标准

- 从菜单可以开始。
- 玩家可以完整走完。
- 没有开发者口头解释也知道下一步大概做什么。
- 至少有一个真正成立的恐怖演出。
- 至少有一个环境叙事点。
- 至少有一个机制闭环。
- 章节完成后正确进入下一阶段。

第一章通过后，其结构直接复制为后续章节生产模板。

---

# 10. P5 —— 第二章《北楼暗账》重新接入最终场景

现有第二章代码与剧情资产不全部推翻，先做迁移审计。

## 10.1 重点审计文件

- `NorthTowerRuntime.tsx`
- `runtime/NorthTowerScene.ts`
- `manifests/north-tower-ledger.ts`
- `manifests/north-tower-objectives.ts`
- `narrative/north-tower-ledger.ink`

## 10.2 第二章保留的玩法目标

优先保留：

- 多 Evidence Channel；
- 账目调查；
- 第六只茶杯；
- View-dependent Evidence；
- 证据重解释；
- 认知状态改变调查结果。

“北楼”作为名称可以保留，也可以根据 P2 最终映射到更合适的真实建筑。

## 10.3 原则

不要为了保留旧 `northTowerPosition` 去挪最终 Master Scene。

应该：

> **把第二章逻辑移动到最终地图中最适合承担第二章的建筑。**

---

# 11. P6 —— 第三章、第四章与终章

后续章节遵循“复用系统，不再新增一套底层”的原则。

## 11.1 第三章

重点：

- NPC / 证词冲突；
- Borrow / Anchor 扩展；
- 重访旧区域但获得新信息。

## 11.2 第四章

重点：

- Evidence Recontextualization；
- 同一地点在不同认知状态下意义改变；
- 旧证据重新解释。

## 11.3 终章

重点：

- ReconstructionProfile；
- 多认知结果；
- 多结局；
- 最终空间作为视觉与叙事终点。

---

# 12. P7 —— 氛围与视觉完成

本阶段在 First Walkable 和章节路线稳定后开展。

## 12.1 必做

- 雨
- 雾
- 夜间层次
- 室内 / 室外光比
- 水面
- 环境音
- 脚步
- 远景压暗
- 关键建筑局部照明
- 认知状态视觉差异

## 12.2 AudioZone

新增 AudioZone 系统：

- 宅院
- 回廊
- 水边
- 室内
- 假山 / 林区

使用交叉淡化，而不是硬切音效。

---

# 13. P7.5 —— 性能优化

此前正式场景已经出现约 21–35 FPS 的实测压力，因此性能优化必须作为正式阶段，而不能拖到最后一天。

## 13.1 优化顺序

1. Draw Call / Material 合并
2. 阴影策略
3. 灯光数量
4. 可见性 / Frustum / Distance Culling
5. 大场景分区加载
6. 纹理尺寸与 KTX2
7. LOD
8. 最后才考虑破坏性减面

## 13.2 Master Scene 太大时的处理

如果完整 GLB 一次加载性能或内存不可接受，可以：

> 从 Master Scene 派生 Runtime 分区资产，但必须保持原始世界坐标，不重新拼布局。

例如：

```text
TYX_Master_Core.glb
TYX_Master_OuterGarden.glb
TYX_Master_WaterArea.glb
TYX_Master_Background.glb
```

这是 Runtime Optimization，不是重新建模。

---

# 14. P8 —— QA、存档与发布门禁

## 14.1 每次重大阶段必须执行

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

剧情资源变化后：

```bash
npm run dialogue:compile
npm run validate:content
```

资产管线变化后：

```bash
npm run assets:validate
npm run assets:prepare
```

视觉稳定后：

```bash
npm run visual:capture
npm run visual:verify
```

## 14.2 必测项目

- 新游戏
- 继续游戏
- 章节切换
- Checkpoint
- 死亡 / Reset
- Cognition 切换
- Borrow / Anchor
- Evidence 持久化
- 旧存档迁移
- 空气墙
- 掉图点
- 低 FPS 区域
- 浏览器刷新恢复

---

# 15. 并行工作流

为了赶进度，不采用“一个阶段完全结束才允许所有其他工作开始”的串行模式。

## Track A —— Runtime / 场景

负责：

- Master GLB
- Loader
- Camera
- Physics
- Collider
- Spawn
- 空气墙
- 性能

## Track B —— Gameplay / 系统

负责：

- Interaction
- Evidence
- Cognition
- Loop
- Borrow
- Anchor
- Puzzle
- Save

这些可在 Track A 做 First Walkable 时继续使用 `/dev/mechanics` 独立开发和测试。

## Track C —— 剧情重排

开始条件：P2 第一轮实际走图完成。

负责：

- 章节空间映射
- 路线调整
- 证据位置
- NPC 位置
- 剧情门控

## Track D —— QA / 性能

从 P0 开始持续执行，不等项目快结束再测试。

---

# 16. 当前最紧急的 3 个 Sprint

# Sprint 1 —— Master First Walkable

**目标：** 最终模型真正进入游戏。

任务：

- Master GLB 进入资产管线；
- TingYuXuanScene 切换到 Master；
- CameraRig；
- PlayerPhysics；
- Spawn；
- Ground Collider；
- 第一版空气墙。

**结束条件：** 能稳定走 5 分钟。

---

# Sprint 2 —— Walkthrough + Space Remap

**目标：** 不再猜地图。

任务：

- 实际走完整个可玩范围；
- 标记区域；
- 记录死路 / 环路 / 好看的区域 / 性能热点；
- 建立区域 ID；
- 将旧 `tingyuxuan-layout` 分类为 KEEP / REMAP / DEPRECATE；
- 做章节候选空间映射。

**结束条件：** 六段剧情都有至少一个真实空间候选。

---

# Sprint 3 —— 第一章完整 Vertical Slice

**目标：** 得到第一个真正可以给别人玩的章节。

任务：

- Spawn → 调查 → 证据 → 对话 → 矛盾 → 高潮 → 章节结束；
- 接入最终场景 Trigger；
- 接入存档；
- 接入认知机制；
- 最少一轮恐怖演出；
- 基础音频与灯光。

**结束条件：** 非开发者可以独立完成第一章。

---

# 17. 当前禁止事项

从现在起，除非出现明确阻塞，不做以下事情：

1. 不重新大规模修改最终 Blender 建筑布局。
2. 不为了旧剧情坐标移动 Master Scene 建筑。
3. 不同时维护两套“正式听雨轩”空间。
4. 不先做所有房间精确 Collider。
5. 不等六章剧本完全定稿才开始 Runtime。
6. 不在 First Walkable 前做大量小摆件优化。
7. 不因为 FPS 暂时低就立即破坏性减面原模型。
8. 不继续往旧拼装 Runtime 上增加新功能债务。

---

# 18. 决策门与回滚策略

## Gate A —— Master 是否能直接运行

如果 Master GLB 能稳定加载：

> 直接作为正式场景继续。

如果文件过大 / 内存不可接受：

> 从 Master 派生 Runtime 分区资产，保持原世界坐标。

不得退回旧“两模型重新摆放”作为长期正式方案。

## Gate B —— 某区域是否开放

如果区域：

- 走不通；
- 视觉差；
- 无剧情价值；
- 性能极差；

允许先用空气墙关闭。

不要求所有建模区域都必须成为可玩区域。

## Gate C —— 剧情与地图冲突

先问：

1. 能否只移动 Evidence / NPC / Trigger？
2. 能否调整路线？
3. 能否更换剧情发生地点？
4. 是否真的必须改核心故事？

只有 1–3 都无法解决时，才进入核心剧情重构。

---

# 19. 最终项目完成定义

项目最终不以“所有计划项都做了”为完成标准，而以玩家体验为准：

```text
进入游戏
→ 进入听雨轩
→ 空间可信
→ 能自由但受控地探索
→ 能调查
→ 能理解任务
→ 能获得证据
→ 能被错误认知诱导
→ 能重新理解旧证据
→ 能经历恐怖演出
→ 能完成六段剧情
→ 能得到符合选择与认知结果的结局
```

最终 Master Scene 的价值，不是作为一张展示建模截图存在，而是成为整个《游园惊梦：四面证词》真正可玩的空间载体。

---

# 20. 下一步立即执行

**现在不再继续讨论建模。**

下一条 Codex 实施任务应直接是：

> **P0 + P0.5：将 `TingYuXuan_Master.glb` 接入 `garden-of-shadows-game`，废弃旧核心建筑重新拼装路径，完成最终场景 First Walkable；只做必要碰撞与空气墙，不重写剧情，不移动 Master Scene 内部建筑。**

完成 First Walkable 后，立刻进入实际试玩和 P2 空间重新映射，再据此修订章节规划。
