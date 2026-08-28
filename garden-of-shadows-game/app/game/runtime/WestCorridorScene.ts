/**
 * LEGACY GREYBOX SCENE ONLY.
 *
 * This file is intentionally not imported by GameRuntime. Its procedural Box/Cylinder/Torus
 * architecture is retained only as historical greybox/reference code and must not be restored
 * as the formal visual layer. The production chapter scene is TingYuXuanScene.ts, which loads
 * audited Siheyuan/Courtyard Park geometry for the phase-one main route.
 */
import * as THREE from "three/webgpu";
import type { MemoryId, MemoryLayer } from "../types";

export interface SceneInteractable {
  id: string;
  label: string;
  position: THREE.Vector3;
  memoryIds: MemoryId[];
  kind: "contradiction" | "portal";
}

const disposeObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
};

export class WestCorridorScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(64, 16 / 9, 0.05, 120);
  readonly interactables: SceneInteractable[];
  private readonly wifeLayer = new THREE.Group();
  private readonly gardenerLayer = new THREE.Group();
  private readonly moonGateMaterial: THREE.MeshStandardMaterial;
  private readonly facelessOwner = new THREE.Group();
  private readonly memoryLight: THREE.PointLight;
  private readonly guidanceMarker = new THREE.Group();
  private rain: THREE.Points;
  private memory: MemoryId = "wife";
  private elapsed = 0;

  constructor(private readonly layers: MemoryLayer[], quality: "high" | "stable" | "low") {
    this.scene.background = new THREE.Color("#07100f");
    this.scene.fog = new THREE.FogExp2("#10201e", 0.032);
    this.camera.rotation.order = "YXZ";

    const ambient = new THREE.HemisphereLight("#8ab0a4", "#101613", 2.15);
    this.scene.add(ambient);
    this.memoryLight = new THREE.PointLight("#e2b677", 19, 19, 1.55);
    this.memoryLight.position.set(-2.4, 2.6, -8);
    this.memoryLight.castShadow = quality !== "low";
    this.scene.add(this.memoryLight);

    this.buildArchitecture(quality);
    this.buildMemoryLayers();
    this.moonGateMaterial = new THREE.MeshStandardMaterial({
      color: "#9d8a69",
      emissive: "#46351b",
      emissiveIntensity: 1.8,
      roughness: 0.45,
      metalness: 0.08,
    });
    this.buildMoonGate();
    this.buildFacelessOwner();
    this.rain = this.buildRain(quality === "high" ? 1800 : quality === "stable" ? 900 : 420);
    this.buildGuidanceMarker();
    this.scene.add(this.rain, this.wifeLayer, this.gardenerLayer, this.facelessOwner, this.guidanceMarker);
    this.facelessOwner.visible = false;
    this.guidanceMarker.visible = false;

    this.interactables = [
      {
        id: "waterline-direction",
        label: "勘验逆向水痕",
        position: new THREE.Vector3(-2.6, 1.1, -9),
        memoryIds: ["wife", "gardener"],
        kind: "contradiction",
      },
      {
        id: "corridor-count",
        label: "核对重复漏窗",
        position: new THREE.Vector3(2.5, 1.2, -22),
        memoryIds: ["wife", "gardener"],
        kind: "contradiction",
      },
      {
        id: "wife-moon-gate",
        label: "穿过夫人记忆里的月洞门",
        position: new THREE.Vector3(0, 1.2, -27),
        memoryIds: ["wife"],
        kind: "portal",
      },
    ];
  }

  private buildArchitecture(quality: "high" | "stable" | "low") {
    const wetStone = new THREE.MeshStandardMaterial({ color: "#202b29", roughness: 0.18, metalness: 0.22 });
    const plaster = new THREE.MeshStandardMaterial({ color: "#b6b2a1", roughness: 0.88 });
    const darkWood = new THREE.MeshStandardMaterial({ color: "#2a1510", roughness: 0.58 });
    const roofMat = new THREE.MeshStandardMaterial({ color: "#13211d", roughness: 0.72, metalness: 0.08 });

    const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.18, 36), wetStone);
    floor.position.set(0, -0.12, -11);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const pathMaterial = new THREE.MeshStandardMaterial({ color: "#31413b", emissive: "#0d211b", emissiveIntensity: 0.7, roughness: 0.32 });
    const path = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.025, 35.6), pathMaterial);
    path.position.set(0, -0.015, -11);
    this.scene.add(path);

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.2, 36), roofMat);
    ceiling.position.set(0, 3.35, -11);
    this.scene.add(ceiling);

    for (let z = 5; z >= -27; z -= 4) {
      for (const x of [-3.35, 3.35]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 3.2, quality === "low" ? 8 : 16), darkWood);
        pillar.position.set(x, 1.58, z);
        pillar.castShadow = quality !== "low";
        this.scene.add(pillar);
      }
      const beam = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.22, 0.24), darkWood);
      beam.position.set(0, 3.04, z);
      this.scene.add(beam);
    }

    for (const x of [-4.02, 4.02]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 36), plaster);
      wall.position.set(x, 1.22, -11);
      wall.receiveShadow = true;
      this.scene.add(wall);
    }

    for (let z = 3; z >= -25; z -= 4) {
      for (const x of [-3.93, 3.93]) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.25, 2.1), darkWood);
        frame.position.set(x, 1.35, z);
        this.scene.add(frame);
        for (let bar = -0.75; bar <= 0.75; bar += 0.5) {
          const lattice = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.05, 0.035), darkWood);
          lattice.position.set(x * 0.997, 1.35, z + bar);
          this.scene.add(lattice);
        }
      }
    }

    const lanternMaterial = new THREE.MeshStandardMaterial({ color: "#77351f", emissive: "#b75a2d", emissiveIntensity: 2.8 });
    for (const z of [1, -7, -15, -23]) {
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.5, 12), lanternMaterial);
      lantern.position.set(-2.8, 2.55, z);
      this.scene.add(lantern);
      const lanternLight = new THREE.PointLight("#d98a43", quality === "low" ? 4.5 : 8, 7, 1.9);
      lanternLight.position.set(-2.55, 2.35, z);
      this.scene.add(lanternLight);
    }
  }

  private buildGuidanceMarker() {
    const ringMaterial = new THREE.MeshBasicMaterial({ color: "#dfbd70", transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false });
    const outer = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.49, 40), ringMaterial);
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = 0.04;
    const inner = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 32), ringMaterial.clone());
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.055;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.12, 1.55, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: "#e4c67e", transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide }),
    );
    beam.position.y = 0.78;
    this.guidanceMarker.add(outer, inner, beam);
  }

  private buildMemoryLayers() {
    const dryChannelMat = new THREE.MeshStandardMaterial({ color: "#4b4034", roughness: 0.82 });
    const dryChannel = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 15), dryChannelMat);
    dryChannel.position.set(-2.65, 0.03, -11);
    this.wifeLayer.add(dryChannel);

    const nameSlip = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.02, 0.78),
      new THREE.MeshStandardMaterial({ color: "#b49d72", emissive: "#493413", emissiveIntensity: 1.1 }),
    );
    nameSlip.rotation.x = -Math.PI / 2;
    nameSlip.position.set(-2.55, 0.1, -8.6);
    this.wifeLayer.add(nameSlip);

    const water = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.045, 16),
      new THREE.MeshStandardMaterial({ color: "#0c413b", emissive: "#082820", emissiveIntensity: 1.6, roughness: 0.08, metalness: 0.25 }),
    );
    water.position.set(-2.65, 0.04, -11.5);
    this.gardenerLayer.add(water);

    const arrows = new THREE.MeshStandardMaterial({ color: "#6fb49b", emissive: "#2c725d", emissiveIntensity: 2.5 });
    for (let z = -5; z >= -17; z -= 3) {
      const marker = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.45, 5), arrows);
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(-2.64, 0.13, z);
      this.gardenerLayer.add(marker);
    }

    for (let repeat = 0; repeat < 3; repeat += 1) {
      const glyph = new THREE.Mesh(
        new THREE.RingGeometry(0.22, 0.27, 24),
        new THREE.MeshBasicMaterial({ color: "#729a83", transparent: true, opacity: 0.72, side: THREE.DoubleSide }),
      );
      glyph.position.set(3.88, 1.35, -20 - repeat * 2.1);
      glyph.rotation.y = -Math.PI / 2;
      this.gardenerLayer.add(glyph);
    }
  }

  private buildMoonGate() {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(8, 3.4, 0.35),
      new THREE.MeshStandardMaterial({ color: "#aaa894", roughness: 0.9 }),
    );
    wall.position.set(0, 1.55, -28.2);
    this.scene.add(wall);

    const gate = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.18, 18, 56), this.moonGateMaterial);
    gate.position.set(0, 1.42, -27.95);
    this.scene.add(gate);

    const darkness = new THREE.Mesh(
      new THREE.CircleGeometry(1.28, 48),
      new THREE.MeshBasicMaterial({ color: "#020504", transparent: true, opacity: 0.78, side: THREE.DoubleSide }),
    );
    darkness.position.set(0, 1.42, -27.75);
    this.scene.add(darkness);
  }

  private buildFacelessOwner() {
    const robe = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.36, 1.05, 6, 14),
      new THREE.MeshStandardMaterial({ color: "#070807", roughness: 0.92 }),
    );
    robe.position.y = 0.85;
    const face = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 18, 12),
      new THREE.MeshStandardMaterial({ color: "#d0c9ae", roughness: 0.55, emissive: "#332d23", emissiveIntensity: 0.4 }),
    );
    face.scale.set(0.75, 1, 0.55);
    face.position.y = 1.75;
    this.facelessOwner.add(robe, face);
  }

  private buildRain(count: number) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 12;
      positions[index * 3 + 1] = Math.random() * 7;
      positions[index * 3 + 2] = 8 - Math.random() * 40;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ color: "#9bb8b7", size: 0.035, transparent: true, opacity: 0.46, depthWrite: false }),
    );
  }

  setMemory(memory: MemoryId) {
    this.memory = memory;
    const layer = this.layers.find((item) => item.id === memory) ?? this.layers[0];
    this.wifeLayer.visible = memory === "wife";
    this.gardenerLayer.visible = memory === "gardener";
    this.scene.background = new THREE.Color(layer.visual.fog);
    this.scene.fog = new THREE.FogExp2(layer.visual.fog, memory === "gardener" ? 0.046 : 0.032);
    this.memoryLight.color.set(layer.visual.keyLight);
    this.memoryLight.intensity = memory === "gardener" ? 14 : 19;
    this.moonGateMaterial.emissive.set(memory === "wife" ? "#72501e" : "#07100b");
    this.moonGateMaterial.emissiveIntensity = memory === "wife" ? 2.8 : 0.15;
  }

  setOwnerVisible(visible: boolean, position?: THREE.Vector3) {
    this.facelessOwner.visible = visible;
    if (position) this.facelessOwner.position.copy(position);
  }

  setGuidanceTarget(position?: THREE.Vector3) {
    this.guidanceMarker.visible = Boolean(position);
    if (position) this.guidanceMarker.position.set(position.x, 0, position.z);
  }

  update(delta: number, player: THREE.Vector3, chasing: boolean) {
    this.elapsed += delta;
    const positions = this.rain.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let index = 0; index < positions.count; index += 1) {
      let y = positions.getY(index) - delta * 8;
      if (y < 0) y = 5.5 + Math.random() * 2;
      positions.setY(index, y);
    }
    positions.needsUpdate = true;

    if (this.guidanceMarker.visible) {
      const pulse = 1 + Math.sin(this.elapsed * 3.2) * 0.08;
      this.guidanceMarker.scale.set(pulse, 1, pulse);
      this.guidanceMarker.rotation.y = this.elapsed * 0.35;
    }

    if (chasing) {
      this.facelessOwner.visible = true;
      const target = player.clone();
      target.y = 0;
      const direction = target.sub(this.facelessOwner.position);
      const distance = direction.length();
      if (distance > 0.01) this.facelessOwner.position.add(direction.normalize().multiplyScalar(delta * 2.35));
      this.facelessOwner.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  ownerDistance(player: THREE.Vector3) {
    return this.facelessOwner.position.distanceTo(player);
  }

  activeMemory() {
    return this.memory;
  }

  dispose() {
    disposeObject(this.scene);
  }
}
