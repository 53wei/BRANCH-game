# 《游园惊梦：四面证词》Codex 接续开发执行计划 V3.0

**日期：** 2026-08-30  
**项目根目录：** `E:\C_Projects\game`  
**主工程：** `garden-of-shadows-game`  
**最终空间 Source of Truth：** `TingYuXuan_Master.blend / TingYuXuan_Master.glb`  
**当前阶段：** 从“功能搭建”转入“实机收口 + 章节连续化 + 空间精调”。

---

# 0. 本轮总目标

这轮不要继续无边界扩系统，也不要重新做建模。

本轮唯一总目标：

> **把当前已经完成的 Master Scene、Runtime Ground、空气墙、A/B/C 区域、ROUTE_01～07、序章、第一章、第二章、第三章骨架真正收口成一条可以连续体验的游戏流程。**

目标不是“代码看起来完整”，而是：

```text
进入游戏
→ 序章完整可玩
→ 第一章完整可玩
→ 第二章能在最终 Master Scene 中调查
→ 第三章能在 B 区继续推进
→ 主路线稳定
→ 地面不明显穿帮
→ 不掉地图
→ 空气墙有合理边界
→ 存档和章节切换正常
```

如果本地启动 / typecheck / build 因 WSL、`/bin/bash`、环境问题无法运行，不要无限卡在验收环境上；记录失败原因后继续完成可静态确认的实现。等可执行环境恢复后再统一验收。

---

# 1. 不允许破坏的基线

## 1.1 Master Scene 已锁定

禁止：

- 重新移动正式建筑；
- 重新缩放核心建筑；
- Runtime 中重新拼两套旧模型；
- 为适配旧剧情坐标修改 Master Scene；
- 重新生成大规模 `ZONE_* / BLOCKOUT_* / LANDMARK_*` 建筑白盒；
- 删除当前正式模型对象。

允许：

- Runtime Ground；
- Collider；
- Air Wall；
- Trigger；
- Gameplay Anchor；
- Evidence Layer；
- 灯光、雾、雨、落叶、水渍等程序化 Dressing；
- 为剧情增加不改变正式建筑的临时小型互动物件。

---

# 2. 当前已经存在的内容——不要重复做

## 2.1 地图与路线

```text
AREA_A = 旧园入口区
AREA_B = 主宅调查区
AREA_C = 深园水域区
```

主路线：

```text
ROUTE_01_START
→ ROUTE_02_A_ENTRY
→ ROUTE_03_A_LOOP
→ ROUTE_04_A_EAST_EXIT
→ ROUTE_05_B_MAIN_COURT
→ ROUTE_06_B_NORTHEAST_LINK
→ ROUTE_07_C_ENTRY
```

不要重命名或另造第二套路由系统。

## 2.2 Runtime Ground

已经存在：

- Base Ground；
- AREA_A Ground；
- AREA_B Ground；
- AREA_C Entry Ground；
- 6 段 Route Ground Patch；
- Gameplay Ground Collider；
- Ground Seam 草、石头；
- Wet Stains；
- Fallen Leaves。

后续任务是**精调、补漏、减少穿帮**，不是重新设计一套。

## 2.3 空气墙 / Collider

已经存在：

- 全局地图边界；
- A/B 区域分隔；
- B/C 边界；
- C 区第一次进入锁；
- 深水 / 河岸候选边界；
- 夫人认知侧路墙；
- 老周认知东侧出口墙；
- 序章四面 Pocket Boundary；
- `prologue-gate-lock` 动态门锁。

`PhysicsController` 已支持按 ID 动态开关 Collider。

## 2.4 序章

已经新增：

- `PrologueRuntime.tsx`
- `manifests/prologue-rain.ts`
- `PROLOGUE_STEWARD`
- `PROLOGUE_UMBRELLA`
- `PROLOGUE_SHOES`
- `PROLOGUE_LEDGER`

当前剧情结构：

```text
旧信
→ “没有回来 / 回来过 / 没有回来”
→ 老周拦门
→ 门外自由调查
→ 入园簿“四 / 五 / 四”
→ 旧伞 / 旧鞋
→ 回去质问老周
→ 获得“先核对，再判断”的规则
→ 老周让门
→ 进入 AREA_A
→ “他们四个人都这么记得，包括你”
→ 序章标题文字改写
→ 第一章《不存在的路》
```

## 2.5 字义漂移系统

已经有：

- `SemanticMorphText.tsx`
- Ink / Dialogue Morph Tag 解析
- stable / final / none 日志策略
- 墨迹式轻抖 / 重影 / 字形替换
- 不同字数时预留宽度，避免句子跳位
- `paperScratch()` 程序化纸墨声

不要做 RGB / 扫描线 / Cyber Glitch。

## 2.6 第一章

当前核心已经存在：

```text
夫人认知：侧路物理封死
老周认知：侧路可进入
老周认知：东侧出口物理封死
→ 进入侧路
→ Loop
→ 无脸人
→ 切回夫人认知
→ A 东侧出口
→ B 区
```

## 2.7 第二、第三章

第二章已经迁往最终 Master Scene 的 B 区，不再使用旧北楼独立白盒逻辑。

现有证据方向：

- 第六只茶杯；
- 被修改的离园记录；
- 柳生图像 / 框景证据；
- 最终只能证明“第五人存在”。

第三章已经有：

- `MissingRoomRuntime.tsx`
- 门；
- 窗；
- 建筑尺寸；
- 家具记忆；
- 缺失房间重构；
- 旧盒子 / 身高痕迹；
- 结论：“第五个人就是我”。

---

# 3. P0 —— 代码现实审计

开工前先看当前 diff，不要直接大改。

重点文件：

```text
app/game/PrologueRuntime.tsx
app/game/GameRuntime.tsx
app/game/NorthTowerRuntime.tsx
app/game/MissingRoomRuntime.tsx
app/game/narrative/SemanticMorphText.tsx
app/game/narrative/DialogueRunner.tsx
app/game/narrative/dialogue.ts
app/game/runtime/PhysicsController.ts
app/game/runtime/TingYuXuanScene.ts
app/game/runtime/tingyuxuan-gameplay-map.ts
app/game/runtime/tingyuxuan-layout.ts
app/game/manifests/prologue-rain.ts
app/game/manifests/west-corridor.ts
app/page.tsx
```

检查并直接修：

1. 明显 TypeScript 类型问题；
2. React state/ref 死锁；
3. Runtime 生命周期未 dispose；
4. 存档状态被覆盖；
5. 旧 Opening / Spawn / Route 残留；
6. Master Scene 与 legacy placement 同时加载；
7. 空气墙意外堵住主路线；
8. 序章结束后第一章重复播放序章；
9. 第一章还依赖最终地图已失效的旧 Trigger；
10. 章节切换时 Evidence / Flags 丢失。

---

# 4. P1 —— 序章完整 Vertical Slice

这是当前最高优先级。

## 4.1 Scene 01：旧信

黑暗 + 雨声。

```text
如果你看到这封信，我应该已经死了。
七年前的中元夜，有一件事被所有人记错了。
你回到听雨轩以后，不要急着问谁在撒谎。
先确认一件事情。
你那一晚，没有回来。
```

随后：

```text
没有回来
→ 微抖
→ 回来过
→ 微抖
→ 没有回来
```

效果必须是墨迹改写，不是电子故障。

## 4.2 Scene 02：雨夜园门

进入最终 Master Scene。

老周：

```text
你不该回来。
我七年前就走了。
我知道。
那你为什么说“回来”？
因为你上一次也是从这里进去的。
我从来没有来过这里。
所以我才不让你进去。
```

对话结束后玩家获得控制。

## 4.3 Scene 03：门外调查

玩家必须：

```text
入园簿 + 旧伞 / 旧鞋其中一个
```

入园簿必播：

```text
中元夜，入园四人
→ 四轻抖
→ 五
→ 再变回四
```

日志仍然只保存“四人”。

## 4.4 Scene 04：质问老周

达到条件后才出现：

`[F] 拿证据质问老周`

老周此时才教规则：

> 同一个地方，两个人都记得，而且两种记法不能同时成立——那才值得你停下来。

不要在玩家经历异常之前先讲机制教程。

## 4.5 Scene 05：开门

剧情结束：

```text
prologue-gate-lock = false
```

玩家亲自穿过门洞进入：

`ROUTE_02_A_ENTRY`

## 4.6 Scene 06：收尾

```text
如果一会儿有人问你，七年前来没来过……你就说没有。
因为他们四个人都是这么记得的。
包括你。
```

然后：

```text
序章 · 你没有回来
→ “没有回来”改写成“回来过”
→ 第一章 · 不存在的路
```

自动切到第一章。

---

# 5. P2 —— 序章空间精调

实机检查：

```text
PROLOGUE_STEWARD
PROLOGUE_UMBRELLA
PROLOGUE_SHOES
PROLOGUE_LEDGER
```

要求：

- 不穿墙；
- 不悬空；
- 不埋地；
- 不挡主路；
- 交互距离自然；
- 摄像机能看清；
- 不需要极端仰头 / 低头；
- 和左下园门实际结构一致。

老周如果暂时没有正式人物模型，可以保留低成本临时表现，但要使用暗轮廓、暖灯笼、雨雾压低测试模型感。

---

# 6. P3 —— Ground Patch 收口

依次检查：

```text
ROUTE_01 → ROUTE_02
ROUTE_02 → ROUTE_03
ROUTE_03 → ROUTE_04
ROUTE_04 → ROUTE_05
ROUTE_05 → ROUTE_06
ROUTE_06 → ROUTE_07
```

每段检查：

- 是否掉图；
- 是否地面突然升降；
- 是否视觉地面与 Collider 高度不一致；
- 是否露出巨大纯色矩形；
- 是否有明显 GLB / Runtime 拼缝；
- 是否建筑底部像悬浮；
- 是否道路宽度不足。

继续：

```text
Base Ground
+ Region Ground
+ Route Ground
+ Seam Dressing
```

允许补：

- 落叶；
- 水渍；
- 苔；
- 草；
- 小石；
- 泥痕；
- 少量不规则 Path Shape。

优先 `InstancedMesh`。

禁止：

- 平均随机铺满；
- 高密度草挡路；
- 大量独立高成本 Mesh；
- Dressing 参与 Gameplay 碰撞。

---

# 7. P4 —— 空气墙收口

必须封：

- 地图最外围；
- 山体背景；
- 无法进入的模型后侧；
- 深水；
- 会掉图的模型缝；
- 暂不开放 C 区深处；
- 无剧情价值死角；
- 玩家容易卡死的位置。

空气墙优先贴：

- 园墙；
- 树丛；
- 假山；
- 水岸；
- 栏杆；
- 关闭的门；
- 黑暗区域。

禁止：

> 玩家在一块视觉上完全可走的空地中央突然撞上空气墙。

`?debugLayout=1` 下必须能看到：

- 全局 Collider；
- Progression Lock；
- Memory Wall；
- Prologue Wall；
- Route；
- A/B/C 区域。

正式模式全部隐藏。

---

# 8. P5 —— ROUTE_01～07 实机连通

```text
ROUTE_01_START
↓
ROUTE_02_A_ENTRY
↓
ROUTE_03_A_LOOP
↓
ROUTE_04_A_EAST_EXIT
↓
ROUTE_05_B_MAIN_COURT
↓
ROUTE_06_B_NORTHEAST_LINK
↓
ROUTE_07_C_ENTRY
```

要求：

| 路段 | 验收 |
|---|---|
| 01→02 | 序章解锁后正常穿门 |
| 02→03 | A 区正常到达 Loop 核心 |
| 03→04 | 认知谜题正确，不被全局墙误封 |
| 04→05 | A 东出口真正进入 B |
| 05→06 | B 主院到东北连接通畅 |
| 06→07 | 能到 C Entry，但不能进入 C 深处 |

Anchor 与最终模型明显错位时，只调整 Gameplay Anchor，不允许移动建筑。

---

# 9. P6 —— 第一章《不存在的路》收口

起点：

`ROUTE_02_A_ENTRY`

不得重复旧 Opening。

完整流程：

```text
进入 A 区
→ 建立正常路线
→ 夫人：这里一直是墙
→ 同位置切老周认知
→ 老周：这里一直有侧路
→ 侧路开放
→ 进入
→ Loop
→ 无脸人出现
→ 发现同一认知无法离开
→ 切回夫人
→ 东侧出口开放
→ ROUTE_04
→ ROUTE_05 / B 区
```

重点清理：

- 旧 `opening`；
- “进入西廊”等旧玩家文案；
- 旧 front hall 路线依赖；
- 与最终模型不符的 legacy trigger；
- 旧水流谜题的玩家可见描述。

旧内部 ID 可以为旧 Save 兼容保留，但玩家看到的必须全部是“不存在的路”。

---

# 10. P7 —— 认知碰撞保真

夫人认知：

```text
wife-sealed-side-path = ON
→ 侧路不能走
→ A 东出口可以走
```

老周认知：

```text
gardener-sealed-east-exit = ON
→ 侧路可以走
→ A 东出口不能走
```

必须检查：

- Player Collision Group 切换正确；
- Collider 不错误叠加；
- 切换认知时不把玩家夹进墙；
- Loop Teleport 不掉图；
- Chase 能真正逃向出口；
- 全局空气墙不会破坏这一谜题。

---

# 11. P8 —— 第二章《多出来的人》空间收口

继续使用：

`AREA_B / ROUTE_05_B_MAIN_COURT`

禁止回旧北楼独立白盒。

## 第六只茶杯

- 茶桌位置自然；
- 六只杯子能清楚看出异常；
- 不需要贴脸观察；
- 只证明“多出一个人的生活痕迹”。

## 离园记录 / 账本

- 放在 B 区合理的真实调查空间；
- 不允许 UI 文本漂在空地中央；
- 与钱先生认知绑定。

## 柳生图像证据

必须是真空间玩法：

```text
错误站位
→ 人影不稳定 / 不完整

正确站位
→ 框景重合
→ 第五道人影稳定出现
```

本章只能得出：

> **第五个人存在。**

不能提前告诉玩家第五人是谁。

---

# 12. P9 —— 第三章《不存在的房间》空间收口

仍使用 B 区。

四份局部记忆：

```text
老周 → 门
柳生 → 窗
钱先生 → 建筑边界 / 尺寸
沈夫人 → 床 / 箱子 / 书桌
```

只有四条件全部满足，才显示完整房间。

房间要求：

- 半透明；
- 和 Master Scene 空间对齐；
- 不能漂在院子中央；
- 不改变正式建筑；
- 不干扰正式 Collider；
- 玩家可近距离查看。

最终证据：

- 旧盒子；
- 身高刻痕；
- 玩家熟悉的生活物件。

结论：

> **第五个人就是我。**

---

# 13. P10 —— 字义漂移继续递进

推荐强度：

```text
序章：四 → 五 → 四
序章：没有回来 → 回来过 → 没有回来

第一章：
没有路 → 有路

第二章：
五只 → 六只

第三章：
那个孩子 → 你 → 我

第四章：
赶走 → 送走 → 救走

后期：
他 → 她 → 祂
```

`祂` 不要在序章滥用。

它应当是后期恐怖升级，不是第一分钟的廉价惊吓。

---

# 14. P11 —— 氛围收口

## A 区

- 雨；
- 冷绿 / 湿青；
- 局部暖灯；
- 雾；
- 墙角黑暗；
- 湿地面；
- 回廊遮挡；
- Loop 有空间错觉。

## B 区

- 更安静；
- 更规整；
- 调查型灯光；
- 雨声降低；
- 生活痕迹突出。

## C 区

前期：

- 能远处看到；
- 有灯；
- 有水反光；
- 不能深入。

后期再完全开放。

---

# 15. P12 —— 存档与章节切换

确认：

```text
New Game
→ prologue-rain
→ west-corridor-loop
→ north-tower-ledger
→ missing-room
```

序章必须保存：

- `prologue.complete`
- `prologue.dialogue.complete`
- `prologue.examiner-appointed`
- 旧伞 Evidence
- 旧鞋 Evidence
- 入园簿 Evidence

进入第一章后不能丢。

Continue 必须恢复：

- chapterId；
- anchorId；
- position；
- yaw；
- memoryId；
- evidence flags；
- puzzle progress。

旧 Save 如果坐标失效，迁到最近有效 Gameplay Anchor，不允许出生在空中或旧坐标。

---

# 16. P13 —— 验证顺序

本地命令环境可用时：

```text
1. typecheck
2. focused tests
3. full vitest
4. build
5. browser runtime
6. 手动走图
```

重点：

- Semantic Morph parser；
- Morph log policy；
- Campaign Manifest；
- Prologue Manifest；
- Gameplay Map；
- Air Wall；
- Route Ground；
- Memory Wall；
- Chapter Handoff；
- Save normalization。

如果 `/bin/bash` / WSL 再次失败：

1. 保留原始错误；
2. 不要反复重试；
3. 继续静态实现和修复；
4. 后面再统一验收；
5. 不允许声称“测试已通过”。

---

# 17. 本轮完成标准

## 必须完成

- [ ] 序章独立可玩；
- [ ] 字义漂移真实生效；
- [ ] 入园簿“四→五→四”必经；
- [ ] 老周 Gate 动态解除；
- [ ] 序章可以走到 ROUTE_02；
- [ ] 第一章不会重复旧序章；
- [ ] 第一章可从 ROUTE_02 走到 ROUTE_05；
- [ ] 认知墙真实改变碰撞；
- [ ] ROUTE_01～07 Ground 连续；
- [ ] A/B/C 主可玩区没有明显掉图；
- [ ] 外围 / 深水有第一轮空气墙；
- [ ] C 深区前期锁住；
- [ ] 第二章使用最终 Master Scene；
- [ ] 第三章使用最终 Master Scene；
- [ ] Save / Chapter Handoff 不丢 Flag。

## 视觉必须达到

- [ ] 地面不再有大面积廉价纯色板；
- [ ] GLB 与 Runtime Ground 接口有遮缝；
- [ ] 空气墙不出现在无视觉理由的空地中央；
- [ ] Morph 不是 Cyber Glitch；
- [ ] 序章看起来像故事开场，而不是教程页面。

---

# 18. Codex 完成后统一报告格式

## A. 代码验证

- typecheck：PASS / FAIL / NOT RUN
- tests：通过数 / 失败数
- build：PASS / FAIL / NOT RUN
- 环境问题：原始错误

## B. 序章

- 是否完整跑通；
- Morph 是否正常；
- 四→五→四是否正常；
- 老周 Gate 是否正常；
- Evidence 是否重新定位；
- ROUTE_02 handoff 是否正常。

## C. 路线

逐段：

```text
01→02
02→03
03→04
04→05
05→06
06→07
```

每段报告：

- PASS / BLOCKED；
- Grounded；
- 穿模点；
- 掉图点；
- 空气墙问题；
- 待修内容。

## D. 章节

- 第一章完整度；
- 第二章完整度；
- 第三章完整度。

## E. 文件修改清单

列出本轮真正修改的文件。

## F. 未完成内容

明确写出：

- 什么还没做；
- 为什么；
- 下一步是什么。

---

# 19. 执行原则

> **先修已有实现，再新增。**  
> **先实际跑通，再扩剧情。**  
> **剧情迁就最终地图，建筑不迁就旧剧情。**  
> **Gameplay Anchor 可以改，Master 建筑不能动。**  
> **空气墙可以使用，但必须服务玩家体验。**  
> **地面视觉与碰撞必须分离。**  
> **不要为了显得工作量大继续制造新系统。**  
> **效果必须真正出现在 Runtime，不能只存在于代码和文档里。**

当前最高优先级只有一句话：

> **先把“序章 → 第一章 → B 区”做成真正连续、稳定、有氛围、不会掉图的第一条完整游戏体验。**
