"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three/webgpu";
import { BorrowAnchorController } from "../../game/mechanics/BorrowAnchorController";
import { BorrowedViewPortal } from "../../game/mechanics/BorrowedViewPortal";
import { CameraRig } from "../../game/mechanics/CameraRig";
import { CognitionController } from "../../game/mechanics/CognitionController";
import { EvidenceLedger } from "../../game/mechanics/EvidenceLedger";
import { InteractionController } from "../../game/mechanics/InteractionController";
import { LoopController, type LoopLink } from "../../game/mechanics/LoopController";
import { NarrativeGateController } from "../../game/mechanics/NarrativeGateController";
import { PlayerPhysics, type PhysicsBoxDefinition } from "../../game/mechanics/PlayerPhysics";
import { PuzzleController } from "../../game/mechanics/PuzzleController";
import {
  playgroundBorrowables,
  playgroundCognitionObjects,
  playgroundEvidence,
  playgroundGates,
  playgroundPuzzles,
} from "../../game/mechanics/playground-content";
import { createDefaultMechanicSaveState, type CognitionId, type MechanicSaveState } from "../../game/mechanics/types";
import { createRenderer } from "../../game/runtime/RendererAdapter";
import { PLAYER_MOVEMENT_CALIBRATION } from "../../game/runtime/player-calibration";

const PLAYGROUND_SAVE_KEY = "garden-of-shadows.mechanics-playground.v1";

interface PlaygroundHud {
  cognition: "wife" | "gardener";
  cameraMode: "exploration" | "investigation";
  backend: string;
  prompt?: string;
  message: string;
  objective: string;
  borrowed?: string;
  anchored: boolean;
  anchorVerified: boolean;
  puzzleState: string;
  evidenceCount: number;
  gateUnlocked: boolean;
  portalCount: number;
  fps: number;
  position: string;
}

interface RuntimeActions {
  switchCognition(): void;
  toggleInvestigation(): void;
  interact(): void;
  reset(): void;
}

interface MechanicsDebugApi {
  teleport(x: number, y: number, z: number): void;
  setView(yaw: number, pitch: number): void;
  focus(): string | undefined;
  interact(): boolean;
  state(): {
    cognition: "wife" | "gardener";
    borrowedObjectId?: string;
    anchoredObjectId?: string;
    evidenceIds: string[];
    gateUnlocked: boolean;
  };
}

const initialHud: PlaygroundHud = {
  cognition: "wife",
  cameraMode: "exploration",
  backend: "initializing",
  message: "先透过月洞门观察另一认知，再走近两侧结构尝试借出。",
  objective: "先看月洞门里的另一种空间，再切到老周认知，沿右侧路走到尽头。",
  anchored: false,
  anchorVerified: false,
  puzzleState: "looping",
  evidenceCount: 0,
  gateUnlocked: false,
  portalCount: 0,
  fps: 0,
  position: "0.0, 0.9, 7.0",
};

const safeLoad = (): MechanicSaveState | undefined => {
  try {
    const raw = window.localStorage.getItem(PLAYGROUND_SAVE_KEY);
    if (!raw) return undefined;
    const candidate = JSON.parse(raw) as Partial<MechanicSaveState>;
    if (!candidate.currentCognition || !candidate.anchorSlot) return undefined;
    return { ...createDefaultMechanicSaveState(), ...candidate } as MechanicSaveState;
  } catch {
    return undefined;
  }
};

const makeBox = (
  size: [number, number, number],
  position: [number, number, number],
  color: THREE.ColorRepresentation,
  roughness = 0.72,
) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 }),
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const buildMoonGate = (surface: THREE.Mesh) => {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: "#d8d0bd", roughness: 0.86 });
  const part = (size: [number, number, number], position: [number, number, number]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  };
  part([1.8, 3.8, 0.38], [-2.15, 1.9, 0]);
  part([1.8, 3.8, 0.38], [2.15, 1.9, 0]);
  part([2.7, 0.8, 0.38], [0, 3.42, 0]);
  part([2.7, 0.42, 0.38], [0, 0.2, 0]);
  surface.position.set(0, 1.82, -0.03);
  group.add(surface);
  group.position.set(0, 0, 2.2);
  return group;
};

const physicsBoxes: PhysicsBoxDefinition[] = [
  { id: "near-ground", center: [0, -0.22, 4], halfExtents: [7, 0.22, 5] },
  { id: "far-ground", center: [0, -0.22, -7], halfExtents: [7, 0.22, 2] },
  { id: "west-wall", center: [-7.1, 1.5, 0], halfExtents: [0.15, 1.5, 9] },
  { id: "east-wall", center: [7.1, 1.5, 0], halfExtents: [0.15, 1.5, 9] },
  { id: "north-wall", center: [0, 1.5, -9.1], halfExtents: [7, 1.5, 0.15] },
  { id: "wife-door", center: [0, 1.2, 0.65], halfExtents: [0.8, 1.2, 0.16], cognitionIds: ["wife"] },
  { id: "gardener-route", center: [5, -0.08, -3], halfExtents: [0.8, 0.12, 4], cognitionIds: ["gardener"] },
  { id: "source-bridge", center: [1, 0.12, 0.1], halfExtents: [0.55, 0.12, 0.65], cognitionIds: ["gardener"] },
  { id: "source-slab", center: [-1, 0.12, 0.1], halfExtents: [0.55, 0.12, 0.65], cognitionIds: ["wife"] },
  { id: "rockery-loop-sensor", center: [5, 1, -6.5], halfExtents: [0.75, 1.3, 0.55], cognitionIds: ["gardener"], sensor: true },
];

const loopLink: LoopLink = {
  id: "rockery-loop",
  entrySensorId: "rockery-loop-sensor",
  exitAnchorId: "loop-lantern",
  entryYaw: 0,
  exitYaw: 0,
  preserveYaw: true,
  preserveVelocityIntent: true,
  cooldownMs: 1400,
};

export function MechanicsPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const actionsRef = useRef<RuntimeActions | undefined>(undefined);
  const [hud, setHud] = useState(initialHud);
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let disposeRuntime: (() => void) | undefined;

    const start = async () => {
      const saved = safeLoad();
      const initialCognition: "wife" | "gardener" = saved?.currentCognition === "gardener" ? "gardener" : "wife";
      const rendererPreference = new URLSearchParams(window.location.search).get("renderer");
      const forceWebGL = navigator.webdriver || rendererPreference === "webgl";
      const rendererHandle = await createRenderer(canvas, { forceWebGL, quality: "high" });
      if (cancelled) {
        rendererHandle.dispose();
        return;
      }

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#0b1415");
      scene.fog = new THREE.FogExp2("#142021", 0.035);
      const camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.05, 100);
      const physics = await PlayerPhysics.create({ x: 0, y: 0.9, z: 7 }, physicsBoxes);
      const cameraRig = new CameraRig(camera, canvas, physics, { explorationDistance: 4.6, shoulderOffset: 0.48 });
      const interactions = new InteractionController();
      const loop = new LoopController();
      const puzzle = new PuzzleController(playgroundPuzzles, saved);
      const evidence = new EvidenceLedger(playgroundEvidence, saved);
      const gates = new NarrativeGateController(playgroundGates, saved);
      const keys = new Set<string>();
      const objectMeshes = new Map<string, THREE.Object3D>();
      const borrowedLayer = new THREE.Group();
      borrowedLayer.name = "anchoredLayer";
      scene.add(borrowedLayer);

      const ambient = new THREE.HemisphereLight("#a9c6c6", "#17201d", 1.35);
      const keyLight = new THREE.DirectionalLight("#efd6aa", 4.2);
      keyLight.position.set(-4, 9, 7);
      keyLight.castShadow = true;
      scene.add(ambient, keyLight);

      const nearGround = makeBox([14, 0.4, 10], [0, -0.22, 4], "#30403b");
      const farGround = makeBox([14, 0.4, 4], [0, -0.22, -7], "#273733");
      const sideBanks = [
        makeBox([4.2, 0.42, 4], [-4.9, -0.23, -3], "#1e2b28"),
        makeBox([4.2, 0.42, 4], [4.9, -0.23, -3], "#1e2b28"),
      ];
      scene.add(nearGround, farGround, ...sideBanks);

      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(9.6, 4),
        new THREE.MeshStandardMaterial({ color: "#102e35", roughness: 0.26, metalness: 0.2, transparent: true, opacity: 0.88 }),
      );
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, -0.38, -3);
      scene.add(water);

      const wallMaterial = new THREE.MeshStandardMaterial({ color: "#c6c0ad", roughness: 0.92 });
      const walls = [
        new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 18), wallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 18), wallMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(14, 3, 0.3), wallMaterial),
      ];
      walls[0].position.set(-7.1, 1.5, 0);
      walls[1].position.set(7.1, 1.5, 0);
      walls[2].position.set(0, 1.5, -9.1);
      walls.forEach((wall) => { wall.castShadow = true; wall.receiveShadow = true; scene.add(wall); });

      const wifeDoor = makeBox([1.6, 2.4, 0.3], [0, 1.2, 0.65], "#774c34", 0.65);
      wifeDoor.name = "wife-door";
      scene.add(wifeDoor);
      objectMeshes.set("wife-door", wifeDoor);

      const gardenerRoute = makeBox([1.6, 0.24, 8], [5, -0.08, -3], "#5c6d59", 0.94);
      gardenerRoute.name = "gardener-route";
      scene.add(gardenerRoute);
      objectMeshes.set("gardener-route", gardenerRoute);

      const sourceBridge = makeBox([1.1, 0.24, 1.3], [1, 0.12, 0.1], "#7c6548");
      sourceBridge.name = "source-bridge";
      scene.add(sourceBridge);
      objectMeshes.set("source-bridge", sourceBridge);

      const sourceSlab = makeBox([1.1, 0.24, 1.3], [-1, 0.12, 0.1], "#727b75", 0.98);
      sourceSlab.name = "source-slab";
      scene.add(sourceSlab);
      objectMeshes.set("source-slab", sourceSlab);

      const anchor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.52, 1.15, 8),
        new THREE.MeshStandardMaterial({ color: "#b88a42", emissive: "#5d3510", emissiveIntensity: 0.8, roughness: 0.5 }),
      );
      anchor.position.set(0, 0.57, -0.35);
      anchor.castShadow = true;
      scene.add(anchor);

      const footprints = new THREE.Group();
      for (let index = 0; index < 6; index += 1) {
        const print = new THREE.Mesh(
          new THREE.PlaneGeometry(0.2, 0.44),
          new THREE.MeshBasicMaterial({ color: "#86a19a", transparent: true, opacity: 0.72, side: THREE.DoubleSide }),
        );
        print.rotation.x = -Math.PI / 2;
        print.rotation.z = index % 2 ? 0.16 : -0.16;
        print.position.set((index % 2 ? 0.16 : -0.16), 0.012, -7.7 + index * 0.32);
        footprints.add(print);
      }
      scene.add(footprints);

      const lantern = new THREE.Group();
      lantern.add(makeBox([0.16, 2.3, 0.16], [0, 1.15, 0], "#48362b"));
      const lanternGlow = makeBox([0.55, 0.65, 0.55], [0, 2.2, 0], "#e1aa58", 0.4);
      (lanternGlow.material as THREE.MeshStandardMaterial).emissive.set("#a65f1f");
      (lanternGlow.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.1;
      lantern.add(lanternGlow);
      lantern.position.set(5.8, 0, 0.55);
      scene.add(lantern);

      const portalSurface = new THREE.Mesh(
        new THREE.PlaneGeometry(2.7, 3.1),
        new THREE.MeshBasicMaterial({ color: "#b9d2ca", side: THREE.DoubleSide }),
      );
      const moonGate = buildMoonGate(portalSurface);
      scene.add(moonGate);
      const portal = new BorrowedViewPortal({ id: "moon-gate-view", surface: portalSurface, resolution: 320, maxDistance: 13 });

      const avatar = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.32, 1.1, 6, 12),
        new THREE.MeshStandardMaterial({ color: "#2d3c3b", roughness: 0.8 }),
      );
      body.position.y = 0.9;
      body.castShadow = true;
      const shoulder = makeBox([0.72, 0.18, 0.28], [0, 1.42, 0], "#9f8667");
      avatar.add(body, shoulder);
      avatar.position.set(0, 0, 7);
      scene.add(avatar);

      let cognition: "wife" | "gardener" = initialCognition;
      let avatarYaw = 0;
      let viewYaw = 0;
      let viewPitch = 0;
      let dragging = false;
      let borrowedRuntime: THREE.Mesh | undefined;
      let activePrompt = "";
      let message = initialHud.message;
      let anchorVerified = puzzle.state("break-rockery-loop").tokens.includes("anchor.verified");
      let lastFrame = performance.now();
      let frameWindow = performance.now();
      let frames = 0;
      let fps = 0;

      const applyVisualCognition = (target: CognitionId) => {
        playgroundCognitionObjects.forEach((definition) => {
          const state = { visible: true, ...definition.defaultState, ...definition.states[target] };
          const mesh = objectMeshes.get(definition.id);
          if (mesh) mesh.visible = state.visible !== false && borrow.borrowedObject?.borrowedObjectId !== definition.id;
        });
      };

      const saveAndRefresh = () => {
        const puzzleState = puzzle.state("break-rockery-loop");
        const objective = gates.has("CH2_FIFTH_PERSON_CONFIRMED")
          ? "演示完成：你已经用空间变化、实体借出与夹院脚印完成一次认知重构闭环。"
          : !evidence.has("loop-landmark")
            ? "先看月洞门里的另一种空间，再切到老周认知，沿右侧路走到尽头。"
            : !borrow.borrowedObject
              ? "回到可借结构旁：老周认知借桥段，夫人认知借石板。两种解法都成立。"
              : !borrow.anchorSlot.borrowedObjectId
                ? "借出的结构还不稳定。走近水边中央锚点，按 F 把它锚定。"
                : !anchorVerified
                  ? "现在按 Q 切换认知：验证锚定结构是否真的跨认知保留。"
                  : !evidence.has("wet-footprint")
                    ? "结构已经跨认知保留。亲自走过水面，到对岸调查湿脚印。"
                    : "三条事实已经到手；继续观察它们如何汇合成新的叙事判断。";
        const mechanicSave: MechanicSaveState = {
          ...createDefaultMechanicSaveState(),
          currentCognition: cognition,
          ...evidence.serialize(),
          ...puzzle.serialize(),
          ...gates.serialize(),
          ...borrow.serialize(),
          chapterBeat: gates.has("CH2_FIFTH_PERSON_CONFIRMED") ? "beat.fifth-person" : undefined,
          safeAnchorId: "playground-spawn",
        };
        window.localStorage.setItem(PLAYGROUND_SAVE_KEY, JSON.stringify(mechanicSave));
        const pose = physics.pose();
        setHud((current) => ({
          ...current,
          cognition,
          cameraMode: cameraRig.mode,
          backend: rendererHandle.backend,
          prompt: activePrompt || undefined,
          message,
          objective,
          borrowed: borrow.borrowedObject?.runtimePrefabId,
          anchored: Boolean(borrow.anchorSlot.borrowedObjectId),
          anchorVerified,
          puzzleState: puzzleState.worldStateId ?? "looping",
          evidenceCount: evidence.discoveredDefinitions().length,
          gateUnlocked: gates.has("CH2_FIFTH_PERSON_CONFIRMED"),
          portalCount: portal.active ? 1 : 0,
          fps,
          position: `${pose.x.toFixed(1)}, ${pose.y.toFixed(1)}, ${pose.z.toFixed(1)}`,
        }));
      };

      const evaluateEvidenceGate = () => {
        const discovered = evidence.discoveredDefinitions();
        const evidenceKeys = new Set(discovered.map((item) => `evidence.${item.id}`));
        const unlocked = gates.evaluate({ keys: evidenceKeys, discoveredEvidence: discovered });
        if (unlocked.length) {
          evidence.unlockAvailable(new Set(unlocked.map((gate) => gate.unlockBeat)));
          message = "三个独立证据通道已闭合：第五人确实存在。系统没有替你指定这个人是谁。";
        }
      };

      const borrow = new BorrowAnchorController(playgroundBorrowables, {
        createBorrowedObject(state) {
          if (borrowedRuntime) borrowedLayer.remove(borrowedRuntime);
          physics.remove("borrowed-runtime");
          const bridge = state.runtimePrefabId === "bridge-segment";
          borrowedRuntime = makeBox(
            bridge ? [1.5, 0.24, 4] : [1.8, 0.24, 4],
            [0, 0.02, -3],
            bridge ? "#987653" : "#78837e",
          );
          const material = borrowedRuntime.material as THREE.MeshStandardMaterial;
          material.transparent = true;
          material.opacity = 0.68;
          borrowedLayer.add(borrowedRuntime);
          physics.addBox({ id: "borrowed-runtime", center: [0, -0.02, -3], halfExtents: bridge ? [0.75, 0.12, 2] : [0.9, 0.12, 2] });
        },
        destroyBorrowedObject() {
          if (borrowedRuntime) borrowedLayer.remove(borrowedRuntime);
          borrowedRuntime?.geometry.dispose();
          (borrowedRuntime?.material as THREE.Material | undefined)?.dispose();
          borrowedRuntime = undefined;
          physics.remove("borrowed-runtime");
        },
        setBorrowedObjectAnchored(_id, anchoredState) {
          if (!borrowedRuntime) return;
          const material = borrowedRuntime.material as THREE.MeshStandardMaterial;
          material.opacity = anchoredState ? 1 : 0.68;
          material.emissive.set(anchoredState ? "#3d2a13" : "#000000");
          material.emissiveIntensity = anchoredState ? 0.45 : 0;
        },
      });

      const cognitionController = new CognitionController(cognition, playgroundCognitionObjects, {
        applyObjectState(objectId, state) {
          const mesh = objectMeshes.get(objectId);
          if (!mesh) return;
          mesh.visible = state.visible !== false && borrow.borrowedObject?.borrowedObjectId !== objectId;
          if (state.position) mesh.position.set(...state.position);
          if (state.rotation) mesh.rotation.set(...state.rotation);
          if (state.scale) mesh.scale.set(...state.scale);
        },
        applyColliderState(objectId, enabled) {
          physics.setColliderEnabled(objectId, enabled);
        },
        applyInteractionState(objectId, enabled) {
          interactions.setEnabled(objectId, enabled);
        },
        applyLightPreset(preset) {
          const gardener = preset?.includes("gardener");
          keyLight.color.set(gardener ? "#9cb9b0" : "#efd6aa");
          ambient.color.set(gardener ? "#87aaa7" : "#a9c6c6");
        },
      });
      physics.setCognition(cognition);

      const registerBorrowable = (id: "source-bridge" | "source-slab", mesh: THREE.Object3D) => interactions.register({
        id,
        type: "borrow",
        label: id === "source-bridge" ? "借出园丁认知中的桥段" : "借出夫人认知中的石板",
        maxDistance: 5.2,
        onInteract() {
          try {
            borrow.borrow(id, cognition, "gap-anchor");
            puzzle.recordToken("break-rockery-loop", id === "source-bridge" ? "bridge.borrowed" : "slab.borrowed");
            evidence.discover("borrowed-structure");
            evidence.unlockAvailable(new Set());
            applyVisualCognition(cognition);
            message = "结构已经借到水面缺口，但尚未锚定；现在切换认知会失去它。";
            evaluateEvidenceGate();
            saveAndRefresh();
          } catch (reason) {
            message = reason instanceof Error ? reason.message : "无法借出";
          }
        },
      }, mesh);
      registerBorrowable("source-bridge", sourceBridge);
      registerBorrowable("source-slab", sourceSlab);

      interactions.register({
        id: "gap-anchor",
        type: "anchor",
        label: "锚定借出的结构（单槽）",
        maxDistance: 5.2,
        enabledWhen: () => Boolean(borrow.borrowedObject && !borrow.anchorSlot.borrowedObjectId),
        onInteract() {
          try {
            borrow.anchor();
            puzzle.recordToken("break-rockery-loop", "object.anchored");
            message = "锚定完成。切换认知后结构与碰撞都会保留。";
            saveAndRefresh();
          } catch (reason) {
            message = reason instanceof Error ? reason.message : "无法锚定";
          }
        },
      }, anchor);

      interactions.register({
        id: "wet-footprint",
        type: "evidence",
        label: "勘验夹院湿脚印",
        maxDistance: 5.5,
        onInteract() {
          evidence.discover("wet-footprint");
          evidence.unlockAvailable(new Set());
          message = evidence.definition("wet-footprint").observableFacts[0];
          evaluateEvidenceGate();
          saveAndRefresh();
        },
      }, footprints);

      interactions.register({
        id: "wife-door-interaction",
        type: "door",
        label: "检查认知门状态",
        maxDistance: 5.2,
        enabledWhen: () => cognition === "wife",
        onInteract() {
          message = "门在夫人认知中封闭；切换后墙体、门与碰撞会一起消失。";
          saveAndRefresh();
        },
      }, wifeDoor);

      if (saved) borrow.restore(saved);
      applyVisualCognition(cognition);

      const switchCognition = () => {
        const hadAnchoredObject = Boolean(borrow.anchorSlot.borrowedObjectId);
        borrow.onCognitionSwitch();
        cognition = cognition === "wife" ? "gardener" : "wife";
        physics.setCognition(cognition);
        cognitionController.setCognition(cognition);
        if (hadAnchoredObject && borrow.anchorSlot.borrowedObjectId) {
          anchorVerified = true;
          puzzle.recordToken("break-rockery-loop", "anchor.verified");
          message = cognition === "wife"
            ? "你已经切到夫人认知，但刚才锚定的结构没有消失——它现在同时属于这个现实。"
            : "你已经切到老周认知，但刚才锚定的结构仍然存在，而且碰撞仍然有效。";
        } else {
          message = cognition === "wife"
            ? "夫人认知：门与石板存在，侧路和木桥消失。"
            : "园丁认知：侧路形成，尽头仍会回到方灯。";
        }
        saveAndRefresh();
      };

      const toggleInvestigation = () => {
        const pose = physics.pose();
        const player = new THREE.Vector3(pose.x, pose.y, pose.z);
        if (cameraRig.mode === "exploration") {
          void cameraRig.enterInvestigation(player, viewYaw, viewPitch);
          avatar.visible = false;
          message = "调查模式：中心射线只检测交互层。按 E 返回第三人称。";
        } else {
          void cameraRig.exitInvestigation(player, viewYaw);
          avatar.visible = true;
          message = "已回到第三人称，角色朝向与动画状态未重置。";
        }
        saveAndRefresh();
      };

      const reset = () => {
        window.localStorage.removeItem(PLAYGROUND_SAVE_KEY);
        borrow.reset();
        puzzle.reset("break-rockery-loop", "manual");
        loop.reset();
        anchorVerified = false;
        cognition = "wife";
        physics.setCognition(cognition);
        cognitionController.reset(cognition);
        physics.teleport({ x: 0, y: 0.9, z: 7 });
        avatar.position.set(0, 0, 7);
        message = "灰盒已重置：一个 Anchor Slot，所有运行时结构均已回收。";
        saveAndRefresh();
      };

      actionsRef.current = {
        switchCognition,
        toggleInvestigation,
        interact: () => { if (!interactions.interact()) { message = "中心视线没有可交互目标。"; saveAndRefresh(); } },
        reset,
      };

      const debugWindow = window as typeof window & { __gardenMechanics?: MechanicsDebugApi };
      const debugApi: MechanicsDebugApi = {
        teleport(x, y, z) {
          physics.teleport({ x, y, z });
          avatar.position.set(x, 0, z);
          saveAndRefresh();
        },
        setView(yaw, pitch) {
          viewYaw = yaw;
          viewPitch = THREE.MathUtils.clamp(pitch, -1.2, 0.85);
          if (cameraRig.mode === "investigation") {
            const pose = physics.pose();
            void cameraRig.syncInvestigation(new THREE.Vector3(pose.x, pose.y, pose.z), viewYaw, viewPitch, false);
          }
        },
        focus: () => interactions.focus(camera)?.definition.id,
        interact() {
          const didInteract = interactions.interact();
          if (!didInteract) {
            message = "中心视线没有可交互目标。";
            saveAndRefresh();
          }
          return didInteract;
        },
        state: () => ({
          cognition,
          borrowedObjectId: borrow.borrowedObject?.borrowedObjectId,
          anchoredObjectId: borrow.anchorSlot.borrowedObjectId ?? undefined,
          evidenceIds: evidence.discoveredDefinitions().map((item) => item.id),
          gateUnlocked: gates.has("CH2_FIFTH_PERSON_CONFIRMED"),
        }),
      };
      debugWindow.__gardenMechanics = debugApi;

      const onKeyDown = (event: KeyboardEvent) => {
        keys.add(event.code);
        if (event.repeat) return;
        if (event.code === "KeyQ") switchCognition();
        if (event.code === "KeyE") toggleInvestigation();
        if (event.code === "KeyF") actionsRef.current?.interact();
        if (event.code === "Space") physics.requestJump();
        if (event.code === "KeyR") reset();
      };
      const onKeyUp = (event: KeyboardEvent) => keys.delete(event.code);
      const onPointerDown = (event: PointerEvent) => {
        dragging = true;
        canvas.setPointerCapture(event.pointerId);
      };
      const onPointerUp = (event: PointerEvent) => {
        dragging = false;
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      };
      const onPointerMove = (event: PointerEvent) => {
        if (!dragging) return;
        const yawDelta = -event.movementX * 0.004;
        viewYaw += yawDelta;
        if (cameraRig.mode === "exploration") {
          cameraRig.rotate(yawDelta, -event.movementY * 0.003);
        } else {
          viewPitch = THREE.MathUtils.clamp(viewPitch - event.movementY * 0.003, -1.2, 0.85);
        }
      };
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("pointermove", onPointerMove);

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        camera.aspect = rect.width / Math.max(1, rect.height);
        camera.updateProjectionMatrix();
        rendererHandle.resize(rect.width, rect.height, window.devicePixelRatio);
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);

      rendererHandle.renderer.setAnimationLoop((now) => {
        const delta = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
        lastFrame = now;
        let pose = physics.pose();
        const forward = Number(keys.has("KeyW")) - Number(keys.has("KeyS"));
        const strafe = Number(keys.has("KeyD")) - Number(keys.has("KeyA"));
        if (cameraRig.mode === "exploration") {
          const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? PLAYER_MOVEMENT_CALIBRATION.fastWalkSpeed : PLAYER_MOVEMENT_CALIBRATION.walkSpeed;
          const length = Math.hypot(forward, strafe) || 1;
          const sin = Math.sin(viewYaw);
          const cos = Math.cos(viewYaw);
          const x = ((forward / length) * -sin + (strafe / length) * cos) * speed * delta;
          const z = ((forward / length) * -cos - (strafe / length) * sin) * speed * delta;
          pose = physics.move({ x, y: 0, z }, delta);
          if (forward || strafe) avatarYaw = Math.atan2(-x, -z);
          avatar.rotation.y = avatarYaw;
          body.position.y = 0.9 + ((forward || strafe) ? Math.sin(now * 0.012) * 0.025 : 0);
        } else {
          pose = physics.move({ x: 0, y: 0, z: 0 }, delta);
        }
        avatar.position.set(pose.x, 0, pose.z);

        if (physics.sensorContains(loopLink.entrySensorId, pose)) {
          const traversed = loop.traverse(
            loopLink,
            { position: [pose.x, pose.y, pose.z], yaw: viewYaw, velocityIntent: [0, 0, -1] },
            [5, 0.9, 0.55],
            now,
          );
          if (traversed) {
            physics.teleport({ x: traversed.position[0], y: traversed.position[1], z: traversed.position[2] });
            viewYaw = traversed.yaw;
            evidence.discover("loop-landmark");
            evidence.unlockAvailable(new Set());
            puzzle.recordToken("break-rockery-loop", "loop.seen");
            message = "雨声没有中断，但你重新看见了同一盏方灯。侧路发生了回环。";
            evaluateEvidenceGate();
            saveAndRefresh();
          }
        }

        if (pose.y < -3) {
          physics.teleport({ x: 0, y: 0.9, z: 7 });
          message = "已恢复到最近 SafeAnchor。";
        }

        const player = new THREE.Vector3(pose.x, pose.y, pose.z);
        if (cameraRig.mode === "exploration") void cameraRig.syncExploration(player, avatarYaw, false);
        else void cameraRig.syncInvestigation(player, viewYaw, viewPitch, false);
        cameraRig.update(delta);
        const focus = interactions.focus(camera);
        const nextPrompt = focus ? `[F] ${focus.definition.label}` : "";
        if (nextPrompt !== activePrompt) {
          activePrompt = nextPrompt;
          saveAndRefresh();
        }

        const targetCognition = cognition === "wife" ? "gardener" : "wife";
        portal.render(rendererHandle.renderer, scene, camera, targetCognition, applyVisualCognition, () => applyVisualCognition(cognition));
        rendererHandle.renderer.render(scene, camera);

        frames += 1;
        if (now - frameWindow > 500) {
          fps = frames * 1000 / (now - frameWindow);
          frames = 0;
          frameWindow = now;
          saveAndRefresh();
        }
      });

      saveAndRefresh();
      disposeRuntime = () => {
        if (debugWindow.__gardenMechanics === debugApi) {
          delete debugWindow.__gardenMechanics;
        }
        rendererHandle.renderer.setAnimationLoop(null);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
        resizeObserver.disconnect();
        portal.dispose();
        cameraRig.dispose();
        physics.dispose();
        const geometries = new Set<THREE.BufferGeometry>();
        const materials = new Set<THREE.Material>();
        scene.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          geometries.add(object.geometry);
          const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
          meshMaterials.forEach((material) => materials.add(material));
        });
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
        rendererHandle.dispose();
      };
    };

    void start().catch((reason) => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : "Mechanics runtime failed to initialize");
    });
    return () => {
      cancelled = true;
      actionsRef.current = undefined;
      disposeRuntime?.();
    };
  }, []);

  return (
    <main className="mechanics-shell">
      <header className="mechanics-header">
        <Link href="/">← 返回案卷</Link>
        <div><span>PHASE 2 · CORE MECHANIC PLAYGROUND</span><strong>听雨轩机制灰盒</strong></div>
        <em>{hud.backend.toUpperCase()}</em>
      </header>
      <section className="mechanics-stage">
        <canvas ref={canvasRef} aria-label="认知重构机制灰盒" />
        <div className="mechanics-crosshair" aria-hidden="true"><i /><i /></div>
        <aside className="mechanics-status">
          <span>当前认知</span><strong>{hud.cognition === "wife" ? "沈夫人 · 家庭空间" : "老周 · 路线空间"}</strong>
          <small>相机：{hud.cameraMode === "exploration" ? "第三人称探索" : "第一人称调查"}</small>
        </aside>
        <aside className="mechanics-objective">
          <span>当前目标</span>
          <strong>{hud.objective}</strong>
          <small>{hud.anchorVerified ? "跨认知验证 ✓" : hud.anchored ? "下一步：验证锚定" : "不要找正确答案，先让空间自己证明差异。"}</small>
        </aside>
        <aside className="mechanics-debug">
          <b>DEV TELEMETRY</b>
          <span>Portal {hud.portalCount} / 2</span>
          <span>Anchor {hud.anchored ? "occupied" : "empty"}</span>
          <span>Puzzle {hud.puzzleState}</span>
          <span>Evidence {hud.evidenceCount} / 3</span>
          <span>FPS {hud.fps.toFixed(0)}</span>
          <span>XYZ {hud.position}</span>
        </aside>
        {hud.prompt && <div className="mechanics-prompt">{hud.prompt}</div>}
        {error && <div className="mechanics-error">{error}</div>}
        <div className="mechanics-message">{hud.message}</div>
      </section>
      <section className="mechanics-console">
        <div className="mechanics-actions">
          <button type="button" onClick={() => actionsRef.current?.switchCognition()}><kbd>Q</kbd> 切换认知</button>
          <button type="button" onClick={() => actionsRef.current?.toggleInvestigation()}><kbd>E</kbd> 调查视角</button>
          <button type="button" onClick={() => actionsRef.current?.interact()}><kbd>F</kbd> 交互</button>
          <button type="button" onClick={() => actionsRef.current?.reset()}><kbd>R</kbd> 重置</button>
        </div>
        <div className="mechanics-readout">
          <span><b>借出</b>{hud.borrowed ?? "—"}</span>
          <span><b>锚定</b>{hud.anchorVerified ? "已跨认知验证" : hud.anchored ? "等待切换验证" : "未锚定"}</span>
          <span><b>叙事门</b>{hud.gateUnlocked ? "第五人存在 · 已解锁" : "等待 3 个证据通道"}</span>
        </div>
        <p>WASD 移动 · Shift 快走 · 拖动鼠标环视。月洞门实时显示另一认知；园丁侧路尽头会无缝回到方灯。桥段或石板都可借到水面缺口，锚定后切换认知仍保留真实碰撞。</p>
      </section>
    </main>
  );
}

