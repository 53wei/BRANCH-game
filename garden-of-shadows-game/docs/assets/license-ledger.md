# 第三方资产许可台账

机器可读记录见 `downloaded-3d-assets.json`、`cc0-materials.json`、`cc0-nature.json` 与 `runtime-assets.json`。原件仅保存在 Git 忽略的 `assets-source/`；公开交付物均可沿 SHA-256 追溯到原件。

## Sketchfab · CC BY 4.0

| ID | 标题 / 作者 | 原始页面 | 正式用途 | 署名位置 |
|---|---|---|---|---|
| ancient-chinese-courtyard-house | Ancient Chinese Courtyard House / BlackBirb | [Sketchfab](https://sketchfab.com/3d-models/ancient-chinese-courtyard-house-ed4ea9eb5f024d989eec182d48fa72d8) | 轻量房屋、远景降级 | `/credits` |
| ancient-chinese-courtyard-park | Ancient Chinese courtyard Park / noyou | [Sketchfab](https://sketchfab.com/3d-models/ancient-chinese-courtyard-park-55d8371278844dbbbe43e1f867b5fcde) | 园林拆件来源 | `/credits` |
| chinese-pavilion | Chinese pavilion / shineSUU | [Sketchfab](https://sketchfab.com/3d-models/chinese-pavilion-b0f6c1fb43e744ec876faecaba3d4925) | 修正比例后的备选亭 | `/credits` |
| chinese-pavilion-memoriam | Chinese Pavilion Memoriam / TenatiousV | [Sketchfab](https://sketchfab.com/3d-models/chinese-pavilion-memoriam-87f4931714d7481baa54e5050f679be2) | 水榭、台基、长凳与岩石来源 | `/credits` |
| low-bridge | Low Bridge / YanaBelaya | [Sketchfab](https://sketchfab.com/3d-models/low-bridge-015406b34db64859a6d17fb8c825bf52) | 水院低桥；工作副本兼容转换 | `/credits` |
| traditional-chinese-siheyuan-courtyard | Traditional Chinese Siheyuan Courtyard / andertan | [Sketchfab](https://sketchfab.com/3d-models/traditional-chinese-siheyuan-courtyard-a18881525cfd4fe882e739c9c7cee752) | 正门、前厅、回廊与模块库主来源 | `/credits` |

许可统一为 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)。Low Bridge 原件使用旧 `KHR_materials_pbrSpecularGlossiness`；只对工作副本执行 metallic-roughness 兼容转换，原件哈希保持不变。

## CC0 材质与自然资源

| 来源 | 选用范围 | 许可 | 交付规则 |
|---|---|---|---|
| [Poly Haven](https://polyhaven.com/license) | 8 套 1K 材质、每套 Diffuse / OpenGL Normal / ARM | CC0 1.0 | 原 JPG 忽略；跟踪 24 个 KTX2 |
| [Quaternius Stylized Nature MegaKit](https://quaternius.com/packs/stylizednaturemegakit.html) | 3 岩石、3 灌木、2 树、2 地被 | CC0 1.0 | 单件经 [Poly Pizza 镜像页](https://poly.pizza/bundle/Stylized-Nature-MegaKit-T34GZFA0fm) 审计；跟踪合并后的 Meshopt/KTX2 GLB |

## 审计与发布规则

1. Source → Working Copy → Runtime 三层不可逆向覆盖；原件 SHA-256 不得变化。
2. 第一阶段正式视觉验收期间，25 MiB 单文件与 18 MiB `preload` 仅作为发布预算参考，不得提前否决真实建筑；先完成实景接入与测量，再通过拆分、区域加载、KTX2、Meshopt、LOD 或适度减面优化。
3. 已进入优化阶段的 runtime GLB 必须具备 Meshopt，含纹理的优化副本使用 KTX2/Basis；`visual-fidelity-baseline` 可暂时保留审计原始几何与纹理，用于正式视觉基线验证。fallback 模块与自然套件仍须满足清单节点约束。
4. `candidate` 只有在许可、功能以及五张第一阶段主路径截图的人工视觉验收通过后才可改为 `approved`；构建或资产预览通过不得自动替代视觉验收。
