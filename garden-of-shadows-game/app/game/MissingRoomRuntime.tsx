"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { completeCampaignChapter } from "./campaign-progress";
import { createCheckpoint } from "./campaign-save";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueSequence, MemoryId } from "./types";
import { CameraRig } from "./mechanics/CameraRig";
import { InteractionController, INTERACTION_RANGE_CALIBRATION } from "./mechanics/InteractionController";
import { ObjectInspectionController } from "./mechanics/ObjectInspectionController";
import { registerArchitectureCollisionCoverage } from "./runtime/architecture-collision-runtime";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { PhysicsController, PLAYER_PHYSICS_CALIBRATION } from "./runtime/PhysicsController";
import { PLAYER_BODY_CALIBRATION } from "./runtime/player-calibration";
import { TingYuXuanScene } from "./runtime/TingYuXuanScene";
import { PlayerAvatar } from "./runtime/PlayerAvatar";
import { CaseFilePanel } from "./ui/CaseFilePanel";
import { ExplorationHud } from "./ui/ExplorationHud";
import { ObjectInspector } from "./ui/ObjectInspector";
import { DialogueRunner } from "./narrative/DialogueRunner";
import { compileInkSource } from "./narrative/ink-runtime";
import missingRoomInkSource from "./narrative/missing-room.ink?raw";
import { NarrativeInline } from "./narrative/NarrativeInline";
import { guidanceLevelForElapsed, guidanceLevelForProximity } from "./runtime/guidance-config";
import { getGameplayAnchor, resolveGameplayRegionForPoint, type ChapterAnchorId } from "./runtime/tingyuxuan-gameplay-map";
import { tingYuXuanLayout } from "./runtime/tingyuxuan-layout";

interface MissingRoomRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
  onContinue?: () => void;
}

type Phase = "loading" | "playing" | "complete" | "error";
type ClueId = "missing-door" | "missing-window" | "missing-boundary" | "missing-furniture" | "reconstruct-room" | "child-box";

const memoryOrder: MemoryId[] = ["gardener", "painter", "accountant", "wife"];
const memoryLabel: Partial<Record<MemoryId, string>> = {
  gardener: "老周记得的旧路",
  painter: "柳生画下的窗",
  accountant: "钱先生记下的尺寸",
  wife: "沈夫人记得的生活",
};
const traceFlags = ["room.trace.door", "room.trace.window", "room.trace.boundary", "room.trace.furniture"] as const;
const unique = <T,>(values: T[]) => [...new Set(values)];
const MISSING_ROOM_STORY_CONTENT = compileInkSource("missing-room", missingRoomInkSource);

const clueDefinitions: Record<ClueId, { anchor: ChapterAnchorId; label: string; memory?: MemoryId; flag?: string }> = {
  "missing-door": { anchor: "B_MISSING_DOOR", label: "检查旧门痕", memory: "gardener", flag: "room.trace.door" },
  "missing-window": { anchor: "B_MISSING_WINDOW", label: "固定旧画里的窗", memory: "painter", flag: "room.trace.window" },
  "missing-boundary": { anchor: "B_MISSING_BOUNDARY", label: "核对建筑尺寸", memory: "accountant", flag: "room.trace.boundary" },
  "missing-furniture": { anchor: "B_MISSING_FURNITURE", label: "恢复家具位置", memory: "wife", flag: "room.trace.furniture" },
  "reconstruct-room": { anchor: "B_MISSING_ROOM", label: "让门、窗、尺寸和家具同时出现" },
  "child-box": { anchor: "B_CHILD_BOX", label: "打开旧盒子" },
};

const resumeMissingRoomDialogueId = (checkpoint: CheckpointState): string | undefined => {
  if (checkpoint.dialogueProgress?.sequenceId) return checkpoint.dialogueProgress.sequenceId;
  const flags = checkpoint.earnedFlags;
  if (!flags.includes("room.dialogue.opening-complete")) return "room-opening";
  if (flags.includes("room.trace.furniture") && !flags.includes("room.dialogue.wife-memory-complete")) return "room-wife-memory";
  if (flags.includes("room.reconstructed") && !flags.includes("room.dialogue.reconstructed-complete")) return "room-reconstructed";
  return undefined;
};

const objectiveFor = (checkpoint: CheckpointState) => {
  const flags = checkpoint.earnedFlags;
  if (!flags.includes("room.trace.door")) return { title: "先找一扇不存在的门", detail: "切到老周的证词。门槛磨损和门轴位置还留着。", hint: "沿北墙看地面，门不在了，门槛磨痕仍在。", clue: "missing-door" as ClueId };
  if (!flags.includes("room.trace.window")) return { title: "找回窗", detail: "切到柳生的证词。旧画只保留了窗和窗里的光。", hint: "旧画里的窗要与眼前北墙的位置对应起来。", clue: "missing-window" as ClueId };
  if (!flags.includes("room.trace.boundary")) return { title: "证明墙后还有体积", detail: "切到钱先生的证词。房契尺寸和房号不会凭空少掉一间。", hint: "比较外墙长度与室内深度，北墙后还少了三米多。", clue: "missing-boundary" as ClueId };
  if (!flags.includes("room.trace.furniture")) return { title: "让它先成为一个生活空间", detail: "切到沈夫人的证词。床、箱子和书桌的位置仍然有人记得。", hint: "床靠东墙，矮书桌在窗边，箱子收在床下。", clue: "missing-furniture" as ClueId };
  if (!flags.includes("room.reconstructed")) return { title: "让不存在的房间重新显现", detail: "四份证词各自只保留一部分。去缺失体积中心，把四个条件同时留下。", hint: "门、窗、墙后体积和家具位置都已查清，回到北墙中央。", clue: "reconstruct-room" as ClueId };
  return { title: "确认这是谁的房间", detail: "不要找凶器。检查最普通的生活痕迹：旧盒子、刻痕与生日卡。", hint: "旧钥匙能打开床板下的生锈小锁。", clue: "child-box" as ClueId };
};

interface RoomVisuals {
  root: THREE.Group;
  clueGroups: Record<Exclude<ClueId, "reconstruct-room" | "child-box">, THREE.Group>;
  structuralTraces: readonly THREE.Group[];
  furnitureMaterial: THREE.MeshBasicMaterial;
  reconstructed: THREE.Group;
  reconstructionShell: THREE.Object3D;
  reconstructionMaterials: readonly ReconstructionMaterialState[];
  reconstructionAlignedPosition: THREE.Vector3;
  reconstructionAlignedYaw: number;
  reconstructionProgress: number;
  reconstructionTarget: number;
  ordinaryRoomLight: THREE.PointLight;
  box: THREE.Group;
}

interface ReconstructionMaterialState {
  material: THREE.Material;
  finalOpacity: number;
  finalTransparent: boolean;
  finalDepthWrite: boolean;
}

const anchorVector = (id: ChapterAnchorId, y = 0) => {
  const anchor = getGameplayAnchor(id);
  return new THREE.Vector3(anchor.position[0], y || anchor.position[1], anchor.position[2]);
};

async function buildRoomVisuals(world: TingYuXuanScene): Promise<RoomVisuals> {
  const root = new THREE.Group();
  root.name = "B_MissingRoom_CognitionLayer";

  const makeTrace = (name: string, anchorId: ChapterAnchorId, points: readonly THREE.Vector3[], color: string) => {
    const group = new THREE.Group();
    group.name = name;
    group.position.copy(anchorVector(anchorId, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints([...points]);
    const line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.72 }));
    line.name = `${name}_CognitionTrace`;
    group.add(line);
    root.add(group);
    return group;
  };

  const door = makeTrace("MissingRoom_DoorTrace", "B_MISSING_DOOR", [
    new THREE.Vector3(-0.55, 0.02, 0), new THREE.Vector3(-0.55, 1.65, 0),
    new THREE.Vector3(-0.55, 1.65, 0), new THREE.Vector3(0.55, 1.65, 0),
    new THREE.Vector3(0.55, 1.65, 0), new THREE.Vector3(0.55, 0.02, 0),
    new THREE.Vector3(-0.55, 0.02, 0), new THREE.Vector3(0.55, 0.02, 0),
  ], "#668c73");
  const window = makeTrace("MissingRoom_WindowTrace", "B_MISSING_WINDOW", [
    new THREE.Vector3(-0.58, 0.65, 0), new THREE.Vector3(-0.58, 1.62, 0),
    new THREE.Vector3(-0.58, 1.62, 0), new THREE.Vector3(0.58, 1.62, 0),
    new THREE.Vector3(0.58, 1.62, 0), new THREE.Vector3(0.58, 0.65, 0),
    new THREE.Vector3(0.58, 0.65, 0), new THREE.Vector3(-0.58, 0.65, 0),
    new THREE.Vector3(0, 0.65, 0), new THREE.Vector3(0, 1.62, 0),
    new THREE.Vector3(-0.58, 1.12, 0), new THREE.Vector3(0.58, 1.12, 0),
  ], "#8f8b80");
  const boundary = makeTrace("MissingRoom_BoundaryTrace", "B_MISSING_BOUNDARY", [
    new THREE.Vector3(-0.15, 0.05, -0.15), new THREE.Vector3(3.25, 0.05, -0.15),
    new THREE.Vector3(3.25, 0.05, -0.15), new THREE.Vector3(3.25, 0.05, 2.45),
    new THREE.Vector3(3.25, 0.05, 2.45), new THREE.Vector3(-0.15, 0.05, 2.45),
    new THREE.Vector3(-0.15, 0.05, 2.45), new THREE.Vector3(-0.15, 0.05, -0.15),
  ], "#7397aa");

  const furniture = new THREE.Group();
  furniture.name = "MissingRoom_FurnitureMemory_AuthoredArtwork";
  furniture.position.copy(anchorVector("B_MISSING_FURNITURE", 1.08));
  const furnitureTexture = await new THREE.TextureLoader().loadAsync("/media/cg/story-v1/cg-04-child-room-v1.png");
  furnitureTexture.colorSpace = THREE.SRGBColorSpace;
  const furnitureMaterial = new THREE.MeshBasicMaterial({ map: furnitureTexture, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false });
  const furniturePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.48, 0.84),
    furnitureMaterial,
  );
  furniturePlane.rotation.y = -0.28;
  furniture.add(furniturePlane);
  root.add(furniture);

  // Reconstruct the room from an already-downloaded, licensed Chinese courtyard
  // house instead of drawing a room from boxes. It is scaled as a memory-space
  // shell; collision remains the separate gameplay skeleton.
  const reconstructed = new THREE.Group();
  reconstructed.name = "MissingRoom_Reconstructed_FormalAsset";
  const center = anchorVector("B_MISSING_ROOM", 0);
  const roomShell = await world.cloneFormalAsset("tyx-arch-house-a");
  roomShell.name = "MissingRoom_ChineseHouse_CC_BY";
  const roomBounds = new THREE.Box3().setFromObject(roomShell);
  const roomSize = roomBounds.getSize(new THREE.Vector3());
  const roomScale = 4.2 / Math.max(roomSize.x, roomSize.z, 0.001);
  roomShell.scale.multiplyScalar(roomScale);
  roomShell.updateMatrixWorld(true);
  const scaledRoomBounds = new THREE.Box3().setFromObject(roomShell);
  const scaledCenter = scaledRoomBounds.getCenter(new THREE.Vector3());
  roomShell.position.set(center.x - scaledCenter.x, -scaledRoomBounds.min.y, center.z - scaledCenter.z);
  const reconstructionMaterials: ReconstructionMaterialState[] = [];
  roomShell.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const sourceWasArray = Array.isArray(child.material);
    const materials = sourceWasArray ? child.material : [child.material];
    const prepared = materials.map((source: THREE.Material) => {
      const material = source.clone();
      reconstructionMaterials.push({
        material,
        finalOpacity: source.opacity,
        finalTransparent: source.transparent,
        finalDepthWrite: source.depthWrite,
      });
      material.transparent = true;
      material.opacity = 0;
      material.depthWrite = false;
      return material;
    });
    child.material = sourceWasArray ? prepared : prepared[0];
  });
  reconstructed.add(roomShell);
  reconstructed.visible = false;
  root.add(reconstructed);

  const reconstructionAlignedPosition = roomShell.position.clone();
  const reconstructionAlignedYaw = roomShell.rotation.y;
  const ordinaryRoomLight = new THREE.PointLight("#d5ad78", 0, 6.5, 1.7);
  ordinaryRoomLight.name = "MissingRoom_OrdinaryMorningLight";
  ordinaryRoomLight.position.set(center.x + 0.75, 1.45, center.z + 0.35);
  root.add(ordinaryRoomLight);
  world.registerRangeLimitedPointLight(ordinaryRoomLight);

  // Reuse the CC-BY incense/storage box already shipped with Pavilion A. This is a
  // real authored prop, not a cube pretending to be a childhood keepsake box.
  const box = new THREE.Group();
  box.name = "MissingRoom_ChildBox_FormalAsset";
  const boxAnchor = anchorVector("B_CHILD_BOX", 0);
  const boxAsset = await world.cloneFormalAsset("tyx-arch-pavilion-a", "IncenseBox_LP");
  boxAsset.name = "MissingRoom_ChildBox_CC_BY";
  const boxBounds = new THREE.Box3().setFromObject(boxAsset);
  const boxSize = boxBounds.getSize(new THREE.Vector3());
  boxAsset.scale.multiplyScalar(0.55 / Math.max(boxSize.x, boxSize.z, 0.001));
  boxAsset.updateMatrixWorld(true);
  const scaledBoxBounds = new THREE.Box3().setFromObject(boxAsset);
  const boxCenter = scaledBoxBounds.getCenter(new THREE.Vector3());
  boxAsset.position.set(boxAnchor.x - boxCenter.x, -scaledBoxBounds.min.y, boxAnchor.z - boxCenter.z);
  box.add(boxAsset);
  box.visible = false;
  root.add(box);

  world.proceduralDressing.add(root);
  return {
    root,
    clueGroups: { "missing-door": door, "missing-window": window, "missing-boundary": boundary, "missing-furniture": furniture },
    structuralTraces: [door, window, boundary],
    furnitureMaterial,
    reconstructed,
    reconstructionShell: roomShell,
    reconstructionMaterials,
    reconstructionAlignedPosition,
    reconstructionAlignedYaw,
    reconstructionProgress: 0,
    reconstructionTarget: 0,
    ordinaryRoomLight,
    box,
  };
}

function applyReconstructionProgress(visuals: RoomVisuals) {
  const progress = THREE.MathUtils.clamp(visuals.reconstructionProgress, 0, 1);
  const eased = THREE.MathUtils.smoothstep(progress, 0, 1);
  visuals.reconstructed.visible = progress > 0.001;
  visuals.reconstructionShell.position.copy(visuals.reconstructionAlignedPosition);
  visuals.reconstructionShell.position.x += (1 - eased) * 0.34;
  visuals.reconstructionShell.position.z -= (1 - eased) * 0.2;
  visuals.reconstructionShell.rotation.y = visuals.reconstructionAlignedYaw + (1 - eased) * 0.035;
  for (const state of visuals.reconstructionMaterials) {
    state.material.opacity = state.finalOpacity * eased;
    state.material.transparent = progress < 0.999 || state.finalTransparent;
    state.material.depthWrite = progress >= 0.62 ? state.finalDepthWrite : false;
  }
  for (const trace of visuals.structuralTraces) {
    trace.visible = progress < 0.995;
    trace.traverse((child) => {
      if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
        child.material.opacity = 0.72 * (1 - eased);
      }
    });
  }
  visuals.furnitureMaterial.opacity = 0.72 + eased * 0.24;
  visuals.ordinaryRoomLight.intensity = eased * 2.1;
}

function animateRoomReconstruction(visuals: RoomVisuals, delta: number) {
  if (visuals.reconstructionProgress === visuals.reconstructionTarget) return;
  const direction = Math.sign(visuals.reconstructionTarget - visuals.reconstructionProgress);
  visuals.reconstructionProgress = THREE.MathUtils.clamp(visuals.reconstructionProgress + direction * delta / 2.6, 0, 1);
  if (Math.abs(visuals.reconstructionTarget - visuals.reconstructionProgress) < 0.001) visuals.reconstructionProgress = visuals.reconstructionTarget;
  applyReconstructionProgress(visuals);
}

function updateRoomVisuals(visuals: RoomVisuals, memory: MemoryId, flags: readonly string[], immediate = false) {
  const reconstructed = flags.includes("room.reconstructed");
  visuals.clueGroups["missing-door"].visible = reconstructed || memory === "gardener" || flags.includes("room.trace.door");
  visuals.clueGroups["missing-window"].visible = reconstructed || memory === "painter" || flags.includes("room.trace.window");
  visuals.clueGroups["missing-boundary"].visible = reconstructed || memory === "accountant" || flags.includes("room.trace.boundary");
  visuals.clueGroups["missing-furniture"].visible = memory === "wife" || flags.includes("room.trace.furniture");
  visuals.reconstructionTarget = reconstructed ? 1 : 0;
  if (immediate) {
    visuals.reconstructionProgress = visuals.reconstructionTarget;
    applyReconstructionProgress(visuals);
  }
  visuals.box.visible = flags.includes("room.dialogue.reconstructed-complete");
}

export function MissingRoomRuntime({ chapter, save, onSave, onExit, onContinue }: MissingRoomRuntimeProps) {
  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) {
      const memoryId = memoryOrder.includes(save.activeCheckpoint.memoryId) ? save.activeCheckpoint.memoryId : "gardener";
      return { ...save.activeCheckpoint, memoryId };
    }
    return { ...createCheckpoint(chapter.id, "gardener"), anchorId: chapter.spawnAnchor };
  });
  const initialMemory = initialCheckpoint.memoryId;
  const initialPhase: Phase = initialCheckpoint.earnedFlags.includes("missing-room.identity-confirmed") ? "complete" : "loading";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{
    renderer: Awaited<ReturnType<typeof createRenderer>>;
    world: TingYuXuanScene;
    physics: PhysicsController;
    cameraRig: CameraRig;
    interaction: InteractionController;
    objectInspector: ObjectInspectionController;
    playerAvatar: PlayerAvatar;
    visuals: RoomVisuals;
  } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const yawRef = useRef(initialCheckpoint.yaw ?? getGameplayAnchor("ROUTE_06_B_NORTHEAST_LINK").yaw);
  const pitchRef = useRef(0);
  const memoryRef = useRef<MemoryId>(initialMemory);
  const checkpointRef = useRef(initialCheckpoint);
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const phaseRef = useRef<Phase>(initialPhase);

  const guidanceKeyRef = useRef("");
  const guidanceElapsedRef = useRef(0);
  const guidanceLevelRef = useRef(0);
  const lastGuideUiUpdateRef = useRef(0);
  const caseFileOpenRef = useRef(false);
  const boxInspectionOpenRef = useRef(false);
  const dialogueRef = useRef<DialogueSequence | undefined>(undefined);

  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const [phase, setPhaseState] = useState<Phase>(initialPhase);
  const [memory, setMemory] = useState<MemoryId>(initialMemory);
  const [backend, setBackend] = useState<RendererBackend>();
  const [prompt, setPrompt] = useState<string>();
  const [subtitle, setSubtitle] = useState("第五个人确实存在。现在的问题是：这个人原本在听雨轩里住在哪里？");

  const [error, setError] = useState("");
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [guidanceLevel, setGuidanceLevel] = useState(0);
  const [guideDistance, setGuideDistance] = useState<number>();
  const [guideAngle, setGuideAngle] = useState(0);

  const [showCaseFile, setShowCaseFileState] = useState(false);
  const [boxInspectionController, setBoxInspectionController] = useState<ObjectInspectionController>();
  const [activeDialogue, setActiveDialogue] = useState<DialogueSequence>();

  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [save, onSave]);
  const setPhase = useCallback((next: Phase) => { phaseRef.current = next; setPhaseState(next); }, []);

  const commitCheckpoint = useCallback((producer: (current: CheckpointState) => CheckpointState) => {
    const pose = runtimeRef.current?.physics.pose();
    const next = producer({
      ...checkpointRef.current,
      position: pose ? [pose.x, pose.y, pose.z] : checkpointRef.current.position,
      yaw: yawRef.current,
      updatedAt: new Date().toISOString(),
    });
    checkpointRef.current = next;
    setCheckpoint(next);
    const nextSave = { ...saveRef.current, activeCheckpoint: next };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    if (runtimeRef.current) updateRoomVisuals(runtimeRef.current.visuals, memoryRef.current, next.earnedFlags);
    return next;
  }, []);

  const startDialogue = useCallback((id: string) => {
    const sequence = chapter.dialogueSequences?.find((item) => item.id === id);
    if (!sequence || dialogueRef.current?.id === id) return;
    dialogueRef.current = sequence;
    setActiveDialogue(sequence);
    keysRef.current.clear();
    runtimeRef.current?.interaction.clearFocus();
    document.exitPointerLock?.();
    commitCheckpoint((current) => ({
      ...current,
      dialogueProgress: current.dialogueProgress?.sequenceId === id ? current.dialogueProgress : undefined,
      pointerLockPending: true,
    }));
  }, [chapter.dialogueSequences, commitCheckpoint]);

  const finishChapter = useCallback(() => {
    if (phaseRef.current === "complete") return;
    const finalCheckpoint = commitCheckpoint((current) => ({
      ...current,
      anchorId: "B_CHILD_BOX",
      mechanics: { ...current.mechanics, safeAnchorId: "B_CHILD_BOX" },
      activeObjectiveId: undefined,
      objectiveStepId: undefined,
    }));
    const nextSave = completeCampaignChapter(saveRef.current, chapter.id, finalCheckpoint);
    checkpointRef.current = nextSave.activeCheckpoint;
    setCheckpoint(nextSave.activeCheckpoint);
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    document.exitPointerLock?.();
    setPhase("complete");
  }, [chapter.id, commitCheckpoint, setPhase]);

  const inspectClue = useCallback((id: ClueId) => {
    const definition = clueDefinitions[id];
    const flags = checkpointRef.current.earnedFlags;
    if (definition.memory && memoryRef.current !== definition.memory) {
      setSubtitle(`这条痕迹只有在${memoryLabel[definition.memory] ?? definition.memory}里才看得清。按 Tab 回到那段记忆。`);
      return;
    }
    if (id === "missing-window" && !flags.includes("room.trace.door")) { setSubtitle("先找到进入这块缺失体积的门。否则窗只是一幅画里的构图。"); return; }
    if (id === "missing-boundary" && !flags.includes("room.trace.door")) { setSubtitle("先找到门，再用尺寸证明门后不该是实心墙。"); return; }
    if (id === "missing-furniture" && !(flags.includes("room.trace.window") && flags.includes("room.trace.boundary"))) { setSubtitle("现在还只有结构碎片。先把窗与缺失体积都固定下来。"); return; }
    if (id === "reconstruct-room") {
      if (!traceFlags.every((flag) => flags.includes(flag))) { setSubtitle("四个条件还没有同时成立：门、窗、边界、家具至少缺了一项。"); return; }
      if (flags.includes("room.reconstructed")) return;
      commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, "room.reconstructed"]) }));
      setSubtitle("");
      startDialogue("room-reconstructed");
      return;
    }
    if (id === "child-box") {
      if (!flags.includes("room.reconstructed") || !flags.includes("room.dialogue.reconstructed-complete")) return;
      if (flags.includes("missing-room.identity-confirmed") || dialogueRef.current?.id === "room-identity" || boxInspectionOpenRef.current) return;
      const runtime = runtimeRef.current;
      if (!runtime) return;
      runtime.interaction.clearFocus();
      runtime.objectInspector.open({
        id: "child-box",
        kind: "box",
        title: "床板下的旧盒子",
        source: runtime.visuals.box,
        hotspots: [{
          id: "rusted-lock",
          label: "生锈的小锁",
          fact: "盒子藏在床板下。小锁已经生锈，老周交来的旧钥匙可以打开它。",
          localDirection: [0, 0, 1],
          facingThreshold: 0.76,
        }],
        onObserve: () => commitCheckpoint((current) => ({
          ...current,
          earnedFlags: unique([...current.earnedFlags, "room.evidence.child-box-inspected"]),
          mechanics: { ...current.mechanics, discoveredEvidence: unique([...current.mechanics.discoveredEvidence, "child-box"]) },
        })),
      });
      boxInspectionOpenRef.current = true;
      setBoxInspectionController(runtime.objectInspector);
      keysRef.current.clear();
      setSubtitle("");
      document.exitPointerLock?.();
      return;
    }
    if (definition.flag && !flags.includes(definition.flag)) {
      commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, definition.flag!]) }));
      if (id === "missing-furniture") {
        setSubtitle("");
        startDialogue("room-wife-memory");
        return;
      }
      const text = id === "missing-door" ? "老周记得门槛在这里。门已经被抹掉，但地面磨损仍指向墙后。"
        : id === "missing-window" ? "柳生的旧画保留了窗框。窗后的那个人被后来一层墨洗掉了。"
          : id === "missing-boundary" ? "房契尺寸比现有内墙多出一间房的深度。账面上，这块体积无法消失。"
            : "沈夫人记得床、箱子和书桌的位置。她记得生活，却不愿承认那是一间卧房。";
      setSubtitle(text);
    }
  }, [commitCheckpoint, startDialogue]);

  const completeBoxInspection = useCallback(() => {
    runtimeRef.current?.objectInspector.close();
    boxInspectionOpenRef.current = false;
    setBoxInspectionController(undefined);
    startDialogue("room-identity");
  }, [startDialogue]);

  const changeMemory = useCallback((next: MemoryId) => {
    memoryRef.current = next;
    setMemory(next);
    runtimeRef.current?.world.setMemory(next);
    runtimeRef.current?.interaction.clearFocus();
    if (runtimeRef.current) updateRoomVisuals(runtimeRef.current.visuals, next, checkpointRef.current.earnedFlags);
    commitCheckpoint((current) => ({
      ...current,
      memoryId: next,
      reconstructionTrace: {
        ...current.reconstructionTrace,
        cognitionUsage: {
          ...current.reconstructionTrace.cognitionUsage,
          [next]: (current.reconstructionTrace.cognitionUsage[next] ?? 0) + 1,
        },
      },
    }));
    setSubtitle(memoryLabel[next] ?? next);
  }, [commitCheckpoint]);

  const requestPointerLock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.focus();
    const result = canvas.requestPointerLock?.();
    if (result instanceof Promise) void result.catch(() => undefined);
  }, []);

  const completeDialogue = useCallback((sequence: DialogueSequence) => {
    dialogueRef.current = undefined;
    setActiveDialogue(undefined);
    commitCheckpoint((current) => ({
      ...current,
      dialogueProgress: undefined,
      pointerLockPending: false,
      earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags,
    }));
    if (sequence.id === "room-identity") finishChapter();
    else requestPointerLock();
  }, [commitCheckpoint, finishChapter, requestPointerLock]);

  const setCaseFileOpen = useCallback((next: boolean) => {
    caseFileOpenRef.current = next;
    setShowCaseFileState(next);
    keysRef.current.clear();
    runtimeRef.current?.interaction.clearFocus();
    if (next) document.exitPointerLock?.();
    else if (phaseRef.current === "playing") requestPointerLock();
  }, [requestPointerLock]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let resizeCleanup: (() => void) | undefined;

    const boot = async () => {
      try {
        const renderer = await createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality });
        const spawnAnchor = getGameplayAnchor("ROUTE_06_B_NORTHEAST_LINK");
        const restored = initialCheckpoint.position;
        const spawn = { x: restored?.[0] ?? spawnAnchor.position[0], y: Math.max(restored?.[1] ?? PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY, PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY), z: restored?.[2] ?? spawnAnchor.position[2] };
        const physics = await PhysicsController.create(spawn, tingYuXuanLayout.colliders);
        if (cancelled) { physics.dispose(); renderer.dispose(); return; }
        const world = await TingYuXuanScene.create(chapter.memories, save.settings.quality, renderer.renderer);
        registerArchitectureCollisionCoverage(world, physics, canvas);
        if (cancelled) { physics.dispose(); world.dispose(); renderer.dispose(); return; }
        // Do not inject broad Mesh Box3 values as player collision.
        const cameraRig = new CameraRig(world.camera, physics, { smoothTime: save.settings.stableCamera ? 0.11 : 0.16 });
        const interaction = new InteractionController();
        const playerAvatar = new PlayerAvatar();
        world.proceduralDressing.add(playerAvatar.root);
        const visuals = await buildRoomVisuals(world);
        const objectInspector = new ObjectInspectionController(world.scene, world.camera);
        (Object.entries(clueDefinitions) as Array<[ClueId, (typeof clueDefinitions)[ClueId]]>).forEach(([id, definition]) => {
          const anchor = getGameplayAnchor(definition.anchor);
          const focusRoot = id === "reconstruct-room"
            ? visuals.reconstructed
            : id === "child-box"
              ? visuals.box
              : visuals.clueGroups[id];
          interaction.registerPoint({
            id,
            type: "evidence",
            label: definition.label,
            maxDistance: INTERACTION_RANGE_CALIBRATION.standardEvidence,
            enabledWhen: () => phaseRef.current === "playing"
              && objectiveFor(checkpointRef.current).clue === id
              && (!definition.memory || definition.memory === memoryRef.current),
            onInteract: () => inspectClue(id),
          }, new THREE.Vector3(anchor.position[0], 0.9, anchor.position[2]), INTERACTION_RANGE_CALIBRATION.standardProxyRadius, focusRoot);
        });
        world.setMemory(memoryRef.current);
        updateRoomVisuals(visuals, memoryRef.current, checkpointRef.current.earnedFlags, true);
        yawRef.current = initialCheckpoint.yaw ?? spawnAnchor.yaw;
        cameraRig.syncExploration(new THREE.Vector3(spawn.x, spawn.y, spawn.z), yawRef.current, pitchRef.current, true);
        runtimeRef.current = { renderer, world, physics, cameraRig, interaction, objectInspector, playerAvatar, visuals };
        setBackend(renderer.backend);

        const resize = () => {
          const rect = canvas.getBoundingClientRect();
          renderer.resize(rect.width, rect.height, window.devicePixelRatio);
          world.camera.aspect = rect.width / Math.max(rect.height, 1);
          world.camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);
        resizeCleanup = () => window.removeEventListener("resize", resize);

        let previous = performance.now();
        renderer.renderer.setAnimationLoop((now: number) => {
          const delta = Math.min((now - previous) / 1000, 0.05);
          previous = now;
          let pose = physics.pose();
          if (phaseRef.current === "playing" && !caseFileOpenRef.current && !dialogueRef.current && !boxInspectionOpenRef.current) {
            const forward = Number(keysRef.current.has("KeyW")) - Number(keysRef.current.has("KeyS"));
            const strafe = Number(keysRef.current.has("KeyD")) - Number(keysRef.current.has("KeyA"));
            const turn = Number(keysRef.current.has("ArrowRight")) - Number(keysRef.current.has("ArrowLeft"));
            yawRef.current -= turn * 1.8 * delta;
            const speed = keysRef.current.has("ShiftLeft") ? PLAYER_PHYSICS_CALIBRATION.fastWalkSpeed : PLAYER_PHYSICS_CALIBRATION.walkSpeed;
            const sin = Math.sin(yawRef.current);
            const cos = Math.cos(yawRef.current);
            pose = physics.move({ x: (forward * -sin + strafe * cos) * speed * delta, y: 0, z: (forward * -cos - strafe * sin) * speed * delta }, delta);
          }
          const player = new THREE.Vector3(pose.x, pose.y, pose.z);
          const avatarMoving = phaseRef.current === "playing" && !caseFileOpenRef.current && !dialogueRef.current && !boxInspectionOpenRef.current && (keysRef.current.has("KeyW") || keysRef.current.has("KeyA") || keysRef.current.has("KeyS") || keysRef.current.has("KeyD"));
          playerAvatar.update(pose, yawRef.current, avatarMoving, delta);
          cameraRig.syncExploration(player, yawRef.current, pitchRef.current);
          cameraRig.update(delta);
          world.update(delta, player, false);
          animateRoomReconstruction(visuals, delta);
          const focus = caseFileOpenRef.current || dialogueRef.current || boxInspectionOpenRef.current
            ? (interaction.clearFocus(), undefined)
            : interaction.focus(world.camera, world.camera.position);
          setPrompt(focus?.canInteract ? focus.definition.label : undefined);

          const objective = objectiveFor(checkpointRef.current);
          const guidanceKey = objective.clue;
          const anchor = getGameplayAnchor(clueDefinitions[objective.clue].anchor);
          const targetDistance = Math.hypot(anchor.position[0] - pose.x, anchor.position[2] - pose.z);
          if (guidanceKey !== guidanceKeyRef.current) {
            guidanceKeyRef.current = guidanceKey;
            guidanceElapsedRef.current = 0;
            guidanceLevelRef.current = 0;
            setGuidanceLevel(0);

          } else if (phaseRef.current === "playing" && !caseFileOpenRef.current && !dialogueRef.current && !boxInspectionOpenRef.current && saveRef.current.settings.guidanceAssist) {
            guidanceElapsedRef.current += delta;
            const nextLevel = guidanceLevelForProximity(guidanceLevelForElapsed(guidanceElapsedRef.current), targetDistance);
            if (nextLevel !== guidanceLevelRef.current) {
              const previousLevel = guidanceLevelRef.current;
              guidanceLevelRef.current = nextLevel;
              setGuidanceLevel(nextLevel);

              if (nextLevel === 2 && previousLevel < 2) setSubtitle(objective.hint);
            }
          }
          if (now - lastGuideUiUpdateRef.current >= 120) {
            lastGuideUiUpdateRef.current = now;
            setGuideDistance(targetDistance);
            setGuideAngle(THREE.MathUtils.radToDeg(Math.atan2(anchor.position[0] - pose.x, -(anchor.position[2] - pose.z)) - yawRef.current));
          }
          world.setGuidanceTarget(saveRef.current.settings.guidanceAssist && guidanceLevelRef.current >= 3
            ? new THREE.Vector3(anchor.position[0], 0, anchor.position[2])
            : undefined, "subtle");

          const currentArea = resolveGameplayRegionForPoint({ x: pose.x, z: pose.z });

          canvas.dataset.playerPose = `${pose.x.toFixed(2)},${pose.y.toFixed(2)},${pose.z.toFixed(2)}`;
          canvas.dataset.playerAvatarVisible = String(playerAvatar.root.visible && playerAvatar.root.parent !== null);
          canvas.dataset.gameplayArea = currentArea;
          canvas.dataset.grounded = String(physics.isGrounded());
          renderer.renderer.render(world.scene, world.camera);
        });
        if (phaseRef.current !== "complete") {
          setPhase("playing");
          const resumeDialogueId = resumeMissingRoomDialogueId(initialCheckpoint);
          if (resumeDialogueId) startDialogue(resumeDialogueId);
          else if (initialCheckpoint.earnedFlags.includes("room.dialogue.identity-complete") && !initialCheckpoint.earnedFlags.includes("missing-room.identity-confirmed")) finishChapter();
          else requestPointerLock();
        }
      } catch (reason) {
        console.error("[missing-room] scene failed to appear", reason);
        setError("北墙后的旧房没有完整显现。调查记录仍然保留，可以返回案卷后重新进入。");
        setPhase("error");
      }
    };

    void boot();
    return () => {
      cancelled = true;
      resizeCleanup?.();
      const runtime = runtimeRef.current;
      runtime?.renderer.renderer.setAnimationLoop(null);
      runtime?.interaction.dispose();
      runtime?.objectInspector.dispose();
      runtime?.cameraRig.dispose();
      runtime?.physics.dispose();
      runtime?.world.dispose();
      runtime?.renderer.dispose();
      runtimeRef.current = undefined;
    };
  }, [chapter.memories, finishChapter, initialCheckpoint, inspectClue, requestPointerLock, save.settings.quality, save.settings.renderer, save.settings.stableCamera, setPhase, startDialogue]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "Tab", "Space", "KeyN"].includes(event.code)) event.preventDefault();
      if (event.repeat || phaseRef.current !== "playing" || boxInspectionOpenRef.current) return;
      if (dialogueRef.current) return;
      if (event.code === "KeyN") {
        setCaseFileOpen(!caseFileOpenRef.current);
        return;
      }
      if (caseFileOpenRef.current) return;
      if (event.code === "Space") {
        runtimeRef.current?.physics.requestJump();
        return;
      }
      keysRef.current.add(event.code);
      if (event.code === "KeyF") runtimeRef.current?.interaction.interact();
      if (event.code === "Tab") {
        const index = memoryOrder.indexOf(memoryRef.current);
        changeMemory(memoryOrder[(index + 1) % memoryOrder.length]);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvasRef.current || phaseRef.current !== "playing" || caseFileOpenRef.current || dialogueRef.current || boxInspectionOpenRef.current) return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0019, -1.12, 1.04);
    };
    const onLockChange = () => setHasPointerLock(document.pointerLockElement === canvasRef.current);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onLockChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onLockChange);
    };
  }, [changeMemory, setCaseFileOpen]);

  const objective = objectiveFor(checkpoint);
  const boxInspectionOpen = Boolean(boxInspectionController);
  return (
    <main className={`runtime runtime-${memory}`} data-renderer={backend}>
      <canvas ref={canvasRef} className="runtime-canvas" tabIndex={0} aria-label="第三章不存在的房间" onClick={() => phase === "playing" && !showCaseFile && !activeDialogue && !boxInspectionOpen && requestPointerLock()} />
      <div className="vignette" aria-hidden="true" />
      <div className="runtime-topbar">
        <button type="button" className="text-button" onClick={onExit}>← 返回案卷</button>
        <div><span>第三章</span><strong>不存在的房间</strong></div>

      </div>
      <ExplorationHud
        objective={phase !== "complete" && !activeDialogue ? { label: "当前问题", title: objective.title, detail: objective.detail } : undefined}
        direction={guideDistance !== undefined && guidanceLevel >= 1 ? <div className="objective-direction"><i style={{ transform: `rotate(${guideAngle}deg)` }}>↑</i><span>{Math.max(1, Math.round(guideDistance))} m</span></div> : undefined}
        prompt={phase === "playing" && !showCaseFile && !activeDialogue && !boxInspectionOpen ? prompt : undefined}
        subtitle={save.settings.subtitles && subtitle && phase === "playing" && !showCaseFile && !activeDialogue && !boxInspectionOpen ? <NarrativeInline kind="interaction" text={subtitle} /> : undefined}
      />



      {phase === "playing" && !showCaseFile && !activeDialogue && !boxInspectionOpen && !hasPointerLock && <button type="button" className="pointer-lock-callout" onClick={requestPointerLock}>继续调查<br /><small>从四份残缺的记忆里找回那间房</small></button>}
      {activeDialogue && <DialogueRunner key={activeDialogue.id} sequence={activeDialogue} storyContent={MISSING_ROOM_STORY_CONTENT} settings={save.settings} restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={checkpoint.seenDialogueLines} onCommand={() => undefined} onProgress={(inkStateJson) => commitCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))} onSeen={(lineId) => commitCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))} onComplete={() => completeDialogue(activeDialogue)} />}
      {showCaseFile && <CaseFilePanel checkpoint={checkpoint} completedChapters={save.completedChapters} chapterTitle="第三章 · 不存在的房间" onClose={() => setCaseFileOpen(false)} />}
      {boxInspectionController && <ObjectInspector controller={boxInspectionController} contextLabel="第三章 · 不存在的房间" confirmLabel="用旧钥匙打开" onConfirm={completeBoxInspection} />}
      {phase === "complete" && <Modal eyebrow="第三章结束" title="为什么他们要把我删掉？"><img className="chapter-cg-inline" src="/media/cg/story-v1/cg-04-child-room-v1.png" alt="重新显现的儿童房与床板下的旧盒子" /><p>门、窗、边界和家具让这间普通旧房重新成立；床板下的校徽、生日卡与小时候的布鞋把第五人的身份指回赵映自己。</p><blockquote>沈夫人承认四个人都知道赵映七年前回来过，并留下新的问题：把她从房间、照片、账本和路里删掉，是沈老爷摔下去后提出的第一件事。</blockquote><button type="button" className="primary-button" onClick={onContinue ?? onExit}>进入第四章</button></Modal>}
      {phase === "error" && <Modal eyebrow="记忆中断" title="北墙旧房没有完整显现"><p>{error}</p><button type="button" className="primary-button" onClick={onExit}>返回案卷目录</button></Modal>}
    </main>
  );
}

function Modal({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop"><section className="runtime-modal"><span>{eyebrow}</span><h2>{title}</h2>{children}</section></div>;
}
