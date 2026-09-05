# AIGC 来源与修改台账

## AIGC-IMG-001 · 雨入听轩项目主视觉

- 文件：`public/media/hero-hearing-rain.png`
- 日期：2026-08-25
- 工具：OpenAI 内置 ImageGen
- 模式：全新生成；未传入参考图片
- 模型版本：由内置服务管理；调用结果 ID `exec-f5b41549-e17d-4451-878f-eb303b4676a4`
- 种子：服务未返回
- 参考素材：无
- 人工修改：无；仅复制到项目目录并由 CSS 裁切显示
- SHA-256：`57ab1f343efe80a4a470ecd6e8b60b04a9af2763fa719781e374ad7833572b27`
- NoAI 检查：未使用任何第三方输入素材
- 用途：项目首页主视觉、内部视觉方向基线；不作为实时 3D 几何或史实证据

最终提示词：

> Create a premium cinematic key art image for a Chinese psychological-horror mystery game set in 1923 Suzhou, on the rainy night of the Ghost Festival. Wide 16:9 composition for a PC game landing-page hero, with important focal content weighted toward the right half so dark negative space remains on the left for a title overlay. A historically inspired Jiangnan classical garden corridor leads toward a moon gate and a locked waterside pavilion. Wet dark stone reflects restrained amber-red lantern light; fine rain, humid volumetric mist, deep jade-green and charcoal palette, subtle aged-film texture, realistic materials, richly art-directed AAA game key art. At the right foreground stands the back/three-quarter silhouette of a young Chinese woman, Shen Zhaoying, a Kunqu dan-role inheritor wearing a refined pale performance robe with a muted crimson edge; her face is mostly hidden. In the water reflections and paper-screen shadows, imply four conflicting witnesses and a fifth erased silhouette without showing gore or a monster. Architectural spatial unease: one corridor reflection bends impossibly toward the pavilion, but the physical garden remains believable. Elegant, uncanny, melancholic, high detail, dramatic composition, no typography, no Chinese characters, no logos, no watermark, no UI, no border.

## AIGC-IMG-002 · 沈照影三表情立牌

- 文件：`public/media/portraits/zhaoying-{calm,guarded,alarmed}.webp`
- 日期：2026-08-25
- 工具：OpenAI 内置 ImageGen
- 调用结果 ID：`exec-0dc9718d-a8bb-4d6d-a12b-afcb080c91d3`
- 模式：全新生成；未传入参考图片
- 人工修改：将 1536×1024 透明母版等分裁切为三个 512×1024 WebP；质量 88、Alpha 质量 95
- 聚合 SHA-256：`2dd5af32e6b9f962b7646d03e11d4ea1e4566dac4b0658d5ce4fe82e590f56d6`
- NoAI 检查：未使用第三方输入素材

最终提示词：

> Use case: stylized-concept. Asset type: production game character portrait sprite sheet. Create one coherent character sheet showing the same young Chinese woman three times, for Shen Zhaoying, the unnamed player-investigator and Kunqu dan-role inheritor in a 1923 Jiangnan psychological-horror mystery game. Genuinely transparent background. Same woman in three waist-up portraits: calm and observant; guarded and alert; frightened but resolute. Preserve the same face, hairstyle, pale refined Republican-era Chinese dress with subtle Kunqu influence, and muted crimson piping. Exquisite Chinese gongbi heavy-color illustration, fine controlled linework, mineral pigments, silk-like texture. Cool rainy-night jade rim light and restrained warm lantern key. No text, border, watermark, logos, props, extra people, anime, modern fashion or identity drift.

## AIGC-IMG-003 · 老管家三表情立牌

- 文件：`public/media/portraits/steward-{courteous,knowing,threatening}.webp`
- 日期：2026-08-25
- 工具：OpenAI 内置 ImageGen
- 初次生成 ID：`exec-43d3ea24-a56c-4ab2-ac8d-6a9b67f9d7d9`
- 背景提取修订 ID：`exec-8c67a9cf-0ba2-40af-a532-afd7dd4df27d`
- 输入参考：AIGC-IMG-002 仅作为风格、光照、比例和三栏布局参考；项目自有生成素材
- 人工修改：使用 ImageGen 移除误绘制的棋盘格背景，再等分裁切为三个透明 WebP
- 聚合 SHA-256：`5c7c77637fb4ab78c539637b85833e28e150ab1be686fadf4d263a7d5433aa13`
- NoAI 检查：未使用第三方输入素材

最终生成提示词：

> Use case: stylized-concept. Asset type: production game character portrait sprite sheet. Image 1 is a style, lighting, palette, brushwork, scale, and three-panel layout reference only. Create the same older Chinese man three times: the courteous old steward who is secretly Shen Yantang's residual shadow. Three expressions: humble and courteous; quietly all-knowing; controlled menace. Preserve the same narrow weathered face, greying hair, sparse moustache, dark Republican-era changshan, rain-damp outer vest, and modest steward cap. Match the exquisite Chinese gongbi heavy-color illustration style. Transparent background; no text, labels, border, watermark, props, fantasy costume or obvious ghost effects.

背景提取提示词：

> Remove only the white-and-light-gray checkerboard background and replace it with genuine alpha transparency. Preserve all three portraits exactly: same faces, expressions, hair, cap, clothing, pose, scale, spacing, lighting, color, texture, and canvas dimensions. Keep clean natural edges. Do not repaint or redesign any character detail.

## AIGC-IMG-004 · 顾蘅秋三表情立牌

- 文件：`public/media/portraits/wife-{restrained,grieving,guarded}.webp`
- 日期：2026-08-25
- 工具：OpenAI 内置 ImageGen
- 调用结果 ID：`exec-7e9e47d5-2aa1-4ff7-8c90-aa772194a252`
- 模式：全新生成；未传入参考图片
- 人工修改：等分裁切为三个透明 WebP
- 聚合 SHA-256：`20aa805d1f89c9d16270a0bd8d0f191c377caf11765fbb3a70346452ae4532e2`
- NoAI 检查：未使用第三方输入素材

最终提示词：

> Use case: stylized-concept. Asset type: production game character portrait sprite sheet. Create the same Chinese woman three times: Gu Hengqiu, the deceased garden owner's restrained wife and crucial witness in a 1923 Jiangnan psychological-horror mystery. Three expressions: controlled and aristocratic; grieving behind composure; wary and defensive. Preserve the same mature face, low Republican-era hair bun, dark plum silk qipao with bamboo motif, antique-gold piping, and jade ear studs. Exquisite Chinese gongbi heavy-color illustration with mineral pigments and silk texture. Transparent background; no text, border, watermark, modern fashion, fantasy costume or identity drift.

## AIGC-IMG-005 · 周守圃三表情立牌

- 文件：`public/media/portraits/gardener-{taciturn,guilty,alarmed}.webp`
- 日期：2026-08-25
- 工具：OpenAI 内置 ImageGen
- 调用结果 ID：`exec-e1af9768-d076-49ea-8c16-6bded50e5783`
- 模式：全新生成；未传入参考图片
- 人工修改：等分裁切为三个透明 WebP
- 聚合 SHA-256：`7ae486c9af38790c1d6d3b408bbe8fb4b6f2777ec34cd7664e621dd02437eece`
- NoAI 检查：未使用第三方输入素材

最终提示词：

> Use case: stylized-concept. Asset type: production game character portrait sprite sheet. Create the same Chinese man three times: Zhou Shoupu, the quiet groundskeeper and guilty witness in a 1923 Jiangnan psychological-horror mystery. Three expressions: taciturn and grounded; inwardly guilty; startled and protective. Preserve the same broad weathered face, cloth headwrap, rough indigo work jacket, hemp inner shirt, and calloused hands. Exquisite Chinese gongbi heavy-color illustration with mineral pigments and paper texture. Transparent background; no tools, text, border, watermark, modern clothing, martial-arts hero styling or identity drift.

## AIGC-IMG-006 · 序章前厅补绘旧画像

- 文件：`public/media/evidence/prologue-family-portrait-v1.webp`
- 日期：2026-09-04
- 工具：OpenAI 内置 ImageGen
- 调用结果 ID：`exec-94410960-c183-4611-a2ab-2ef94b0b356a`
- 模式：全新生成；未传入参考图片
- 输入参考与权利：无输入图片；人物、年代与“沈夫人右侧补画空位”只来自项目自有 V5 剧情母稿
- 人工修改：原始 1448×1086 PNG 转为质量 88 的 WebP；未裁切、未重绘
- 导出版本：v1，1448×1086，WebP，227664 bytes
- SHA-256：`3e6ffb978d0c3cbdb980c0905b6297e94e711cbd9febd3043afb815aad358271`
- NoAI 检查：未使用任何第三方输入素材
- 使用章节：序章 0-2 前厅旧画像的世界内画布；原 `cg-02-family-portrait-v1.png` 只保留为剧情演出 CG
- 下架负责人：项目维护者；若最终发行权利复核不通过则从 Runtime 与 manifest 同步移除

加框修订：

- 文件：`public/media/evidence/prologue-family-portrait-v2.webp`
- 调用结果 ID：`exec-fb4e5a2b-11eb-4b42-aa31-458cc6340459`
- 模式：精确物件编辑；输入为本条 v1 项目自有生成资产
- 人工修改：编辑结果原始 1448×1086 PNG 转为质量 88 的 WebP；未裁切、未重绘
- 导出版本：v2，1448×1086，WebP，239266 bytes
- SHA-256：`f3c74132697bd549ada2929d6cd087a488fe1b16bcff432e72f158e34ab79c4f`
- Runtime：v2 为墙面正式引用；v1 保留为无框母版，不覆盖原文件

加框修订提示词：

> Use case: precise-object-edit. Image 1 is the exact approved family portrait artwork to preserve. Add a slim, historically plausible early-20th-century Chinese dark hardwood picture frame around Image 1. Straight-on orthographic view; landscape 4:3 outer silhouette; narrow aged dark hardwood moulding with restrained carved inner bead, slight damp wear and rubbed corners. Crop to the frame’s outside edges. Preserve all five adults, poses, clothes, patched empty area, foliage, color, lighting, aging and restoration marks. No wall, room, observer, glare, mat, hanging wire, text, labels, logo, watermark, extra person, face, ghost, silhouette or prop.

最终提示词：

> Use case: historical-scene. Asset type: production game prop texture for an old framed family portrait hanging inside a 1920s Jiangnan garden residence. Create only the rectangular painted family portrait that Zhao Ying examines in the prologue of 《游园惊梦：四面证词》, without showing Zhao Ying, the surrounding room, a picture frame, or anyone looking at the portrait. Five Chinese adults: Master Shen, Madam Shen, Mr. Qian, old steward Zhou at the far edge, and painter Liu Sheng. Include an intentional subtly patched empty space immediately to Madam Shen’s right, where fabric edges and garden foliage overlap unnaturally; show no sixth person or ghost there. Republican-era China, early 1920s; aged hand-painted oil portrait on canvas, restrained realism, faded pigments, fine craquelure, faint damp damage and restoration marks. Landscape 4:3, straight-on, subdued warm light, aged umber and moss green. No external frame, room, foreground observer, text, characters, labels, logo, watermark, border, modern items, or supernatural effects.

## 后续生成资产必填字段

图片、视频、配音和音乐均需记录：工具、模型、提示词、种子、输入参考、输入权利、人工修改、导出版本、SHA-256、使用章节与下架负责人。任何含第三方 `NoAI` 输入的记录直接判为不合格。
