import downloadedAssets from "../../docs/assets/downloaded-3d-assets.json";
import cc0Materials from "../../docs/assets/cc0-materials.json";
import Link from "next/link";

export default function CreditsPage() {
  return (
    <main className="credits-page">
      <header>
        <p className="eyebrow">ASSET ATTRIBUTION</p>
        <h1>制作与授权</h1>
        <p>以下第三方三维资产依据 CC BY 4.0 使用。运行时资产经过比例、材质、网格和纹理优化，原作者与来源保持可追溯。</p>
        <Link href="/">返回项目首页</Link>
      </header>
      <section className="credits-grid">
        {downloadedAssets.map((asset) => (
          <article key={asset.id}>
            <span>3D · {asset.status.toUpperCase()}</span>
            <h2>{asset.title}</h2>
            <p>{asset.intendedUse}</p>
            <dl>
              <div><dt>作者</dt><dd>{asset.author}</dd></div>
              <div><dt>许可</dt><dd><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">Creative Commons Attribution 4.0</a></dd></div>
              <div><dt>来源</dt><dd><a href={asset.sourceUrl} target="_blank" rel="noreferrer">Sketchfab 原始页面</a></dd></div>
              <div><dt>原件校验</dt><dd>{asset.sha256.slice(0, 16)}…</dd></div>
            </dl>
          </article>
        ))}
      </section>
      <header>
        <p className="eyebrow">CC0 RUNTIME SOURCES</p>
        <h2>材质与自然资源</h2>
        <p>下列资源采用 CC0 1.0；项目仍记录作者、来源和运行时哈希，便于复现资产流水线。</p>
      </header>
      <section className="credits-grid">
        {cc0Materials.map((asset) => (
          <article key={asset.id}>
            <span>MATERIAL · 1K KTX2</span>
            <h2>{asset.title}</h2>
            <dl>
              <div><dt>作者</dt><dd>{asset.author}</dd></div>
              <div><dt>许可</dt><dd><a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0 1.0</a></dd></div>
              <div><dt>来源</dt><dd><a href={asset.sourceUrl} target="_blank" rel="noreferrer">Poly Haven 原始页面</a></dd></div>
            </dl>
          </article>
        ))}
        <article>
          <span>NATURE · 10 MODULES</span>
          <h2>Stylized Nature MegaKit</h2>
          <p>3 块岩石、3 株灌木、2 棵树和 2 株地被，经 Blender 合并为规范运行时节点。</p>
          <dl>
            <div><dt>作者</dt><dd>Quaternius</dd></div>
            <div><dt>许可</dt><dd><a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0 1.0</a></dd></div>
            <div><dt>来源</dt><dd><a href="https://quaternius.com/packs/stylizednaturemegakit.html" target="_blank" rel="noreferrer">Quaternius 原始套件页</a></dd></div>
          </dl>
        </article>
      </section>
    </main>
  );
}
