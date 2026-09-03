# 已下载 3D 资产清单

> Gameplay Runtime 的正式空间输入已切换为工作区项目自有资产 `TingYuXuan_Master.glb`，运行时 ID 为 `tyx-master-scene`，交付副本为 `/assets/fidelity/TYX_Master_Scene.glb`。下表继续记录构成 Master 的第三方来源资产与许可链。

> 由 npm run assets:inventory 从本地只读原件生成。原件不进入 Git，SHA-256 用于确认 Source → Working → Runtime 链路。

| ID | 标题 | 大小 | 网格 | 材质 | 纹理 | 约三角面 | 许可 | 处理级别 | 预期用途 | 状态 |
|---|---|---:|---:|---:|---:|---:|---|---|---|---|
| ancient-chinese-courtyard-house | Ancient Chinese Courtyard House | 27.26 MiB | 2 | 2 | 6 | 7,639 | CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) | A | 轻量房屋、远景与低画质降级资产 | approved |
| ancient-chinese-courtyard-park | Ancient Chinese courtyard Park | 23.67 MiB | 27 | 24 | 24 | 268,540 | CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) | B | 回廊、园墙、亭、桥、假山与园林拆件来源 | approved |
| chinese-pavilion | Chinese pavilion | 4.14 MiB | 16 | 8 | 7 | 62,613 | CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) | B | 修正比例后的备用亭阁 | approved |
| chinese-pavilion-memoriam | Chinese Pavilion Memoriam | 9.58 MiB | 13 | 8 | 18 | 14,632 | CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) | A | 水榭外观、台基、长凳与岩石来源 | approved |
| low-bridge | Low Bridge | 4.23 MiB | 2 | 1 | 4 | 9,809 | CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) | B | 水院低桥与独立简化碰撞 | approved |
| traditional-chinese-siheyuan-courtyard | Traditional Chinese Siheyuan Courtyard | 98.17 MiB | 32 | 27 | 44 | 595,743 | CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/) | B | 正门、前厅、主屋、院墙、门窗与屋面主来源 | approved |

## 原件规则

- assets-source/manual-downloads/ 只读、Git 忽略，禁止原地覆盖。
- 所有转换写入 assets-source/blender-working/，正式文件只写入 public/assets/。
- 本表 `approved` 仅表示第三方来源、许可与原件审计通过，不等同于主场景视觉验收；正式发布状态以 `release-approval.json` 与五张第一阶段截图验收为准。
- 每个运行时文件必须能追溯到本表 SHA-256；许可、作者、来源或哈希缺失时不得标记 approved。
