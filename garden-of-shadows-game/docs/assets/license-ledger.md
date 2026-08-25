# 第三方资产许可台账

机器可读清单见 [`asset-manifest.json`](./asset-manifest.json)。本表是人工审计说明，不代表已经购买或下载候选资产。

| ID | 类型 | 当前用途 | Web 交付结论 | AI 输入 | 状态/下一步 |
|---|---|---|---|---|---|
| aigc-hero-hearing-rain-v1 | 生成图片 | 首页主视觉 | 项目内允许；正式发行前做最终条款复核 | 允许 | 已接入 V0.1 |
| aigc-portrait-zhaoying-v1 | 生成图片 | 沈照影三表情对话立牌 | 项目内允许；正式发行前做最终条款复核 | 允许 | 已接入 V0.1R |
| aigc-portrait-steward-v1 | 生成图片 | 管家残影三表情对话立牌 | 项目内允许；正式发行前做最终条款复核 | 允许 | 已接入 V0.1R |
| aigc-portrait-wife-v1 | 生成图片 | 顾蘅秋三表情对话立牌 | 项目内允许；正式发行前做最终条款复核 | 允许 | 已接入 V0.1R |
| aigc-portrait-gardener-v1 | 生成图片 | 周守圃三表情对话立牌 | 项目内允许；正式发行前做最终条款复核 | 允许 | 已接入 V0.1R |
| candidate-realtime-chinese-pavilion | Sketchfab 模型 | 亭构件候选 | 待确认具体许可与署名 | 未知，默认禁止 | 未下载；联系作者/查清许可 |
| candidate-suzhou-pavilion | Sketchfab 模型 | 构图与亭构件候选 | 待确认具体许可与署名 | 未知，默认禁止 | 未下载；联系作者/查清许可 |
| candidate-fab-classical-garden | Fab 完整环境 | 构图、拆件或预渲染候选 | 默认只作预渲染；模型文件会被 Web 暴露 | 未知，默认禁止 | 未购买；需要作者书面 Web 授权才可运行时交付 |
| polyhaven-materials | CC0 材质/HDRI | 运行时材质优先来源 | 允许 | 按单项页面复核 | 尚未选型 |
| candidate-blendkit-cc0-chinese-pavilion | CC0 源模型 | 亭阁离线优化候选 | 允许，但不得未经减面直接进入网页 | 允许 | 未下载；当前环境无 Blender，待资产工序执行 |
| candidate-polyhaven-chinese-garden-hdri | CC0 HDRI | 反射与环境光候选 | 允许 | 允许 | 未下载；需选择 1K/2K 运行时版本 |

## 审计规则

1. `candidate` 不得进入 `public/assets/runtime/`。
2. Sketchfab CC-BY 资源必须在游戏内“制作与授权”页给出可点击署名。
3. Fab 标准许可允许把资产并入项目，但不允许独立再分发；Web 游戏会把资源文件交给客户端，因此未取得明确 Web 交付许可的付费源文件只用于预渲染或内部构图。
4. 发现 `NoAI` 标识立即将 `aiUsage` 设为 `prohibited`；不得上传到生成、补纹理、重拓扑或训练工具。
5. 进入正式清单前填写作者、许可版本、原包版本、压缩包路径与 SHA-256；缺一项即构建失败。

参考：

- [Fab EULA](https://www.fab.com/eula?lang=en)
- [Poly Haven License](https://polyhaven.com/license)
- [Sketchfab Download API attribution guidelines](https://sketchfab.com/developers/download-api/guidelines)
