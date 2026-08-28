# Third-Party Assets

正式许可、作者、来源 URL、SHA-256 与当前状态以 `downloaded-3d-assets.json`、`cc0-materials.json`、`cc0-nature.json` 和 `license-ledger.md` 为唯一机器可审计来源。本文件用于发布时快速说明第三方来源。

## Sketchfab · CC BY 4.0

| Source ID | 作者 | 用途 |
|---|---|---|
| `traditional-chinese-siheyuan-courtyard` | andertan | 听雨轩正门、前厅、院墙与正式建筑基线 |
| `ancient-chinese-courtyard-park` | noyou | 西院、园墙、曲廊、桥、假山与园林构图来源 |
| `ancient-chinese-courtyard-house` | BlackBirb | 北楼 / 内宅外轮廓与远景降级 |
| `chinese-pavilion-memoriam` | TenatiousV | 水榭、台基、长凳、岩石来源 |
| `chinese-pavilion` | shineSUU | 备用亭阁 |
| `low-bridge` | YanaBelaya | 水院低桥；仅 Working Copy 做材质兼容转换 |

以上来源均使用 Creative Commons Attribution 4.0，发布署名展示在 `/credits`。

## Poly Haven · CC0 1.0

项目只保留当前场景需要的 8 套 1K PBR 材质：旧灰泥 / 磨损灰泥、深木 / 风化木、灰瓦、两类石材与苔石。Runtime 使用 KTX2/Basis 纹理。

## Quaternius · CC0 1.0

`Stylized Nature MegaKit` 只进入审计后的 10 件子集：3 rocks、3 shrubs、2 trees、2 ground plants。Runtime 合并为 `TYX_NAT_Quaternius_Set_A.glb`。

## 处理规则

- Source → Working Copy → Runtime；原件禁止覆盖。
- CC BY 原件与 Runtime 可由 SHA-256 和 `sourceAssetIds` 回溯。
- A/B 资产进入 `ASSET_DECISIONS.md` 决策表。
- Greybox `TYX_ARCH_Kit_A.glb` 是 project-authored fallback，不冒充第三方正式建筑。
- `approved` 的发布含义必须以 `release-approval.json` 为准；许可审计通过不等于视觉验收通过。
