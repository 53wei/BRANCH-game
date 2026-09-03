"use client";
/* eslint-disable @next/next/no-img-element -- dialogue standees use existing transparent WebP portrait assets */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { createCheckpoint } from "./campaign-save";
import type { CampaignSave, ChapterManifest, CheckpointState } from "./types";
import { CameraRig } from "./mechanics/CameraRig";
import { InteractionController, INTERACTION_RANGE_CALIBRATION } from "./mechanics/InteractionController";
import { speakerProfiles } from "./narrative/speakers";
import { StoryBackdrop } from "./narrative/StoryBackdrop";
import { NarrativeInline } from "./narrative/NarrativeInline";
import type { StoryBackdropId } from "./narrative/story-backdrops";
import {
  PROLOGUE_CANONICAL_SCENE_ORDER,
  PROLOGUE_STORY_BY_PHASE,
  type PrologueNarrativePhase,
  type PrologueStoryLine,
} from "./narrative/prologue-content";
import { AudioAtmosphere } from "./runtime/AudioAtmosphere";
import { registerArchitectureCollisionCoverage } from "./runtime/architecture-collision-runtime";
import { PROLOGUE_DEPARTURE_DOCUMENT } from "./runtime/document-content";
import { guidanceLevelForElapsed } from "./runtime/guidance-config";
import { PhysicsController, PLAYER_PHYSICS_CALIBRATION } from "./runtime/PhysicsController";
import { PlayerAvatar } from "./runtime/PlayerAvatar";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { TingYuXuanScene } from "./runtime/TingYuXuanScene";
import {
  GAMEPLAY_ANCHOR_REFERENCE_Y,
  getGameplayAnchor,
  resolveGameplayRegionForPoint,
  resolveNearestRouteAnchor,
  tingYuXuanPrologueColliders,
} from "./runtime/tingyuxuan-gameplay-map";
import { TINGYUXUAN_MASTER_SCALE_CALIBRATION, tingYuXuanLayout, type LayoutCollider } from "./runtime/tingyuxuan-layout";
import {
  PROLOGUE_ANOMALY_POINT,
  PROLOGUE_EVIDENCE,
  PROLOGUE_LANDMARKS,
  PROLOGUE_STEWARD_POINT,
  distance2D,
} from "./runtime/vertical-slice-content";
import { CaseFilePanel } from "./ui/CaseFilePanel";
import { DocumentViewer } from "./ui/DocumentViewer";
import { FullMap } from "./ui/FullMap";
import { HelpPanel } from "./ui/HelpPanel";
import { MiniMap, type RuntimeMapTarget } from "./ui/MiniMap";
import { PauseMenu, RuntimeSettingsPanel } from "./ui/PauseMenu";
import { TutorialGuide } from "./ui/TutorialGuide";

interface PrologueRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
  onContinue: () => void;
}

type ProloguePhase = "loading" | "explore" | "enter" | "title" | "complete" | "error" | PrologueNarrativePhase;
type EvidenceId = "umbrella" | "shoes" | "ledger";
type RuntimePanel = "tutorial" | "case-file" | "map" | "pause" | "help" | "settings";

interface PrologueGuidance {
  key: string;
  title: string;
  description: string;
  target?: RuntimeMapTarget;
  subtasks?: Array<{ id: string; label: string; complete: boolean }>;
  spokenHint: string;
}

const PROLOGUE_LANDMARK_ORDER = ["window-row", "lantern-turn", "gate-back-view"] as const;

function resolvePrologueGuidance(checkpoint: CheckpointState, phase: ProloguePhase): PrologueGuidance | undefined {
  if (phase === "enter") {
    return {
      key: "enter-a",
      title: "穿过主门，进入旧园。",
      description: "老周让开了门。沿门内唯一完整的石路向前。",
      target: { x: 6.9, z: 39.4, label: "主门内石路" },
      spokenHint: "沿门内唯一完整的石路向前。",
    };
  }
  if (phase !== "explore") return undefined;

  const flags = checkpoint.earnedFlags;
  const landmarks = new Set(PROLOGUE_LANDMARKS.filter((item) => flags.includes(`prologue.baseline.${item.id}`)).map((item) => item.id));
  const landmarkCount = landmarks.size;
  const hasPortrait = flags.includes("prologue.evidence.umbrella");
  const hasDepartureRecord = flags.includes("prologue.evidence.ledger");
  const baselineIntroSeen = flags.includes("prologue.baseline.intro-seen");
  const waterPavilionSeen = flags.includes("prologue.water-pavilion.seen");
  const anomalySeen = flags.includes("prologue.first-anomaly");

  if (!hasPortrait) {
    const portrait = PROLOGUE_EVIDENCE.find((item) => item.id === "umbrella")!;
    return {
      key: "front-hall-portrait",
      title: "先去前厅看看沈夫人收好的箱子。",
      description: "老周说沈夫人等了你一下午。前厅还留着凉掉的茶点和一幅旧合影。",
      target: { x: portrait.position[0], z: portrait.position[2], label: "前厅旧画像" },
      spokenHint: "画像就在前厅茶桌旁，画布像是后来补过。",
    };
  }

  if (!hasDepartureRecord) {
    const record = PROLOGUE_EVIDENCE.find((item) => item.id === "ledger")!;
    return {
      key: "departure-record",
      title: "翻看箱子里的离家记录。",
      description: "七年前的时间写得很清楚，纸角却像留下过另一组数字。",
      target: { x: record.position[0], z: record.position[2], label: "离家记录" },
      spokenHint: "记录和钥匙、旧怀表放在同一只箱子里。",
    };
  }

  if (!baselineIntroSeen) {
    const baseline = getGameplayAnchor("A_BASELINE");
    return {
      key: "west-courtyard-intro",
      title: "跟老周去西院走一遍。",
      description: "画像和离家记录都看过了。沿窄回廊往西院走，先确认这里还是不是你记得的样子。",
      target: { x: baseline.position[0], z: baseline.position[2], label: "西院回廊" },
      spokenHint: "沿前厅外的回廊往西院走，老周会在那边等你。",
    };
  }

  if (landmarkCount < 3) {
    const nextId = PROLOGUE_LANDMARK_ORDER.find((id) => !landmarks.has(id));
    const target = PROLOGUE_LANDMARKS.find((item) => item.id === nextId);
    return {
      key: `west-courtyard-${nextId ?? "walk"}`,
      title: "跟着回廊往水榭外走。",
      description: "老周还记得你小时候数漏窗、藏灯笼的事。慢慢走一遍，看看这里是否还是你记得的家。",
      target: target ? { x: target.position[0], z: target.position[2], label: target.label } : undefined,
      spokenHint: "沿回廊向前，经过六扇漏窗和有裂纹的转角灯。",
    };
  }

  if (!waterPavilionSeen) {
    return {
      key: "water-pavilion",
      title: "和老周去水榭外看看。",
      description: "西院还是熟悉的样子。先把七年前沈伯摔倒的地方问清楚，再沿原路回来。",
      target: { x: PROLOGUE_STEWARD_POINT.position[0], z: PROLOGUE_STEWARD_POINT.position[2], label: "老周" },
      spokenHint: "老周就在回廊边。问他水榭和七年前那场事故。",
    };
  }

  if (!anomalySeen) {
    return {
      key: "return-anomaly",
      title: "沿原路返回，再看一眼刚才的转角。",
      description: "经过六扇漏窗和那盏有裂纹的灯，回到刚才看见月洞门的位置。",
      target: { x: PROLOGUE_ANOMALY_POINT.position[0], z: PROLOGUE_ANOMALY_POINT.position[2], label: "墙与转角" },
      spokenHint: "沿刚才走过的回廊返回，看到转角灯后再往右看。",
    };
  }

  return undefined;
}

const isInsideLegacyTreeSpawn = (position: readonly number[]) =>
  position[0] >= 12.2 && position[0] <= 17
  && position[2] >= 47.4 && position[2] <= 52.7;

const unique = <T,>(values: T[]) => [...new Set(values)];

type PrologueVisualScenario = "wall-scale" | "door-scale" | "gameplay-camera";

const PROLOGUE_VISUAL_AUDIT_POSES: Record<PrologueVisualScenario, { position: readonly [number, number, number]; yaw: number }> = {
  // TYX_MAIN_GATE_SOUTH is fixed around x=9.3/z=39.4 after the Master transform.
  // These two poses put a 1.69 m avatar next to the same wall/gate complex so
  // screenshots prove scale instead of relying on perspective alone.
  "wall-scale": { position: [13.15, GAMEPLAY_ANCHOR_REFERENCE_Y, 41.15], yaw: 0.08 },
  "door-scale": { position: [9.3, GAMEPLAY_ANCHOR_REFERENCE_Y, 42.0], yaw: 0.02 },
  "gameplay-camera": { position: [11.5, GAMEPLAY_ANCHOR_REFERENCE_Y, 52.2], yaw: 0.68 },
};

interface PrologueVisuals {
  root: THREE.Group;
  player: PlayerAvatar;
  steward: THREE.Group;
  evidence: Partial<Record<EvidenceId, THREE.Group>>;
  anomalyWall: THREE.Group;
}

async function buildPrologueVisuals(world: TingYuXuanScene): Promise<PrologueVisuals> {
  const root = new THREE.Group();
  root.name = "Prologue_Gate_StoryLayer";

  const player = new PlayerAvatar();
  // Geometry-free first-person anchor: no temporary body is rendered.
  root.add(player.root);

  const steward = new THREE.Group();
  steward.name = "Prologue_Steward_FormalAssetAnchor";
  steward.position.set(PROLOGUE_STEWARD_POINT.position[0], 0, PROLOGUE_STEWARD_POINT.position[2]);
  // No primitive human body fallback in formal play.
  // Primitive cloth proxy removed.
  // Primitive skin proxy removed.
  // Primitive robe proxy removed.
  // Primitive robe transform removed.
  // Primitive shoulder proxy removed.
  // Primitive shoulder transform removed.
  // Primitive head proxy removed.
  // Primitive head transform removed.
  // Primitive steward meshes removed; keep only the formal asset anchor.
  const lantern = new THREE.PointLight("#d49855", 4.2, 4.8, 1.9);
  lantern.position.set(-0.42, 1.03, 0.13);
  steward.add(lantern);
  world.registerRangeLimitedPointLight(lantern);
  root.add(steward);

  const evidence: Partial<Record<EvidenceId, THREE.Group>> = {};

  const umbrella = new THREE.Group();
  umbrella.name = "Prologue_FrontHallPortrait";
  const umbrellaPoint = PROLOGUE_EVIDENCE.find((item) => item.id === "umbrella")!;
  umbrella.position.set(umbrellaPoint.position[0], 1.25, umbrellaPoint.position[2]);
  umbrella.rotation.y = -0.5;
  const portraitTexture = await new THREE.TextureLoader().loadAsync("/media/cg/story-v1/cg-02-family-portrait-v1.png");
  portraitTexture.colorSpace = THREE.SRGBColorSpace;
  const portraitCanvas = new THREE.Mesh(
    new THREE.PlaneGeometry(1.08, 0.72),
    new THREE.MeshStandardMaterial({ map: portraitTexture, roughness: 0.78, metalness: 0, side: THREE.DoubleSide }),
  );
  portraitCanvas.name = "Prologue_FrontHallPortrait_Image";
  umbrella.add(portraitCanvas);
  root.add(umbrella);
  evidence.umbrella = umbrella;

  const ledger = new THREE.Group();
  ledger.name = "Prologue_DepartureRecord_FormalProp";
  const ledgerPoint = PROLOGUE_EVIDENCE.find((item) => item.id === "ledger")!;
  ledger.position.set(ledgerPoint.position[0], 0, ledgerPoint.position[2]);
  const oldBox = await world.cloneFormalAsset("tyx-arch-pavilion-a", "IncenseBox_LP");
  oldBox.name = "Prologue_OldStorageBox_CC_BY";
  const boxBounds = new THREE.Box3().setFromObject(oldBox);
  const boxSize = boxBounds.getSize(new THREE.Vector3());
  const uniformScale = 0.72 / Math.max(boxSize.x, boxSize.z, 0.001);
  oldBox.scale.multiplyScalar(uniformScale);
  oldBox.updateMatrixWorld(true);
  const scaledBounds = new THREE.Box3().setFromObject(oldBox);
  oldBox.position.y -= scaledBounds.min.y;
  oldBox.rotation.y = -0.28;
  ledger.add(oldBox);
  const ledgerLight = new THREE.PointLight("#bd8b55", 2.3, 3.6, 1.8);
  ledgerLight.position.y = 0.62;
  ledger.add(ledgerLight);
  world.registerRangeLimitedPointLight(ledgerLight);
  root.add(ledger);
  evidence.ledger = ledger;

  // The anomaly is performed by the authored StoryBackdrop and by changing which
  // Master-space route is considered valid. Do not place a fake BoxGeometry wall.
  const anomalyWall = new THREE.Group();
  anomalyWall.name = "Prologue_FirstCognitiveAnomaly_StateAnchor";
  anomalyWall.position.set(PROLOGUE_ANOMALY_POINT.position[0], 0, PROLOGUE_ANOMALY_POINT.position[2]);
  anomalyWall.visible = false;
  root.add(anomalyWall);

  if (typeof window !== "undefined") {
    const debugParams = new URLSearchParams(window.location.search);
    if (debugParams.get("debugOverlay") === "1" || debugParams.get("debugMap") === "1") {
      const lockMaterial = new THREE.MeshBasicMaterial({ color: "#ed604f", wireframe: true, transparent: true, opacity: 0.78 });
      tingYuXuanPrologueColliders.forEach((collider) => {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(collider.halfExtents[0] * 2, collider.halfExtents[1] * 2, collider.halfExtents[2] * 2),
          lockMaterial,
        );
        mesh.name = `PrologueCollider_${collider.id}`;
        mesh.position.set(...collider.center);
        mesh.rotation.y = collider.rotationY ?? 0;
        root.add(mesh);
      });
    }
  }

  world.proceduralDressing.add(root);
  return { root, player, steward, evidence, anomalyWall };
}

export function PrologueRuntime({ chapter, save, onSave, onExit, onContinue }: PrologueRuntimeProps) {
  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) return { ...save.activeCheckpoint, memoryId: "baseline", anchorId: save.activeCheckpoint.anchorId || "ROUTE_01_START" };
    return { ...createCheckpoint(chapter.id, "baseline"), anchorId: "ROUTE_01_START" };
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialRuntimePanel: RuntimePanel | undefined = save.tutorial.controls.autoShow && !save.tutorial.controls.seen ? "tutorial" : undefined;
  const runtimeRef = useRef<{
    renderer: Awaited<ReturnType<typeof createRenderer>>;
    world: TingYuXuanScene;
    physics: PhysicsController;
    audio: AudioAtmosphere;
    cameraRig: CameraRig;
    interaction: InteractionController;
    visuals: PrologueVisuals;
  } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const panelRef = useRef<RuntimePanel | undefined>(initialRuntimePanel);
  const panelReturnRef = useRef<RuntimePanel | undefined>(undefined);
  const yawRef = useRef(initialCheckpoint.yaw ?? getGameplayAnchor("ROUTE_01_START").yaw);
  const pitchRef = useRef(0.02);
  const phaseRef = useRef<ProloguePhase>("loading");
  const cluesRef = useRef(new Set<EvidenceId>((["umbrella", "shoes", "ledger"] as EvidenceId[]).filter((id) => initialCheckpoint.earnedFlags.includes(`prologue.evidence.${id}`))));
  const landmarksRef = useRef(new Set(PROLOGUE_LANDMARKS.filter((item) => initialCheckpoint.earnedFlags.includes(`prologue.baseline.${item.id}`)).map((item) => item.id)));
  const anomalyTriggeredRef = useRef(initialCheckpoint.earnedFlags.includes("prologue.first-anomaly"));
  const checkpointRef = useRef(initialCheckpoint);
  const inspectionRef = useRef<EvidenceId | undefined>(undefined);
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const lastMapUpdateRef = useRef(0);
  const guidanceKeyRef = useRef("");
  const guidanceElapsedRef = useRef(0);
  const guidanceLevelRef = useRef(0);

  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const [phase, setPhaseState] = useState<ProloguePhase>("loading");
  const [backend, setBackend] = useState<RendererBackend>();
  const [storyIndex, setStoryIndex] = useState(0);
  const [inspection, setInspection] = useState<EvidenceId>();
  const [prompt, setPrompt] = useState<string>();
  const [ambientLine, setAmbientLine] = useState<string>();
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [titleSettled, setTitleSettled] = useState(false);
  const [runtimePanel, setRuntimePanelState] = useState<RuntimePanel | undefined>(initialRuntimePanel);
  const [mapPose, setMapPose] = useState(() => {
    const anchor = getGameplayAnchor("ROUTE_01_START");
    const position = initialCheckpoint.position ?? anchor.position;
    return { x: position[0], z: position[2], yaw: initialCheckpoint.yaw ?? anchor.yaw };
  });
  const [guidanceLevel, setGuidanceLevel] = useState(0);
  const [cinematicBackdrop, setCinematicBackdrop] = useState<StoryBackdropId>();
  const [error, setError] = useState("");

  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [onSave, save]);
  const setPhase = useCallback((next: ProloguePhase) => { phaseRef.current = next; setPhaseState(next); }, []);

  const commitCheckpoint = useCallback((producer: (current: CheckpointState) => CheckpointState) => {
    const pose = runtimeRef.current?.physics.pose();
    const current = checkpointRef.current;
    const next = producer({
      ...current,
      position: pose ? [pose.x, pose.y, pose.z] : current.position,
      yaw: yawRef.current,
      updatedAt: new Date().toISOString(),
    });
    checkpointRef.current = next;
    setCheckpoint(next);
    const nextSave = { ...saveRef.current, activeCheckpoint: next };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    return next;
  }, []);

  const requestPointerLock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.focus();
    const result = canvas.requestPointerLock?.();
    if (result instanceof Promise) void result.catch(() => undefined);
  }, []);

  const openRuntimePanel = useCallback((next: RuntimePanel, returnTo?: RuntimePanel) => {
    panelReturnRef.current = returnTo;
    panelRef.current = next;
    setRuntimePanelState(next);
    keysRef.current.clear();
    document.exitPointerLock?.();
  }, []);

  const closeRuntimePanel = useCallback(() => {
    const returnTo = panelReturnRef.current;
    panelReturnRef.current = undefined;
    if (returnTo) {
      panelRef.current = returnTo;
      setRuntimePanelState(returnTo);
      return;
    }
    panelRef.current = undefined;
    setRuntimePanelState(undefined);
    if (phaseRef.current === "explore" || phaseRef.current === "enter") requestPointerLock();
  }, [requestPointerLock]);

  const finishTutorial = useCallback((dontShowAgain: boolean) => {
    const nextSave: CampaignSave = {
      ...saveRef.current,
      tutorial: { controls: { seen: true, autoShow: !dontShowAgain } },
    };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    closeRuntimePanel();
  }, [closeRuntimePanel]);

  const updateRuntimeSettings = useCallback((settings: CampaignSave["settings"]) => {
    const nextSave: CampaignSave = { ...saveRef.current, settings };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
  }, []);

  const finishGateDialogue = useCallback(() => {
    runtimeRef.current?.audio.start(saveRef.current.settings.masterVolume);
    runtimeRef.current?.audio.setZone("SideYard", 0.2);
    runtimeRef.current?.physics.setColliderEnabled("prologue-gate-lock", false);
    commitCheckpoint((current) => ({
      ...current,
      earnedFlags: unique([...current.earnedFlags, "prologue.gate-dialogue.seen"]),
    }));
    setAmbientLine(undefined);
    setPhase("enter");
    requestPointerLock();
  }, [commitCheckpoint, requestPointerLock, setPhase]);

  const beginWaterPavilionDialogue = useCallback(() => {
    setStoryIndex(0);
    setAmbientLine(undefined);
    setPhase("water");
    document.exitPointerLock?.();
  }, [setPhase]);

  const finishWaterPavilionDialogue = useCallback(() => {
    commitCheckpoint((current) => ({
      ...current,
      earnedFlags: unique([...current.earnedFlags, "prologue.water-pavilion.seen"]),
    }));
    setStoryIndex(0);
    setAmbientLine(undefined);
    setPhase("explore");
    requestPointerLock();
  }, [commitCheckpoint, requestPointerLock, setPhase]);

  const finishAnomalyDialogue = useCallback(() => {
    const next = commitCheckpoint((current) => ({
      ...current,
      anchorId: "ROUTE_02_A_ENTRY",
      earnedFlags: unique([
        ...current.earnedFlags,
        "prologue.first-anomaly",
        "prologue.trace.seen",
        "prologue.examiner-appointed",
      ]),
    }));
    saveRef.current = { ...saveRef.current, activeCheckpoint: next };
    const runtime = runtimeRef.current;
    if (runtime) runtime.visuals.anomalyWall.visible = false;
    setCinematicBackdrop(undefined);
    setStoryIndex(0);
    setAmbientLine(undefined);
    setPhase("title");
    document.exitPointerLock?.();
  }, [commitCheckpoint, setPhase]);

  const finishEvidenceDialogue = useCallback((id: EvidenceId) => {
    cluesRef.current.add(id);
    inspectionRef.current = id;
    setInspection(id);
    if (id === "ledger") runtimeRef.current?.audio.paperScratch(0.9);
    commitCheckpoint((current) => ({
      ...current,
      earnedFlags: unique([...current.earnedFlags, `prologue.evidence.${id}`]),
    }));
    setStoryIndex(0);
    setPhase("explore");
    document.exitPointerLock?.();
  }, [commitCheckpoint, setPhase]);

  const inspectEvidence = useCallback((id: EvidenceId) => {
    if (id === "umbrella" || id === "ledger") {
      setStoryIndex(0);
      setAmbientLine(undefined);
      setPhase(id === "umbrella" ? "front-hall" : "departure-record");
      document.exitPointerLock?.();
      return;
    }
    finishEvidenceDialogue(id);
  }, [finishEvidenceDialogue, setPhase]);

  const finishBaselineDialogue = useCallback(() => {
    commitCheckpoint((current) => ({
      ...current,
      earnedFlags: unique([...current.earnedFlags, "prologue.baseline.intro-seen"]),
    }));
    setStoryIndex(0);
    setAmbientLine(undefined);
    setPhase("explore");
    requestPointerLock();
  }, [commitCheckpoint, requestPointerLock, setPhase]);

  const finishPrologue = useCallback(() => {
    const finalCheckpoint = commitCheckpoint((current) => ({
      ...current,
      anchorId: "ROUTE_02_A_ENTRY",
      mechanics: { ...current.mechanics, safeAnchorId: "ROUTE_02_A_ENTRY" },
      activeObjectiveId: undefined,
      objectiveStepId: undefined,
      earnedFlags: unique([...current.earnedFlags, ...chapter.completionFlags]),
    }));
    const nextSave: CampaignSave = {
      ...saveRef.current,
      activeCheckpoint: finalCheckpoint,
      completedChapters: unique([...saveRef.current.completedChapters, chapter.id]),
      unlockedChapters: unique([...saveRef.current.unlockedChapters, "west-corridor-loop"]),
    };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    setPhase("complete");
    window.setTimeout(onContinue, 550);
  }, [chapter.completionFlags, chapter.id, commitCheckpoint, onContinue, setPhase]);

  useEffect(() => {
    if (phase !== "title" || titleSettled) return;
    const timer = window.setTimeout(() => setTitleSettled(true), 800);
    return () => window.clearTimeout(timer);
  }, [phase, titleSettled]);

  useEffect(() => {
    if (phase !== "title" || !titleSettled) return;
    const timer = window.setTimeout(finishPrologue, 900);
    return () => window.clearTimeout(timer);
  }, [finishPrologue, phase, titleSettled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let removeResize: (() => void) | undefined;

    const boot = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const visualMode = process.env.NODE_ENV === "development" && params.get("visualTest") === "1";
        const visualScenarioValue = params.get("visualScenario");
        const visualScenario = visualScenarioValue && visualScenarioValue in PROLOGUE_VISUAL_AUDIT_POSES
          ? visualScenarioValue as PrologueVisualScenario
          : undefined;
        // visualTest is also used for manual browser inspection. It must not
        // silently delete the prologue narrative. Only an explicit regression
        // scenario or skipNarrative=1 is allowed to jump straight into gameplay.
        const skipNarrative = visualMode && (Boolean(visualScenario) || params.get("skipNarrative") === "1");
        const auditPose = visualScenario ? PROLOGUE_VISUAL_AUDIT_POSES[visualScenario] : undefined;
        const renderer = await createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality });
        const anchor = getGameplayAnchor("ROUTE_01_START");
        const savedPosition = initialCheckpoint.position;
        // V3.0 saves may still contain the old ROUTE_01 pose inside
        // MOD_A_LargeTree. Migrate only that obstructed pocket; valid progress
        // elsewhere in the prologue remains untouched.
        const isFormerFloatingSpawn = Boolean(savedPosition && (
          Math.hypot(savedPosition[0] - 10.8, savedPosition[2] - 50.2) < 1.2
          || Math.hypot(savedPosition[0] - 9.0, savedPosition[2] - 48.1) < 0.8
          || Math.hypot(savedPosition[0] - 7.8, savedPosition[2] - 47.8) < 0.8
          || Math.hypot(savedPosition[0] - 7.25, savedPosition[2] - 46.95) < 0.9
        ));
        const restored = skipNarrative || (savedPosition && (isInsideLegacyTreeSpawn(savedPosition) || isFormerFloatingSpawn))
          ? undefined
          : savedPosition;
        const spawnPosition = auditPose?.position ?? restored ?? anchor.position;
        const spawn = { x: spawnPosition[0], y: Math.max(spawnPosition[1], GAMEPLAY_ANCHOR_REFERENCE_Y), z: spawnPosition[2] };
        const prologueColliders = [...tingYuXuanLayout.colliders, ...tingYuXuanPrologueColliders] as LayoutCollider[];
        const physics = await PhysicsController.create(spawn, prologueColliders);
        physics.setColliderEnabled("prologue-gate-lock", false);
        if (cancelled) { physics.dispose(); renderer.dispose(); return; }
        const world = await TingYuXuanScene.create(chapter.memories, save.settings.quality, renderer.renderer);
        registerArchitectureCollisionCoverage(world, physics, canvas);
        if (cancelled) { physics.dispose(); world.dispose(); renderer.dispose(); return; }
        world.setMemory("baseline");
        const audio = new AudioAtmosphere();
        const cameraRig = new CameraRig(world.camera, physics, {
          smoothTime: save.settings.stableCamera ? 0.1 : 0.12,
        });
        const interaction = new InteractionController();
        const visuals = await buildPrologueVisuals(world);
        if (visualScenario === "wall-scale" || visualScenario === "door-scale") {
          visuals.steward.visible = false;
          Object.values(visuals.evidence).forEach((item) => { if (item) item.visible = false; });
        }

        PROLOGUE_EVIDENCE.filter((item) => item.id !== "shoes").forEach((item) => {
          const evidenceId = item.id as EvidenceId;
          interaction.registerPoint({
            id: `prologue-${item.id}`,
            type: "evidence",
            label: item.label,
            maxDistance: INTERACTION_RANGE_CALIBRATION.prologueEvidence,
            enabledWhen: () => phaseRef.current === "explore" && !cluesRef.current.has(evidenceId),
            onInteract: () => inspectEvidence(evidenceId),
          }, new THREE.Vector3(item.position[0], GAMEPLAY_ANCHOR_REFERENCE_Y, item.position[2]), INTERACTION_RANGE_CALIBRATION.standardProxyRadius);
        });
        interaction.registerPoint({
          id: "prologue-steward",
          type: "npc",
          label: "[F] 和老周去水榭外看看",
          maxDistance: INTERACTION_RANGE_CALIBRATION.npc,
          enabledWhen: () => phaseRef.current === "explore"
            && cluesRef.current.has("umbrella")
            && cluesRef.current.has("ledger")
            && landmarksRef.current.size >= 3
            && !checkpointRef.current.earnedFlags.includes("prologue.water-pavilion.seen"),
          onInteract: beginWaterPavilionDialogue,
        }, new THREE.Vector3(PROLOGUE_STEWARD_POINT.position[0], 1.0, PROLOGUE_STEWARD_POINT.position[2]), INTERACTION_RANGE_CALIBRATION.npcProxyRadius);

        yawRef.current = auditPose?.yaw ?? (restored ? (initialCheckpoint.yaw ?? anchor.yaw) : anchor.yaw);
        cameraRig.syncExploration(new THREE.Vector3(spawn.x, spawn.y, spawn.z), yawRef.current, pitchRef.current, true);
        runtimeRef.current = { renderer, world, physics, audio, cameraRig, interaction, visuals };
        setBackend(renderer.backend);
        canvas.dataset.rendererBackend = renderer.backend;
        canvas.dataset.antialias = String(renderer.antialias);
        canvas.dataset.shadowsEnabled = String(renderer.shadowsEnabled);
        canvas.dataset.architectureMode = world.architectureMode();
        canvas.dataset.visualScenario = visualScenario ?? "";
        canvas.dataset.characterHeight = TINGYUXUAN_MASTER_SCALE_CALIBRATION.characterHeight.toFixed(3);
        canvas.dataset.wallHeight = TINGYUXUAN_MASTER_SCALE_CALIBRATION.wallHeight.toFixed(3);
        canvas.dataset.doorHeight = TINGYUXUAN_MASTER_SCALE_CALIBRATION.doorHeight.toFixed(3);
        canvas.dataset.masterScaleFactor = TINGYUXUAN_MASTER_SCALE_CALIBRATION.scaleFactor.toFixed(3);
        canvas.dataset.cameraFov = world.camera.fov.toFixed(1);
        canvas.dataset.streaming = "true";
        void world.ensureAreaAssets({ x: spawn.x, z: spawn.z })
          .then(() => {
            canvas.dataset.assetsReady = "true";
            canvas.dataset.streaming = "false";
          })
          .catch((reason) => {
            if (cancelled) return;
            setError(reason instanceof Error ? reason.message : "序章区域资产加载失败");
            setPhase("error");
          });

        const resize = () => {
          const rect = canvas.getBoundingClientRect();
          renderer.resize(rect.width, rect.height, window.devicePixelRatio);
          world.camera.aspect = rect.width / Math.max(rect.height, 1);
          world.camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);
        removeResize = () => window.removeEventListener("resize", resize);

        // Precompile the current Master + all registered lights while the prologue
        // is still booting. Range lights remain present in the renderer light set
        // for the whole session, so entering a lit courtyard no longer has to
        // compile a new WebGPU/WebGL lighting pipeline on the gameplay frame.
        canvas.dataset.pipelineWarmup = "warming";
        await renderer.renderer.compileAsync(world.scene, world.camera);
        canvas.dataset.pipelineWarmup = "ready";

        let previous = performance.now();
        let telemetryFrames = 0;
        let telemetryWindowStarted = previous;
        renderer.renderer.setAnimationLoop((now: number) => {
          const delta = Math.min((now - previous) / 1000, 0.05);
          previous = now;
          let pose = physics.pose();
          const playable = (phaseRef.current === "explore" || phaseRef.current === "enter") && !inspectionRef.current && !panelRef.current;
          if (playable) {
            const forward = Number(keysRef.current.has("KeyW")) - Number(keysRef.current.has("KeyS"));
            const strafe = Number(keysRef.current.has("KeyD")) - Number(keysRef.current.has("KeyA"));
            const turn = Number(keysRef.current.has("ArrowRight")) - Number(keysRef.current.has("ArrowLeft"));
            yawRef.current -= turn * 1.8 * delta;
            const speed = keysRef.current.has("ShiftLeft") ? PLAYER_PHYSICS_CALIBRATION.fastWalkSpeed : PLAYER_PHYSICS_CALIBRATION.walkSpeed;
            const sin = Math.sin(yawRef.current);
            const cos = Math.cos(yawRef.current);
            pose = physics.move({
              x: (forward * -sin + strafe * cos) * speed * delta,
              y: 0,
              z: (forward * -cos - strafe * sin) * speed * delta,
            }, delta);
          }
          const player = new THREE.Vector3(pose.x, pose.y, pose.z);
          const moving = playable && (keysRef.current.has("KeyW") || keysRef.current.has("KeyA") || keysRef.current.has("KeyS") || keysRef.current.has("KeyD"));
          visuals.player.update(pose, yawRef.current, moving, delta);
          cameraRig.syncExploration(player, yawRef.current, pitchRef.current);
          cameraRig.update(delta);
          if (now - lastMapUpdateRef.current >= 160) {
            lastMapUpdateRef.current = now;
            setMapPose({ x: pose.x, z: pose.z, yaw: yawRef.current });
          }
          canvas.dataset.cameraCollisionId = physics.cameraCollisionId() ?? "";
          if (visualMode) {
            const sightline = player.clone().add(new THREE.Vector3(0, 0.35, 0)).sub(world.camera.position);
            const sightlineDistance = sightline.length();
            const raycaster = new THREE.Raycaster(world.camera.position, sightline.normalize(), 0.05, sightlineDistance);
            canvas.dataset.spawnVisualOccluders = raycaster.intersectObject(world.visualAssets, true)
              .filter((hit) => {
                let current: THREE.Object3D | null = hit.object;
                while (current) {
                  if (!current.visible) return false;
                  current = current.parent;
                }
                return true;
              })
              .map((hit) => hit.object.name || hit.object.parent?.name || "unnamed")
              .filter((name, index, names) => names.indexOf(name) === index)
              .slice(0, 8)
              .join(",");
            if (!canvas.dataset.spawnScreenSamples) {
              const visibleInHierarchy = (object: THREE.Object3D) => {
                let current: THREE.Object3D | null = object;
                while (current) {
                  if (!current.visible) return false;
                  current = current.parent;
                }
                return true;
              };
              const samples = [
                [0.22, -0.38], [0.32, -0.48], [0.42, -0.5],
                [0.24, -0.6], [0.36, -0.62], [0.48, -0.62],
                [-0.42, -0.12], [0.38, -0.12], [0.62, -0.14], [0.82, -0.18],
              ] as const;
              canvas.dataset.spawnScreenSamples = samples.map(([x, y]) => {
                const screenRay = new THREE.Raycaster();
                screenRay.setFromCamera(new THREE.Vector2(x, y), world.camera);
                const hit = screenRay.intersectObject(world.visualAssets, true)
                  .find((candidate) => {
                    if (!visibleInHierarchy(candidate.object)) return false;
                    const candidateMesh = candidate.object as THREE.Mesh;
                    const candidateMaterials = Array.isArray(candidateMesh.material) ? candidateMesh.material : [candidateMesh.material];
                    return candidateMaterials.some((candidateMaterial) => candidateMaterial && !candidateMaterial.transparent && candidateMaterial.opacity >= 0.99);
                  });
                if (!hit) return `${x}/${y}=none`;
                const hierarchy: string[] = [];
                let current: THREE.Object3D | null = hit.object;
                while (current && hierarchy.length < 4) {
                  hierarchy.push(current.name || `<${current.type}>`);
                  current = current.parent;
                }
                const mesh = hit.object as THREE.Mesh;
                const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
                const color = material && "color" in material && material.color instanceof THREE.Color
                  ? `#${material.color.getHexString()}`
                  : "no-color";
                const bounds = new THREE.Box3().setFromObject(hit.object);
                const center = bounds.getCenter(new THREE.Vector3()).toArray().map((value) => value.toFixed(1)).join("/");
                const min = bounds.min.toArray().map((value) => value.toFixed(2)).join("/");
                const max = bounds.max.toArray().map((value) => value.toFixed(2)).join("/");
                const point = hit.point.toArray().map((value) => value.toFixed(2)).join("/");
                return `${x}/${y}=${hierarchy.join("<")}[${material?.name || material?.type || "unnamed-material"},${mesh.geometry?.type || hit.object.type},${color},center:${center},min:${min},max:${max},hit:${point}]`;
              }).join(";");
            }
          }
          world.update(delta, player, false);

          const currentGuidance = resolvePrologueGuidance(checkpointRef.current, phaseRef.current);
          const currentGuidanceKey = currentGuidance?.key ?? "";
          if (currentGuidanceKey !== guidanceKeyRef.current) {
            guidanceKeyRef.current = currentGuidanceKey;
            guidanceElapsedRef.current = 0;
            guidanceLevelRef.current = 0;
            setGuidanceLevel(0);
          } else if (playable && saveRef.current.settings.guidanceAssist && currentGuidance) {
            guidanceElapsedRef.current += delta;
            const nextLevel = guidanceLevelForElapsed(guidanceElapsedRef.current);
            if (nextLevel > guidanceLevelRef.current) {
              guidanceLevelRef.current = nextLevel;
              setGuidanceLevel(nextLevel);
              if (nextLevel === 2) {
                const hint = `老周：${currentGuidance.spokenHint}`;
                setAmbientLine(hint);
                window.setTimeout(() => setAmbientLine((line) => line === hint ? undefined : line), 5200);
              }
            }
          }

          if (!visualScenario && phaseRef.current === "explore" && !inspectionRef.current) {
            const flags = checkpointRef.current.earnedFlags;
            const hasRequiredFrontHallEvidence = cluesRef.current.has("umbrella") && cluesRef.current.has("ledger");
            const baselineIntroSeen = flags.includes("prologue.baseline.intro-seen");
            const baselineAnchor = getGameplayAnchor("A_BASELINE");

            if (hasRequiredFrontHallEvidence
              && !baselineIntroSeen
              && Math.hypot(pose.x - baselineAnchor.position[0], pose.z - baselineAnchor.position[2]) <= 1.6) {
              setStoryIndex(0);
              setAmbientLine(undefined);
              setPhase("baseline");
              document.exitPointerLock?.();
            } else if (baselineIntroSeen) {
              for (const landmark of PROLOGUE_LANDMARKS) {
                if (landmarksRef.current.has(landmark.id)) continue;
                if (distance2D(pose, landmark.position) > (landmark.radius ?? 1.25)) continue;
                landmarksRef.current.add(landmark.id);
                commitCheckpoint((current) => ({
                  ...current,
                  earnedFlags: unique([...current.earnedFlags, `prologue.baseline.${landmark.id}`]),
                }));
                // 场景 0-4 的生活对话已经由 PROLOGUE_BASELINE_LINES 完整呈现。
                // 自由走动阶段只记录玩家实际经过的空间，不再追加 Runtime 自创悬疑旁白。
              }

              const anomalyReady = landmarksRef.current.size >= 3
                && flags.includes("prologue.water-pavilion.seen")
                && !anomalyTriggeredRef.current;
              if (anomalyReady && distance2D(pose, PROLOGUE_ANOMALY_POINT.position) <= (PROLOGUE_ANOMALY_POINT.radius ?? 2)) {
                anomalyTriggeredRef.current = true;
                visuals.anomalyWall.visible = true;
                setCinematicBackdrop("prologue.anomaly");
                setAmbientLine(undefined);
                setStoryIndex(0);
                setPhase("anomaly");
                document.exitPointerLock?.();
              }
            }
          }

          if (visualScenario) {
            interaction.clearFocus();
            setPrompt(undefined);
            world.setGuidanceTarget(undefined);
          } else if (phaseRef.current === "explore" && !inspectionRef.current) {
            const focus = interaction.focus(world.camera, world.camera.position);
            setPrompt((current) => current === focus?.definition.label ? current : focus?.definition.label);
            const target = currentGuidance?.target;
            world.setGuidanceTarget(saveRef.current.settings.guidanceAssist && guidanceLevelRef.current >= 3 && target
              ? new THREE.Vector3(target.x, 0, target.z)
              : undefined, "subtle");
          } else if (phaseRef.current === "enter") {
            setPrompt(undefined);
            const target = getGameplayAnchor("ROUTE_02_A_ENTRY");
            world.setGuidanceTarget(saveRef.current.settings.guidanceAssist && guidanceLevelRef.current >= 3
              ? new THREE.Vector3(target.position[0], 0, target.position[2])
              : undefined, "subtle");
            if (Math.hypot(pose.x - target.position[0], pose.z - target.position[2]) < 1.35) {
              commitCheckpoint((current) => ({
                ...current,
                anchorId: "ROUTE_02_A_ENTRY",
                earnedFlags: unique([...current.earnedFlags, "prologue.entered-a"]),
              }));
              setStoryIndex(0);
              setAmbientLine(undefined);
              setPhase("explore");
            }
          } else {
            setPrompt(undefined);
            world.setGuidanceTarget(undefined);
          }
          canvas.dataset.playerPose = `${pose.x.toFixed(2)},${pose.y.toFixed(2)},${pose.z.toFixed(2)}`;
          canvas.dataset.playerAvatarVisible = String(visuals.player.root.visible && visuals.player.root.parent !== null);
          canvas.dataset.cameraPose = `${world.camera.position.x.toFixed(2)},${world.camera.position.y.toFixed(2)},${world.camera.position.z.toFixed(2)}`;
          canvas.dataset.grounded = String(physics.isGrounded());
          canvas.dataset.gameplayArea = resolveGameplayRegionForPoint({ x: pose.x, z: pose.z });
          const nearestRoute = resolveNearestRouteAnchor({ x: pose.x, z: pose.z });
          canvas.dataset.nearestRouteAnchor = nearestRoute.id;
          canvas.dataset.nearestRouteDistance = nearestRoute.distance.toFixed(2);
          canvas.dataset.prologuePhase = phaseRef.current;
          canvas.dataset.prologueClues = String(cluesRef.current.size);
          renderer.renderer.render(world.scene, world.camera);
          telemetryFrames += 1;
          if (now - telemetryWindowStarted >= 500) {
            const renderInfo = renderer.renderer.info.render as { calls?: number; triangles?: number; points?: number };
            canvas.dataset.fps = (telemetryFrames * 1000 / (now - telemetryWindowStarted)).toFixed(1);
            canvas.dataset.drawCalls = String(renderInfo.calls ?? 0);
            canvas.dataset.triangles = String(renderInfo.triangles ?? 0);
            canvas.dataset.points = String(renderInfo.points ?? 0);
            const profileStats = world.profileStats();
            canvas.dataset.materials = String(profileStats.materials);
            canvas.dataset.textures = String(profileStats.textures);
            canvas.dataset.lights = String(profileStats.lights);
            canvas.dataset.shadowCasterCount = String(profileStats.shadowCasters);
            canvas.dataset.renderWidth = String(canvas.width);
            canvas.dataset.renderHeight = String(canvas.height);
            canvas.dataset.pixelRatio = renderer.renderer.getPixelRatio().toFixed(3);
            canvas.dataset.profileVariant = world.profileVariant();
            canvas.dataset.visibleModels = world.visibleModelNames().join(",");
            canvas.dataset.loadedAssetIds = world.loadedAssetIds().join(",");
            canvas.dataset.loadedAssetBytes = String(world.loadedAssetBytes());
            telemetryFrames = 0;
            telemetryWindowStarted = now;
          }
        });

        canvas.dataset.runtimeReady = "true";
        const restoredFlags = new Set(initialCheckpoint.earnedFlags);
        const restoredPhase: ProloguePhase = skipNarrative
          ? "explore"
          : restoredFlags.has("prologue.first-anomaly")
            ? "title"
            : restoredFlags.has("prologue.entered-a")
              || restoredFlags.has("prologue.evidence.umbrella")
              || restoredFlags.has("prologue.evidence.ledger")
              || restoredFlags.has("prologue.baseline.intro-seen")
              || restoredFlags.has("prologue.water-pavilion.seen")
              ? "explore"
              : restoredFlags.has("prologue.gate-dialogue.seen")
                ? "enter"
                : "gate";
        setPhase(restoredPhase);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "序章场景初始化失败");
        setPhase("error");
      }
    };

    void boot();
    return () => {
      cancelled = true;
      removeResize?.();
      const runtime = runtimeRef.current;
      runtime?.renderer.renderer.setAnimationLoop(null);
      runtime?.interaction.dispose();
      runtime?.cameraRig.dispose();
      runtime?.audio.dispose();
      runtime?.physics.dispose();
      runtime?.world.dispose();
      runtime?.renderer.dispose();
      runtimeRef.current = undefined;
    };
  // The runtime is intentionally booted once; phase/inspection are read through refs/state gates.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === "Escape") {
        event.preventDefault();
        if (panelRef.current === "tutorial" && !panelReturnRef.current) return;
        if (panelRef.current) closeRuntimePanel();
        else openRuntimePanel("pause");
        return;
      }
      if (event.code === "KeyH") {
        event.preventDefault();
        if (panelRef.current === "help") closeRuntimePanel();
        else openRuntimePanel("help");
        return;
      }
      if (event.code === "KeyM" && (phaseRef.current === "explore" || phaseRef.current === "enter")) {
        event.preventDefault();
        if (panelRef.current === "map") closeRuntimePanel();
        else openRuntimePanel("map");
        return;
      }
      if (event.code === "KeyN" && (phaseRef.current === "explore" || phaseRef.current === "enter")) {
        event.preventDefault();
        if (panelRef.current === "case-file") closeRuntimePanel();
        else if (!panelRef.current) openRuntimePanel("case-file");
        return;
      }
      if (panelRef.current) return;
      if (event.code === "Space" && (phaseRef.current === "explore" || phaseRef.current === "enter") && !inspectionRef.current) {
        event.preventDefault();
        runtimeRef.current?.physics.requestJump();
        return;
      }
      keysRef.current.add(event.code);
      if (["ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
      if (event.code === "KeyF" && phaseRef.current === "explore" && !inspectionRef.current) runtimeRef.current?.interaction.interact();
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvasRef.current) return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0018, -1.12, 1.05);
    };
    const onLock = () => setHasPointerLock(document.pointerLockElement === canvasRef.current);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onLock);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onLock);
    };
  }, [closeRuntimePanel, inspection, openRuntimePanel]);

  const isNarrativePhase = (PROLOGUE_CANONICAL_SCENE_ORDER as readonly string[]).includes(phase);
  const story: readonly PrologueStoryLine[] = isNarrativePhase
    ? PROLOGUE_STORY_BY_PHASE[phase as PrologueNarrativePhase]
    : [];
  const currentStoryLine = story[storyIndex];
  const currentStorySpeaker = currentStoryLine?.kind === "spoken"
    ? currentStoryLine.speaker ?? "旁白"
    : currentStoryLine?.kind === "inner"
      ? "赵映 · 心声"
      : currentStoryLine?.kind === "action"
        ? "演出"
        : "环境";
  const activeStorySpeaker = currentStoryLine?.kind === "inner" ? "赵映" : currentStoryLine?.speaker;
  const showStoryPortraits = currentStoryLine?.kind === "spoken" || currentStoryLine?.kind === "inner";
  const zhaoyingProfile = speakerProfiles.zhaoying;
  const stewardProfile = speakerProfiles.steward;
  const zhaoyingStandee = zhaoyingProfile?.portraits[zhaoyingProfile.defaultPortrait] ?? "/media/portraits/zhaoying-calm.webp";
  const stewardStandee = stewardProfile?.portraits[stewardProfile.defaultPortrait] ?? "/media/portraits/steward-courteous.webp";
  const renderedClues = new Set<EvidenceId>((["umbrella", "ledger"] as EvidenceId[])
    .filter((id) => checkpoint.earnedFlags.includes(`prologue.evidence.${id}`)));
  const clueCount = renderedClues.size;
  const currentGuidance = resolvePrologueGuidance(checkpoint, phase);
  const objective = currentGuidance?.title;
  const mapRegion = resolveGameplayRegionForPoint(mapPose);
  const guidanceDistance = currentGuidance?.target
    ? Math.hypot(mapPose.x - currentGuidance.target.x, mapPose.z - currentGuidance.target.z)
    : undefined;

  const advanceStory = () => {
    if (storyIndex < story.length - 1) {
      setStoryIndex((value) => value + 1);
      return;
    }
    if (phase === "gate") finishGateDialogue();
    else if (phase === "front-hall") finishEvidenceDialogue("umbrella");
    else if (phase === "departure-record") finishEvidenceDialogue("ledger");
    else if (phase === "baseline") finishBaselineDialogue();
    else if (phase === "water") finishWaterPavilionDialogue();
    else if (phase === "anomaly") finishAnomalyDialogue();
  };

  const inspectionContent = useMemo(() => {
    if (!inspection) return undefined;
    return PROLOGUE_EVIDENCE.find((item) => item.id === inspection);
  }, [inspection]);

  return (
    <main className="runtime prologue-runtime" data-renderer={backend}>
      <canvas
        ref={canvasRef}
        className="runtime-canvas"
        tabIndex={0}
        role="button"
        aria-label="序章：回园"
        onClick={() => (phase === "explore" || phase === "enter") && !inspection && !runtimePanel && requestPointerLock()}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && (phase === "explore" || phase === "enter") && !inspection) {
            event.preventDefault();
            requestPointerLock();
          }
        }}
      />
      <div className="vignette prologue-vignette" aria-hidden="true" />
      <header className="runtime-topbar prologue-topbar">
        <button type="button" className="text-button" onClick={onExit}>← 返回案卷</button>
        <div><span>序章</span><strong>回园</strong></div>
        <div className="runtime-status"><i className="status-dot" /> 听雨轩园门</div>
      </header>

      {objective && <aside className="objective-card prologue-objective"><span>当前任务</span><strong>{objective}</strong><p>{currentGuidance?.description}</p>{currentGuidance?.subtasks && <ul>{currentGuidance.subtasks.map((task) => <li key={task.id} className={task.complete ? "complete" : ""}><i>{task.complete ? "✓" : ""}</i>{task.label}</li>)}</ul>}{guidanceLevel >= 1 && guidanceDistance !== undefined && currentGuidance?.target && <small>{currentGuidance.target.label} · {Math.max(1, Math.round(guidanceDistance))}m</small>}</aside>}
      {(phase === "explore" || phase === "enter") && <MiniMap pose={mapPose} regionId={mapRegion} target={guidanceLevel >= 1 ? currentGuidance?.target : undefined} onOpen={() => openRuntimePanel("map")} />}
      {prompt && !inspection && <div className="interaction-prompt">{prompt}</div>}
      {ambientLine && !inspection && !currentStoryLine && <div className="bark-subtitle"><NarrativeInline kind="narration" text={ambientLine} /></div>}
      {(phase === "explore" || phase === "enter") && !hasPointerLock && !inspection && !runtimePanel && <button type="button" className="resume-control" onClick={requestPointerLock}><span>继续调查</span><small>点击后继续当前调查</small></button>}

      {isNarrativePhase && currentStoryLine && <div className="prologue-story-stage" data-story-kind={currentStoryLine.kind} onClick={advanceStory} onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); advanceStory(); }
      }} role="button" aria-label="继续序章剧情" tabIndex={0}>
        {phase === "gate" && <StoryBackdrop id="prologue.gate" label="雨夜园门与老周" />}
        {phase === "anomaly" && cinematicBackdrop && <StoryBackdrop id={cinematicBackdrop} label="第一次空间异常" />}
        {showStoryPortraits && <>
          <div className={`portrait portrait-left prologue-standee ${activeStorySpeaker === "赵映" ? "active" : "inactive"}`}><img src={zhaoyingStandee} alt="赵映" /></div>
          <div className={`portrait portrait-right prologue-standee ${activeStorySpeaker === "老周" ? "active" : "inactive"}`}><img src={stewardStandee} alt="老周" /></div>
        </>}
        <div className="prologue-story-card">
          <span>{currentStorySpeaker}</span>
          <p>{currentStoryLine.text}</p>
          <small>点击继续</small>
        </div>
      </div>}

      {inspection === "ledger" && <DocumentViewer document={PROLOGUE_DEPARTURE_DOCUMENT} onClose={() => { inspectionRef.current = undefined; setInspection(undefined); requestPointerLock(); }} />}
      {inspection && inspection !== "ledger" && inspectionContent && <section className="prologue-inspection-backdrop" role="dialog" aria-modal="true">
        <article className="prologue-inspection-card">
          <span>前厅旧物 · {clueCount} / 2</span>
          <h2>{inspectionContent.title}</h2>
          {inspection === "umbrella" && <img className="chapter-cg-inline" src="/media/cg/story-v1/cg-02-family-portrait-v1.png" alt="听雨轩旧日合影，年少赵映站在沈家众人之间" />}
          <p>{inspectionContent.body}</p>
          <blockquote>{inspectionContent.note}</blockquote>
          <button type="button" className="primary-button" onClick={() => { inspectionRef.current = undefined; setInspection(undefined); requestPointerLock(); }}>收起</button>
        </article>
      </section>}

      {phase === "title" && <section className="prologue-title-screen">
        <div><span>序章</span><h1>回园</h1>{titleSettled && <p>第一章 · 不存在的路</p>}</div>
      </section>}

      {phase === "loading" && <PrologueModal title="雨夜正在回到听雨轩"><p>园门、回廊与水声正在雨里显现。</p></PrologueModal>}
      {phase === "error" && <PrologueModal title="序章未能启动"><p>{error}</p><button type="button" className="primary-button" onClick={onExit}>返回案卷</button></PrologueModal>}

      {runtimePanel === "case-file" && <CaseFilePanel checkpoint={checkpoint} completedChapters={save.completedChapters} chapterTitle="序章 · 回园" onClose={closeRuntimePanel} onOpenMap={() => openRuntimePanel("map", "case-file")} />}
      {runtimePanel === "tutorial" && <TutorialGuide onStart={finishTutorial} />}
      {runtimePanel === "map" && <FullMap pose={mapPose} regionId={mapRegion} target={guidanceLevel >= 1 ? currentGuidance?.target : undefined} objective={objective ?? "确认当前空间"} openRegions={["AREA_A"]} onClose={closeRuntimePanel} />}
      {runtimePanel === "pause" && <PauseMenu onResume={closeRuntimePanel} onMap={() => openRuntimePanel("map", "pause")} onHelp={() => openRuntimePanel("help", "pause")} onSettings={() => openRuntimePanel("settings", "pause")} onExit={onExit} />}
      {runtimePanel === "help" && <HelpPanel chapterTitle="序章 · 回园" onTutorial={() => openRuntimePanel("tutorial", "help")} onClose={closeRuntimePanel} />}
      {runtimePanel === "settings" && <RuntimeSettingsPanel settings={save.settings} onChange={updateRuntimeSettings} onClose={closeRuntimePanel} />}
    </main>
  );
}

function PrologueModal({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop"><section className="runtime-modal"><p className="eyebrow">序章</p><h1>{title}</h1>{children}</section></div>;
}
