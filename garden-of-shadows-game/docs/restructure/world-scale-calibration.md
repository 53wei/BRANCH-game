# TASK-015｜听雨轩统一世界尺度校准

Updated: 2026-09-03

## 1. Runtime 世界单位合同

正式 Runtime 统一采用米制：

- `1 world unit = 1 meter`
- gameplay ground：`Y = 0`
- gameplay anchor reference：`Y = 0.9m`
- Master Scene 唯一 root scale：`0.64`
- 旧 `0.2` 仅是历史缩略导入尺度，禁止作为 Runtime 世界尺度继续使用

对应代码：

- `app/game/runtime/tingyuxuan-gameplay-map.ts`
  - `WORLD_METERS_PER_UNIT`
  - `GAMEPLAY_GROUND_Y`
  - `GAMEPLAY_ANCHOR_REFERENCE_Y`
- `app/game/runtime/tingyuxuan-layout.ts`
  - `TINGYUXUAN_MASTER_SCALE_CALIBRATION`
  - `TINGYUXUAN_MASTER_ROOT_TRANSFORM`

所有 Gameplay Route / Chapter Anchor 的 Y 已统一绑定 `GAMEPLAY_ANCHOR_REFERENCE_Y`，不再各章节重复硬编码 `0.9`。

## 2. 已有真实测量基准

| 参照 | Runtime 尺寸 | 来源 | 状态 |
|---|---:|---|---|
| 成人参考身高 | 1.693 m | 人体尺度校准 | LOCKED |
| 主门净空 | 2.155 m | `MOD_A_WallGate_10m` clear opening × 0.64 | LOCKED |
| 园墙高度 | 2.946 m | `MOD_A_WallStraight_16m` × 0.64 | LOCKED |
| 主门门槛 | 0.090 m | `TYX_MAIN_GATE_SOUTH` | LOCKED |
| Master 根尺度 | 0.64 | Master Scene calibration | LOCKED |

已锁比例：

- 门洞高 / 成人身高 ≈ 1.27
- 园墙高 / 成人身高 ≈ 1.74
- 门槛低于 0.15m，不能通过高门槛制造“人物很小”的错觉

## 3. TASK-015 其余参照的真实测量方式

TASK 要求门洞、栏杆、桌面、台阶、窗台至少五类参照。门洞已存在实测值；其余类别不得填写猜测值。

`scripts/assets/measure-master-scale.py` 已升级为直接读取 `TingYuXuan_Master.blend`，并分类输出：

- `door`
- `wall`
- `railing`
- `table`
- `step`
- `windowSill`

每个候选都会输出：

- Blender world bounds；
- 乘 `0.64` 后的 Runtime 米制 bounds；
- category candidate count；
- `missingReferenceCategories`。

若 Master 中某类没有可识别命名对象，脚本必须明确列入 `missingReferenceCategories`，不能自动补默认高度。

当前本地 shell 无法启动 Blender/Node/npm，因此本轮不能虚报栏杆、桌面、台阶、窗台的数值已经测出。这部分记为 **VERIFY-DEFERRED / MEASUREMENT-DEFERRED**，不是 Code failure。

## 4. Gameplay Anchor Y 规则

以前大量 Route/Chapter Anchor 直接写 `0.9`，导致世界尺度与角色中心高度之间只有隐式约定。

现在：

- 主门 `outsideSpawn / insideEntry` 使用统一 Anchor Y；
- ROUTE_01～ROUTE_07 使用统一 Anchor Y；
- A/B/C 章节 Anchor 使用统一 Anchor Y；
- 序章 scale audit pose、spawn lower bound、evidence interaction probe 使用同一个值；
- `tingyuxuan-layout.test.ts` 会要求所有 gameplay anchor 的 Y 与统一合同一致。

TASK-016 调整 Capsule/Camera 时，不得直接修改所有 Anchor；如确需改变角色刚体中心语义，应修改单一合同并跑完整回归。

## 5. 强制尺度截图姿势

`npm run visual:audit-prologue-spawn` 已配置三张回归图：

1. `scale-wall-character.png`
   - 成人与园墙/门楼同框；
2. `scale-door-character.png`
   - 成人站在主门净空旁；
3. `gameplay-shoulder-camera.png`
   - 正常探索视角下同时观察人物、门洞、园墙与前路。

这些姿势由 `PROLOGUE_VISUAL_AUDIT_POSES` 绑定统一 Anchor Y。

当前目录仍只有旧的 `prologue-route-01-spawn.png`，因此不能把旧截图冒充 TASK-015 新验收图。新三图必须在 runner 恢复后重新生成。

## 6. TASK-015 验收状态

### 工程闭环

- 世界米制合同：DONE
- Master root scale：DONE
- 门/墙/门槛实测基准：DONE
- Gameplay Anchor Y 单一合同：DONE
- 真实 GLB 六类参照测量工具：DONE
- 尺度回归测试：DONE / RUN DEFERRED
- 三张尺度截图姿势：DONE / CAPTURE DEFERRED

### 运行 / 视觉验证

`VERIFY-DEFERRED — Local runner cannot enter npm because WSL /bin/bash is unavailable.`

栏杆 / 桌面 / 台阶 / 窗台的实际数值必须由测量脚本运行后写回本表；当前不伪造数字。

因此 TASK-015 的代码与校准体系已经完成，但最终视觉/测量证据保持 deferred。按执行协议可进入 TASK-016，后续恢复 runner 后必须补跑本 Gate，不得跳过。
