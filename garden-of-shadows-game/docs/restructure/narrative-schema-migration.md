# TASK-006 Narrative Content Schema 迁移说明

Updated: 2026-09-03

## 统一语义

所有正式叙事节点只能使用：

- `spoken`：人物真正说出口的对白；
- `inner`：赵映没有说出口的心理；
- `narration`：环境/状态叙述；
- `action`：动作与演出调度；
- `choice`：玩家选择；
- `cg`：CG/画面节点；
- `interaction`：交互/操作反馈，不承担新的案件事实。

类型定义位于 `app/game/narrative/content-schema.ts`。`narrativePresentationRole()` 与 `narrativeDisplayLabel()` 是 UI 的统一语义映射，Runtime 不再各自发明“旁白到底算哪个角色”。

## Runtime 接入

- `PrologueRuntime`：V5 序章通过 `prologue-content.ts` 的稳定节点 ID 消费统一 schema；轻量环境字幕也走 `NarrativeInline(kind=narration)`。
- `GameRuntime`：正式 Ink 由 `parseDialogueTags()` 解析 `kind:`，`DialogueRunner` 使用统一 label/role；移动中短提示走 `NarrativeInline`。
- `NorthTowerRuntime`：轻量调查提示走 `NarrativeInline(kind=interaction)`；TASK-009 负责把 V5 第二章正式人物场景迁入同一内容层。
- `MissingRoomRuntime`：轻量重构提示走 `NarrativeInline(kind=interaction)`；TASK-010 负责把 V5 第三章正式人物/心理场景迁入同一内容层。

## 稳定 ID

- Ink 正式文本必须有 `# line:<stable-id>`；
- V5 TypeScript 内容节点必须有 `id`；
- 已读、存档、回顾、TTS/voice 只引用稳定 ID，不按当前数组下标作为永久身份；
- fallback ID 只用于兼容旧 Ink，不允许成为新正式内容的写法。

## 旧实现处理

- 旧 Ink 可以继续作为 Ink 编译输入，但语义必须通过统一 tag parser；
- 旧 hardcoded StoryLine 不再拥有高于 V5 的事实权；
- Runtime 中的操作提示可以保留在 guidance/interaction 内容层，但不得现场补主线剧情；
- TASK-007～014 逐章迁移时，只迁移 V5 已有文本和必要的非剧情操作说明。
