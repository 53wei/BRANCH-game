"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

interface AssetCatalogEntry {
  id: string;
  title: string;
  bytes: number;
  author: string;
  sourceUrl: string;
  license: string;
  intendedUse: string;
  classification: string;
  previewMode: "raw" | "compatibility-copy";
  previewUrl: string;
  metrics: {
    nodes: number;
    meshes: number;
    materials: number;
    textures: number;
    trianglesApprox: number;
  };
  bounds: { size: [number, number, number] };
  extensionsRequired: string[];
}

interface RuntimeStats {
  meshes: number;
  materials: number;
  textures: number;
  triangles: number;
}

const formatMb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + " MiB";
const formatVector = (values: [number, number, number]) => values.map((value) => value.toFixed(2)).join(" × ");

const disposeObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      material.dispose();
    }
  });
};

const collectStats = (object: THREE.Object3D): RuntimeStats => {
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  let meshes = 0;
  let triangles = 0;
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    meshes += 1;
    const geometry = child.geometry;
    const count = geometry.index?.count ?? geometry.getAttribute("position")?.count ?? 0;
    triangles += Math.floor(count / 3);
    const meshMaterials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of meshMaterials) {
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
    }
  });
  return { meshes, materials: materials.size, textures: textures.size, triangles };
};

export default function AssetPreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewGroupRef = useRef(new THREE.Group());
  const modelRef = useRef<THREE.Object3D | undefined>(undefined);
  const helperRef = useRef<THREE.Box3Helper | undefined>(undefined);
  const [catalog, setCatalog] = useState<AssetCatalogEntry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [stats, setStats] = useState<RuntimeStats>();
  const [wireframe, setWireframe] = useState(false);
  const wireframeRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const selected = useMemo(() => catalog.find((entry) => entry.id === selectedId), [catalog, selectedId]);

  useEffect(() => {
    fetch("/__asset-preview/catalog")
      .then((response) => {
        if (!response.ok) throw new Error("资产预览仅在本地开发服务器可用。");
        return response.json() as Promise<AssetCatalogEntry[]>;
      })
      .then((entries) => {
        setCatalog(entries);
        const requestedId = new URLSearchParams(window.location.search).get("asset");
        setSelectedId(entries.some((entry) => entry.id === requestedId) ? requestedId! : (entries[0]?.id ?? ""));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "无法读取资产目录"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07100f");
    scene.fog = new THREE.Fog("#07100f", 12, 28);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.01, 100);
    camera.position.set(6, 4.5, 7);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.target.set(0, 1.5, 0);
    const previewGroup = previewGroupRef.current;
    scene.add(
      new THREE.HemisphereLight("#d5e2d7", "#1b211d", 2.4),
      new THREE.GridHelper(16, 32, "#4f665d", "#1b2924"),
      new THREE.AxesHelper(2),
      previewGroup,
    );
    const key = new THREE.DirectionalLight("#ffe1b4", 4);
    key.position.set(5, 9, 4);
    scene.add(key);
    const resize = () => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });
    resize();
    return () => {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    const loader = new GLTFLoader();
    void Promise.resolve()
      .then(() => {
        if (!cancelled) {
          setLoading(true);
          setError(undefined);
        }
        return loader.loadAsync(selected.previewUrl);
      })
      .then((gltf) => {
        if (cancelled) {
          disposeObject(gltf.scene);
          return;
        }
        if (modelRef.current) {
          previewGroupRef.current.remove(modelRef.current);
          disposeObject(modelRef.current);
        }
        if (helperRef.current) {
          previewGroupRef.current.remove(helperRef.current);
          helperRef.current.geometry.dispose();
          const helperMaterials = Array.isArray(helperRef.current.material) ? helperRef.current.material : [helperRef.current.material];
          helperMaterials.forEach((material) => material.dispose());
        }
        const model = gltf.scene;
        const sourceBounds = new THREE.Box3().setFromObject(model);
        const sourceSize = sourceBounds.getSize(new THREE.Vector3());
        const maxDimension = Math.max(sourceSize.x, sourceSize.y, sourceSize.z, 0.001);
        const scale = 5 / maxDimension;
        model.scale.multiplyScalar(scale);
        model.updateMatrixWorld(true);
        const normalizedBounds = new THREE.Box3().setFromObject(model);
        const center = normalizedBounds.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y -= normalizedBounds.min.y - center.y;
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = true;
          child.receiveShadow = true;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          for (const material of materials) {
            if ("wireframe" in material) material.wireframe = wireframeRef.current;
          }
        });
        model.updateMatrixWorld(true);
        const helper = new THREE.Box3Helper(new THREE.Box3().setFromObject(model), new THREE.Color("#d8b56b"));
        modelRef.current = model;
        helperRef.current = helper;
        previewGroupRef.current.add(model, helper);
        setStats(collectStats(model));
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : "模型加载失败");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => {
    wireframeRef.current = wireframe;
    modelRef.current?.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) if ("wireframe" in material) material.wireframe = wireframe;
    });
  }, [wireframe]);

  return (
    <main className="asset-preview-shell">
      <header className="asset-preview-header">
        <div>
          <p className="eyebrow">TINGYUXUAN ASSET LAB</p>
          <h1>听雨轩资产预览</h1>
          <p>原件只读 · 自动归中仅影响预览 · 黄色线框为包围盒</p>
        </div>
        <Link href="/">返回项目首页</Link>
      </header>
      <section className="asset-preview-workspace">
        <aside className="asset-preview-panel">
          <label htmlFor="asset-select">选择模型</label>
          <select id="asset-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {catalog.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}
          </select>
          <label className="asset-preview-toggle"><input type="checkbox" checked={wireframe} onChange={(event) => setWireframe(event.target.checked)} /> 线框模式</label>
          {selected && (
            <>
              <dl className="asset-preview-stats">
                <div><dt>文件</dt><dd>{formatMb(selected.bytes)}</dd></div>
                <div><dt>原始尺寸</dt><dd>{formatVector(selected.bounds.size)} m/u</dd></div>
                <div><dt>网格</dt><dd>{stats?.meshes ?? selected.metrics.meshes}</dd></div>
                <div><dt>材质</dt><dd>{stats?.materials ?? selected.metrics.materials}</dd></div>
                <div><dt>纹理</dt><dd>{stats?.textures ?? selected.metrics.textures}</dd></div>
                <div><dt>约三角面</dt><dd>{(stats?.triangles ?? selected.metrics.trianglesApprox).toLocaleString()}</dd></div>
              </dl>
              <article className="asset-preview-note">
                <strong>{selected.previewMode === "compatibility-copy" ? "兼容转换预览" : "原始 GLB 预览"}</strong>
                <p>{selected.intendedUse}</p>
                {selected.extensionsRequired.length > 0 && <small>必需扩展：{selected.extensionsRequired.join(", ")}</small>}
              </article>
              <article className="asset-preview-license">
                <span>{selected.license}</span>
                <a href={selected.sourceUrl} target="_blank" rel="noreferrer">{selected.author}</a>
              </article>
            </>
          )}
        </aside>
        <div className="asset-preview-canvas-wrap">
          <canvas ref={canvasRef} aria-label="可旋转的三维资产预览" />
          {loading && <div className="asset-preview-message">正在载入模型…</div>}
          {error && <div className="asset-preview-message error">{error}</div>}
          <div className="asset-preview-controls">左键旋转 · 右键平移 · 滚轮缩放</div>
        </div>
      </section>
    </main>
  );
}
