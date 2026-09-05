"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { completeCampaignChapter } from "./campaign-progress";
import { markTutorialSeen, shouldShowTutorial } from "./tutorial-state";
import { createCheckpoint } from "./campaign-save";
import { DialogueRunner } from "./narrative/DialogueRunner";
import { StoryBackdrop } from "./narrative/StoryBackdrop";
import type { StoryBackdropId } from "./narrative/story-backdrops";
import { NarrativeInline } from "./narrative/NarrativeInline";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueCommand, DialogueSequence, MemoryId } from "./types";
import { AudioAtmosphere, audioZoneForLayoutZones } from "./runtime/AudioAtmosphere";
import { registerArchitectureCollisionCoverage } from "./runtime/architecture-collision-runtime";
import { CameraRig } from "./mechanics/CameraRig";
import { BorrowAnchorController } from "./mechanics/BorrowAnchorController";
import { BorrowedViewPortal } from "./mechanics/BorrowedViewPortal";
import { InteractionController, INTERACTION_RANGE_CALIBRATION } from "./mechanics/InteractionController";
import { ObjectInspectionController, type ObjectInspectionDefinition } from "./mechanics/ObjectInspectionController";
import { ObjectiveDirector, objectiveProgressKey, resolveActiveObjective, type ActiveObjective } from "./runtime/ObjectiveDirector";
import { guidanceLevelForElapsed, guidanceLevelForProximity } from "./runtime/guidance-config";
import { resolveObjectiveStepPosition } from "./runtime/objective-target";
import { PhysicsController, PLAYER_PHYSICS_CALIBRATION } from "./runtime/PhysicsController";
import { PLAYER_BODY_CALIBRATION } from "./runtime/player-calibration";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { TingYuXuanScene, type SceneInteractable } from "./runtime/TingYuXuanScene";
import { PlayerAvatar } from "./runtime/PlayerAvatar";
import { createChapterCompletePayload } from "./runtime/chapter-behavior";
import { getGameplayAnchor, resolveGameplayRegionForPoint, resolveNearestRouteAnchor, tingYuXuanRouteAnchors } from "./runtime/tingyuxuan-gameplay-map";
import { containsLayoutPoint, getLayoutAnchor, getLayoutTrigger, resolveLayoutTriggerDestination, resolveLayoutZonesForPoint, tingYuXuanLayout } from "./runtime/tingyuxuan-layout";
import {
  CH1_ANCHOR_TARGET,
  CH1_BORROWABLES,
  CH1_BORROWED_VIEW_POINT,
  CH1_BORROW_SOURCE,
  CH1_REWARD_COURTYARD,
  CH1_REWARD_POINTS,
  CH1_TRACES,
  CH1_TRACE_SEARCH_AREA,
  countFlags,
  distance2D,
  type SliceEvidenceDefinition,
} from "./runtime/vertical-slice-content";
import { buildChapterOneSliceVisuals, setSliceObjectOpacity, type ChapterOneSliceVisuals } from "./runtime/vertical-slice-visuals";
import { CaseFilePanel } from "./ui/CaseFilePanel";
import { FullMap } from "./ui/FullMap";
import { HelpPanel } from "./ui/HelpPanel";
import { ExplorationHud } from "./ui/ExplorationHud";
import { MiniMap, type RuntimeMapTarget } from "./ui/MiniMap";
import { ObjectInspector } from "./ui/ObjectInspector";
import { PauseMenu, RuntimeSettingsPanel } from "./ui/PauseMenu";
import { TutorialGuide } from "./ui/TutorialGuide";

type RuntimePhase = "loading" | "dialogue" | "playing" | "complete" | "error";
type RuntimePanel = "tutorial" | "case-file" | "map" | "pause" | "help" | "settings";

interface GameRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
  onContinue: () => void;
}

interface DebugTelemetry {
  position: [number, number, number];
  fps: number;
  areaId: string;
  routeAnchorId: string;
  routeDistance: number;
  grounded: boolean;
  architecture: "master" | "legacy";
}

interface SliceInspection {
  id: string;
  title: string;
  body: string;
  note: string;
}

interface ActiveObjectInspection {
  id: string;
  contextLabel: string;
  confirmLabel: string;
  controller: ObjectInspectionController;
  onConfirm?: () => void;
}

const unique = <T,>(values: T[]) => [...new Set(values)];

const resolveChapterOneObjectivePosition = (checkpoint: CheckpointState, objective?: ActiveObjective) => {
  if (objective?.objective.id === "west-loop"
    && objective.step.id === "inspect-seventh-window"
    && !checkpoint.earnedFlags.includes("west.loop-return.seen")) {
    return getGameplayAnchor("ROUTE_03_A_LOOP").position;
  }
  return objective ? resolveObjectiveStepPosition(objective.step) : undefined;
};

function resolveChapterOneMapTarget(checkpoint: CheckpointState): RuntimeMapTarget | undefined {
  const flags = checkpoint.earnedFlags;
  const traceCount = countFlags(flags, "west.trace.");
  const rewardCount = CH1_REWARD_POINTS.filter((item) => flags.includes(item.flag)).length;
  if (flags.includes("west.arrived") && !checkpoint.contradictions.includes("waterline-direction") && traceCount < 3) {
    return { x: CH1_TRACE_SEARCH_AREA.position[0], z: CH1_TRACE_SEARCH_AREA.position[2], label: CH1_TRACE_SEARCH_AREA.label, radius: CH1_TRACE_SEARCH_AREA.radius, approximate: true };
  }
  if (flags.includes("west.borrowed-view.ready") && !flags.includes("west.borrowed-view.seen")) {
    return { x: CH1_BORROWED_VIEW_POINT.position[0], z: CH1_BORROWED_VIEW_POINT.position[2], label: "漏窗" };
  }
  if (flags.includes("west.borrowed-view.seen") && !flags.includes("west.borrowed.threshold-stone")) {
    return { x: CH1_BORROW_SOURCE.position[0], z: CH1_BORROW_SOURCE.position[2], label: "沈夫人记得的门槛踏石" };
  }
  if (flags.includes("west.borrowed.threshold-stone") && !checkpoint.mechanics.borrowedObject?.anchored) {
    return { x: CH1_ANCHOR_TARGET.position[0], z: CH1_ANCHOR_TARGET.position[2], label: "循环地标前的踏石位置" };
  }
  if (checkpoint.mechanics.borrowedObject?.anchored && !flags.includes("west.loop-broken")) {
    return { x: CH1_REWARD_COURTYARD.position[0], z: CH1_REWARD_COURTYARD.position[2], label: "循环外的新落脚点" };
  }
  if (flags.includes("west.loop-broken") && rewardCount < 2) {
    return { x: CH1_REWARD_COURTYARD.position[0], z: CH1_REWARD_COURTYARD.position[2], label: "夹院调查范围", radius: 3, approximate: true };
  }
  return undefined;
}

const recordWalkAuditMilestone = (
  canvas: HTMLCanvasElement,
  id: string,
  pose: { x: number; y: number; z: number },
  grounded: boolean,
) => {
  const milestone = {
    id,
    playerPose: [Number(pose.x.toFixed(3)), Number(pose.y.toFixed(3)), Number(pose.z.toFixed(3))],
    grounded,
    gameplayArea: resolveGameplayRegionForPoint({ x: pose.x, z: pose.z }),
    nearestRouteAnchor: resolveNearestRouteAnchor({ x: pose.x, z: pose.z }).id,
  };
  const history = JSON.parse(canvas.dataset.walkAuditMilestones ?? "[]") as Array<typeof milestone>;
  if (!history.some((item) => item.id === id)) history.push(milestone);
  canvas.dataset.walkAuditMilestones = JSON.stringify(history);
  canvas.dataset.walkAuditReached = id;
  canvas.dataset.walkAuditReachedPose = milestone.playerPose.join(",");
  canvas.dataset.walkAuditReachedArea = milestone.gameplayArea;
  canvas.dataset.walkAuditReachedNearest = milestone.nearestRouteAnchor;
  canvas.dataset.walkAuditReachedGrounded = String(milestone.grounded);
};


export function GameRuntime({ chapter, save, onSave, onExit, onContinue }: GameRuntimeProps) {
  const visualParams = typeof window === "undefined" ? undefined : new URLSearchParams(window.location.search);
  const visualMode = process.env.NODE_ENV === "development" && visualParams?.get("visualTest") === "1";
  const visualUi = process.env.NODE_ENV === "development" && visualParams?.get("visualUi") === "1";
  const debugHudEnabled = process.env.NODE_ENV === "development" && visualParams?.get("debugGameplay") === "1";
  const walkAuditEnabled = visualMode && visualParams?.get("walkAudit") === "1";
  const specialStructureWalkAuditEnabled = visualMode && visualParams?.get("specialStructureWalkAudit") === "1";
  const visualAnchorId = visualParams?.get("visualAnchor");
  const visualPitch = Number(visualParams?.get("visualPitch") ?? -0.05);
  const visualYawParam = visualParams?.get("visualYaw");
  const visualYaw = visualYawParam === null || visualYawParam === undefined ? undefined : Number(visualYawParam);
  const visualXParam = visualParams?.get("visualX");
  const visualYParam = visualParams?.get("visualY");
  const visualZParam = visualParams?.get("visualZ");
  const visualX = visualXParam === null || visualXParam === undefined ? undefined : Number(visualXParam);
  const visualY = visualYParam === null || visualYParam === undefined ? undefined : Number(visualYParam);
  const visualZ = visualZParam === null || visualZParam === undefined ? undefined : Number(visualZParam);
  const initialRuntimePanel: RuntimePanel | undefined = !visualMode && shouldShowTutorial(save) ? "tutorial" : undefined;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{
    renderer: Awaited<ReturnType<typeof createRenderer>>;
    world: TingYuXuanScene;
    physics: PhysicsController;
    audio: AudioAtmosphere;
    cameraRig: CameraRig;
    interaction: InteractionController;
    objectInspector: ObjectInspectionController;
    playerAvatar: PlayerAvatar;
    borrow: BorrowAnchorController;
    portal: BorrowedViewPortal;
    sliceVisuals: ChapterOneSliceVisuals;
  } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const panelRef = useRef<RuntimePanel | undefined>(initialRuntimePanel);
  const panelReturnRef = useRef<RuntimePanel | undefined>(undefined);
  const touchModeRef = useRef(false);
  const keyboardFallbackRef = useRef(false);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const walkAuditTargetIndexRef = useRef(1);

  const finishChapterRef = useRef<() => void>(() => undefined);
  const phaseRef = useRef<RuntimePhase>("loading");
  const dialogueRef = useRef<DialogueSequence | undefined>(undefined);
  const startDialogueRef = useRef<(id: string) => void>(() => undefined);
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const directorRef = useRef(new ObjectiveDirector());
  const lastGuideUpdateRef = useRef(0);
  const lastAreaLoadRef = useRef(0);
  const areaLoadInFlightRef = useRef(false);
  const lastMapUpdateRef = useRef(0);
  const sliceGuidanceKeyRef = useRef("");
  const sliceGuidanceElapsedRef = useRef(0);
  const sliceGuidanceLevelRef = useRef(0);
  const sliceInspectionRef = useRef<SliceInspection | undefined>(undefined);
  const objectInspectionRef = useRef<ActiveObjectInspection | undefined>(undefined);
  const memoryTransitionTimerRef = useRef<number | undefined>(undefined);

  const [phase, setPhaseState] = useState<RuntimePhase>("loading");
  const [backend, setBackend] = useState<RendererBackend>();
  const [subtitle, setSubtitle] = useState("两份证词指向同一座园子。先在同一地点分别查证。");

  const [prompt, setPrompt] = useState<string>();
  const [sliceInspection, setSliceInspection] = useState<SliceInspection>();
  const [objectInspection, setObjectInspection] = useState<ActiveObjectInspection>();
  const [memoryTransition, setMemoryTransition] = useState<{ from: string; to: string }>();
  const [runtimePanel, setRuntimePanelState] = useState<RuntimePanel | undefined>(initialRuntimePanel);
  const [activeDialogue, setActiveDialogueState] = useState<DialogueSequence>();
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [keyboardFallback, setKeyboardFallback] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [guideDistance, setGuideDistance] = useState<number>();
  const [guideAngle, setGuideAngle] = useState(0);
  const [sliceGuidanceState, setSliceGuidanceState] = useState({ key: "", level: 0 });
  const [error, setError] = useState("");
  const [debugTelemetry, setDebugTelemetry] = useState<DebugTelemetry>({
    position: [0, 0, 0],
    fps: 0,
    areaId: "UNMAPPED",
    routeAnchorId: "ROUTE_01_START",
    routeDistance: 0,
    grounded: false,
    architecture: "master",
  });

  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) {
      const restored = save.activeCheckpoint;
      return { ...restored, memoryId: restored.memoryId === "gardener" ? "gardener" : "wife" };
    }
    return { ...createCheckpoint(chapter.id, "wife"), anchorId: chapter.spawnAnchor };
  });
  const [checkpoint, setCheckpointState] = useState(initialCheckpoint);
  const checkpointRef = useRef(checkpoint);
  const [mapPose, setMapPose] = useState(() => {
    const anchor = getLayoutAnchor(chapter.spawnAnchor);
    const position = initialCheckpoint.position ?? anchor.position;
    return { x: position[0], z: position[2], yaw: initialCheckpoint.yaw ?? anchor.yaw };
  });

  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [onSave, save]);

  const setPhase = useCallback((next: RuntimePhase) => { phaseRef.current = next; setPhaseState(next); }, []);
  const requestPointerLock = useCallback(() => {
    if (touchModeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.focus();
    keyboardFallbackRef.current = true;
    setKeyboardFallback(true);
    const result = canvas.requestPointerLock?.();
    if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
    window.setTimeout(() => {
      if (document.pointerLockElement !== canvas) setSubtitle("当前浏览器不支持鼠标锁定：WASD 移动，方向键左右转向。");
    }, 120);
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
    if (phaseRef.current === "playing") requestPointerLock();
  }, [requestPointerLock]);

  const finishTutorial = useCallback(() => {
    const nextSave = markTutorialSeen(saveRef.current);
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    closeRuntimePanel();
  }, [closeRuntimePanel]);

  const updateRuntimeSettings = useCallback((settings: CampaignSave["settings"]) => {
    const nextSave: CampaignSave = { ...saveRef.current, settings };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
  }, []);

  const commitCheckpoint = useCallback((producer: (current: CheckpointState) => CheckpointState, includePosition = true) => {
    const current = checkpointRef.current;
    const pose = includePosition ? runtimeRef.current?.physics.pose() : undefined;
    const next = producer({ ...current, position: pose ? [pose.x, pose.y, pose.z] : current.position, yaw: yawRef.current, updatedAt: new Date().toISOString() });
    checkpointRef.current = next;
    setCheckpointState(next);
    const nextSave = { ...saveRef.current, activeCheckpoint: next };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    return next;
  }, []);

  const startDialogue = useCallback((id: string) => {
    const sequence = chapter.dialogueSequences?.find((item) => item.id === id);
    if (!sequence || dialogueRef.current?.id === id) return;
    dialogueRef.current = sequence;
    setActiveDialogueState(sequence);
    keysRef.current.clear();
    if (sequence.presentation === "stage") { document.exitPointerLock?.(); setPhase("dialogue"); }
    commitCheckpoint((current) => ({ ...current, dialogueProgress: current.dialogueProgress?.sequenceId === id ? current.dialogueProgress : undefined, pointerLockPending: sequence.presentation === "stage" }));
  }, [chapter.dialogueSequences, commitCheckpoint, setPhase]);
  useEffect(() => { startDialogueRef.current = startDialogue; }, [startDialogue]);

  const applyDialogueCommand = useCallback((command: DialogueCommand) => {
    directorRef.current.markProgress();
    if (command.type === "objective:start") commitCheckpoint((current) => ({ ...current, activeObjectiveId: command.objectiveId, objectiveStepId: command.stepId }));
    else if (command.type === "objective:step") commitCheckpoint((current) => ({ ...current, objectiveStepId: command.stepId }));
    else if (command.type === "flag:set") commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, command.flag]) }));
    else if (command.type === "trust:set") commitCheckpoint((current) => ({ ...current, trustDecisions: { ...current.trustDecisions, [command.nodeId]: command.choiceId }, earnedFlags: unique([...current.earnedFlags, "west.trust.decided", command.outputFlag]) }));
    else if (command.type === "memory:unlock") commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, `memory.${command.memoryId}.unlocked`]) }));
  }, [commitCheckpoint]);

  const completeDialogue = useCallback((sequence: DialogueSequence) => {
    dialogueRef.current = undefined;
    setActiveDialogueState(undefined);
    commitCheckpoint((current) => ({
      ...current,
      dialogueProgress: undefined,
      pointerLockPending: false,
      earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags,
    }));

    if (sequence.id === "opening") {
      // The chapter-one breakfast must not mutate prologue completion/unlock state.


      runtimeRef.current?.audio.start(save.settings.masterVolume);
      setSubtitle("去西院找老周。他正在修一段被雨冲松的排水槽。" );
      
      setPhase("playing");
      requestPointerLock();
    } else if (sequence.id === "waterline-confirmed") {
      setSubtitle("");
      
      setPhase("playing");
      startDialogueRef.current("gardener-arrival");
    } else if (sequence.id === "trust") setPhase("playing");
    else if (sequence.id === "chase-intro") setPhase("playing");
    else if (sequence.id === "completion") setPhase("complete");
    else if (sequence.presentation === "stage") {
      if (sequence.id === "wife-arrival") setSubtitle("");
      if (sequence.id === "gardener-arrival") setSubtitle("");
      setPhase("playing");
      requestPointerLock();
    }
  }, [chapter.id, commitCheckpoint, openRuntimePanel, requestPointerLock, save.settings.masterVolume, setPhase]);

  const switchMemory = useCallback(() => {
    if (!runtimeRef.current || phaseRef.current !== "playing" || dialogueRef.current?.presentation === "stage") return;
    const current = checkpointRef.current;
    const active = resolveActiveObjective(chapter.objectives ?? [], current);
    const waterlineConfirmed = current.contradictions.includes("waterline-direction");
    if (!waterlineConfirmed && active?.step.id !== "switch-gardener" && active?.step.id !== "inspect-gardener") {
      setSubtitle("先在夫人的证词里确认这段墙，再用铜铃复查同一个地方。");
      
      return;
    }
    const next: "wife" | "gardener" = current.memoryId === "wife" ? "gardener" : "wife";
    runtimeRef.current.borrow.onCognitionSwitch();
    runtimeRef.current.interaction.clearFocus();
    const borrowState = runtimeRef.current.borrow.serialize();
    runtimeRef.current.world.setMemory(next);
    runtimeRef.current.physics.setMemory(next);
    runtimeRef.current.audio.bell(next);
    setSubtitle("");
    setMemoryTransition({
      from: current.memoryId === "wife" ? "沈夫人的记忆" : "老周的证词",
      to: next === "wife" ? "沈夫人的记忆" : "老周的证词",
    });
    if (memoryTransitionTimerRef.current) window.clearTimeout(memoryTransitionTimerRef.current);
    memoryTransitionTimerRef.current = window.setTimeout(() => setMemoryTransition(undefined), 720);
    
    const nextCheckpoint = commitCheckpoint((value) => ({
      ...value,
      memoryId: next,
      mechanics: { ...value.mechanics, ...borrowState, currentCognition: next },
      reconstructionTrace: {
        ...value.reconstructionTrace,
        cognitionUsage: {
          ...value.reconstructionTrace.cognitionUsage,
          [next]: (value.reconstructionTrace.cognitionUsage[next] ?? 0) + 1,
        },
      },
      objectiveStepId: active?.step.id === "switch-gardener" ? "inspect-gardener" : value.objectiveStepId,
      earnedFlags: unique([...value.earnedFlags, "west.learned.memory-switch"]),
    }));
    directorRef.current.markProgress();
    void nextCheckpoint;
  }, [chapter.objectives, commitCheckpoint, startDialogue]);

  const inspectContradiction = useCallback((item: SceneInteractable) => {
    const current = checkpointRef.current;
    const active = resolveActiveObjective(chapter.objectives ?? [], current);
    if (item.id === "waterline-direction" && countFlags(current.earnedFlags, "west.trace.") < 3) {
      setSubtitle("先别急着比较口供。把墙脚附近至少三处现实痕迹查清楚：水痕、泥印、倒灯或折断枝叶。");
      return;
    }
    if (item.id === "corridor-count" && !current.earnedFlags.includes("west.loop-return.seen")) {
      setSubtitle("先沿老周记得的窄路往里走。只有真正回到同一扇破损漏窗，才能比较两份证词。");
      return;
    }
    if (active?.step.targetInteractableId && active.step.targetInteractableId !== item.id) { setSubtitle(`当前任务：${active.step.instruction}`); return; }
    if (item.id === "waterline-direction" && active?.step.id === "inspect-wife" && current.memoryId !== "wife") return;
    if (item.id === "waterline-direction" && active?.step.id === "inspect-gardener" && current.memoryId !== "gardener") return;

    const memory = current.memoryId;
    const observed = current.observedBy[item.id] ?? [];
    if (observed.includes(memory)) { setSubtitle("这份证词已经记下。需要换一个人的记忆，在同一位置复查。"); return; }
    const definition = chapter.contradictions.find((value) => value.id === item.id);
    if (!definition) return;
    const nextObserved = unique([...observed, memory]);
    const confirmed = definition.requiredIndependentTestimonies.every((required) => nextObserved.includes(required));
    const next = commitCheckpoint((value) => ({
      ...value,
      observedBy: { ...value.observedBy, [item.id]: nextObserved },
      contradictions: confirmed ? unique([...value.contradictions, item.id]) : value.contradictions,
      earnedFlags: confirmed ? unique([...value.earnedFlags, definition.outputFlag]) : value.earnedFlags,
      objectiveStepId: !confirmed && item.id === "waterline-direction" ? "switch-gardener" : !confirmed && item.id === "corridor-count" ? "cross-check-window" : value.objectiveStepId,
      objectiveProgress: { ...value.objectiveProgress, [value.activeObjectiveId ?? "unknown"]: unique([...(value.objectiveProgress[value.activeObjectiveId ?? "unknown"] ?? []), `${item.id}:${memory}`]) },
    }));
    directorRef.current.markProgress();
    
    if (confirmed) {
      setSubtitle(`两种说法在同一个位置对不上：${definition.label}。`);
      if (item.id === "waterline-direction") window.setTimeout(() => startDialogue("waterline-confirmed"), 280);
      else if (next.contradictions.length >= chapter.contradictions.length) {
        commitCheckpoint((value) => ({
          ...value,
          activeObjectiveId: undefined,
          objectiveStepId: undefined,
          mechanics: { ...value.mechanics, chapterBeat: "west-borrowed-view" },
          earnedFlags: unique([...value.earnedFlags, "west.borrowed-view.ready"]),
        }));
        setSubtitle("老周的路确实会把你送回原处。别再问哪份记忆正确——去漏窗前，试着只借看另一份园子。");
      }
    } else {
      setSubtitle(`${definition.label}：先记下${memory === "wife" ? "沈夫人" : "老周"}的说法，再换另一份证词看同一个位置。`);
      if (item.id === "corridor-count") window.setTimeout(() => startDialogue("loop-first-observation"), 140);
    }
  }, [chapter.contradictions, chapter.objectives, commitCheckpoint, startDialogue]);

  const openObjectInspection = useCallback((definition: ObjectInspectionDefinition, state: Omit<ActiveObjectInspection, "controller">) => {
    const runtime = runtimeRef.current;
    if (!runtime) return false;
    runtime.interaction.clearFocus();
    runtime.objectInspector.open(definition);
    const activeState = { ...state, controller: runtime.objectInspector };
    objectInspectionRef.current = activeState;
    setObjectInspection(activeState);
    keysRef.current.clear();
    document.exitPointerLock?.();
    return true;
  }, []);

  const recordSliceEvidence = useCallback((item: SliceEvidenceDefinition) => {
    const current = checkpointRef.current;
    if (current.earnedFlags.includes(item.flag)) return;
    const nextFlags = unique([...current.earnedFlags, item.flag]);
    const discoveredEvidence = unique([...current.mechanics.discoveredEvidence, item.id]);
    const optionalEvidence = unique([...current.reconstructionTrace.discoveredOptionalEvidence, item.id]);
    commitCheckpoint((value) => ({
      ...value,
      earnedFlags: nextFlags,
      mechanics: { ...value.mechanics, discoveredEvidence },
      reconstructionTrace: { ...value.reconstructionTrace, discoveredOptionalEvidence: optionalEvidence },
    }));
    directorRef.current.markProgress();
  }, [commitCheckpoint]);

  const inspectSliceEvidence = useCallback((item: SliceEvidenceDefinition) => {
    const runtime = runtimeRef.current;
    const source = runtime?.sliceVisuals.traceObjects.get(item.id) ?? runtime?.sliceVisuals.rewardObjects.get(item.id);
    if (source) {
      openObjectInspection({
        id: `slice-${item.id}`,
        kind: "evidence",
        title: item.title,
        source,
        initialRotation: [Math.PI / 2, 0, 0],
        hotspots: [{ id: `${item.id}-detail`, label: item.label.replace(/^(查看|检查)/, ""), fact: item.body, localDirection: [0, 1, 0], facingThreshold: 0.76 }],
        onObserve: () => recordSliceEvidence(item),
      }, { id: item.id, contextLabel: "现场痕迹", confirmLabel: "记下这一条" });
      return;
    }
    recordSliceEvidence(item);
    const inspection = { id: item.id, title: item.title, body: item.body, note: item.note };
    sliceInspectionRef.current = inspection;
    setSliceInspection(inspection);
    document.exitPointerLock?.();
  }, [openObjectInspection, recordSliceEvidence]);

  const inspectBorrowedView = useCallback(() => {
    const current = checkpointRef.current;
    if (!current.earnedFlags.includes("west.borrowed-view.ready")) return;
    commitCheckpoint((value) => ({
      ...value,
      mechanics: { ...value.mechanics, chapterBeat: "west-borrow-source" },
      earnedFlags: unique([...value.earnedFlags, "west.borrowed-view.seen"]),
    }));
    const inspection = {
      id: "borrowed-view",
      title: "借来的视野",
      body: "漏窗里能看见沈夫人记得的那块青石；在老周记得的同一位置，这块石头不存在。",
      note: "可以尝试把这块青石固定成两份空间都承认的共同参照。",
    };
    sliceInspectionRef.current = inspection;
    setSliceInspection(inspection);
    document.exitPointerLock?.();
  }, [commitCheckpoint]);

  const borrowThresholdStone = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime || checkpointRef.current.memoryId !== "wife") return;
    runtime.borrow.borrow(CH1_BORROW_SOURCE.id, "wife", CH1_ANCHOR_TARGET.id);
    const borrowState = runtime.borrow.serialize();
    commitCheckpoint((value) => ({
      ...value,
      mechanics: { ...value.mechanics, ...borrowState, chapterBeat: "west-anchor-target" },
      earnedFlags: unique([...value.earnedFlags, "west.borrowed.threshold-stone"]),
    }));
    setSubtitle("你没有把石头搬走。你只是把“这里有一块踏石”这个条件，从夫人的记忆里借了出来。去循环地标前找能固定它的位置。");
  }, [commitCheckpoint]);

  const inspectBorrowSource = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime || checkpointRef.current.memoryId !== "wife") return;
    openObjectInspection({
      id: CH1_BORROW_SOURCE.id,
      kind: "stone",
      title: "门槛踏石",
      source: runtime.sliceVisuals.borrowSource,
      initialRotation: [Math.PI / 2, -0.35, 0],
      hotspots: [{
        id: "memory-presence",
        label: "青石落脚处",
        fact: "这块青石只在沈夫人的记忆中出现；老周记得的同一位置没有它。",
        localDirection: [0, 1, 0],
        facingThreshold: 0.72,
      }],
    }, { id: CH1_BORROW_SOURCE.id, contextLabel: "借来的空间条件", confirmLabel: "借下这块踏石", onConfirm: borrowThresholdStone });
  }, [borrowThresholdStone, openObjectInspection]);

  const anchorThresholdStone = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime?.borrow.borrowedObject || runtime.borrow.borrowedObject.anchored) return;
    runtime.borrow.anchor();
    const borrowState = runtime.borrow.serialize();
    commitCheckpoint((value) => ({
      ...value,
      mechanics: { ...value.mechanics, ...borrowState, chapterBeat: "west-loop-break" },
      reconstructionTrace: {
        ...value.reconstructionTrace,
        anchoredFragments: unique([...value.reconstructionTrace.anchoredFragments, CH1_BORROW_SOURCE.id]),
      },
      earnedFlags: unique([...value.earnedFlags, "west.anchor.threshold-stone"]),
    }));
    setSubtitle("踏石留在这里了。现在回到老周记得的回廊：如果它还在，两段残缺的记忆就共同拼出了一条路。");
  }, [commitCheckpoint]);

  const closeSliceInspection = useCallback(() => {
    sliceInspectionRef.current = undefined;
    setSliceInspection(undefined);
    const current = checkpointRef.current;
    const foundFinalFootprint = current.earnedFlags.includes("west.wet-footprint-found");
    if (foundFinalFootprint && current.earnedFlags.includes("west.loop-broken")) {
      finishChapterRef.current();

      return;
    }
    requestPointerLock();
  }, [requestPointerLock]);

  const closeObjectInspection = useCallback(() => {
    const state = objectInspectionRef.current;
    runtimeRef.current?.objectInspector.close();
    objectInspectionRef.current = undefined;
    setObjectInspection(undefined);
    state?.onConfirm?.();
    const current = checkpointRef.current;
    if (current.earnedFlags.includes("west.wet-footprint-found") && current.earnedFlags.includes("west.loop-broken")) {
      finishChapterRef.current();
      return;
    }
    requestPointerLock();
  }, [requestPointerLock]);

  const interact = useCallback(() => { runtimeRef.current?.interaction.interact(); }, []);

  const finishChapter = useCallback(() => {
    if (phaseRef.current === "complete" || dialogueRef.current?.id === "completion") return;
    const current = checkpointRef.current;
    const finalCheckpoint: CheckpointState = { ...current, anchorId: "ROUTE_05_B_MAIN_COURT", mechanics: { ...current.mechanics, safeAnchorId: "ROUTE_05_B_MAIN_COURT" }, activeObjectiveId: undefined, objectiveStepId: undefined, updatedAt: new Date().toISOString() };
    const nextSave = completeCampaignChapter(saveRef.current, chapter.id, finalCheckpoint);
    checkpointRef.current = nextSave.activeCheckpoint;
    setCheckpointState(nextSave.activeCheckpoint);
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    window.dispatchEvent(new CustomEvent("garden-of-shadows:chapter-complete", { detail: createChapterCompletePayload(chapter.id, nextSave.activeCheckpoint) }));
    document.exitPointerLock?.();
    startDialogue("completion");
  }, [chapter.id, startDialogue]);
  useEffect(() => {
    finishChapterRef.current = finishChapter;
  }, [finishChapter]);

  useEffect(() => () => {
    if (memoryTransitionTimerRef.current) window.clearTimeout(memoryTransitionTimerRef.current);
  }, []);

  useEffect(() => {
    const onChange = () => setHasPointerLock(document.pointerLockElement === canvasRef.current);
    document.addEventListener("pointerlockchange", onChange);
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let animationFrame = 0;

    const boot = async () => {
      try {
        const renderer = await createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality });
        const restored = visualMode ? undefined : initialCheckpoint.position;
        const anchor = getLayoutAnchor(visualMode && visualAnchorId ? visualAnchorId : (initialCheckpoint.anchorId || chapter.spawnAnchor));
        const spawn = {
          x: visualMode && visualX !== undefined && Number.isFinite(visualX) ? visualX : restored?.[0] ?? anchor.position[0],
          y: visualMode && visualY !== undefined && Number.isFinite(visualY) ? visualY : Math.max(restored?.[1] ?? anchor.position[1], PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY),
          z: visualMode && visualZ !== undefined && Number.isFinite(visualZ) ? visualZ : restored?.[2] ?? anchor.position[2],
        };
        const physics = await PhysicsController.create(spawn, tingYuXuanLayout.colliders);
        if (cancelled) { renderer.dispose(); physics.dispose(); return; }
        const world = await TingYuXuanScene.create(chapter.memories, save.settings.quality, renderer.renderer);
        if (cancelled) { renderer.dispose(); physics.dispose(); world.dispose(); return; }
        // Final Master meshes are visual truth, not automatic collision input.
        registerArchitectureCollisionCoverage(world, physics, canvas);
        const audio = new AudioAtmosphere();
        const cameraRig = new CameraRig(world.camera, physics, {
          smoothTime: save.settings.stableCamera ? 0.11 : 0.16,
        });
        const interaction = new InteractionController();
        const playerAvatar = new PlayerAvatar();
        playerAvatar.root.visible = false;
        world.proceduralDressing.add(playerAvatar.root);
        const sliceVisuals = await buildChapterOneSliceVisuals(world);
        world.proceduralDressing.add(sliceVisuals.root);
        const objectInspector = new ObjectInspectionController(world.scene, world.camera);
        physics.addStaticBoxColliders([{
          id: "west-threshold-stone-collider",
          center: [CH1_ANCHOR_TARGET.position[0], 0.08, CH1_ANCHOR_TARGET.position[2]],
          halfExtents: [0.42, 0.08, 0.34],
          category: "architecture",
          initiallyEnabled: false,
          specialStructure: {
            kind: "threshold",
            sourceReference: "CH1_BORROWABLES / wife-threshold-stone visual clone",
            passage: "none",
          },
        }]);
        const borrow = new BorrowAnchorController(CH1_BORROWABLES, {
          createBorrowedObject: () => {
            sliceVisuals.borrowedStone.visible = true;
            setSliceObjectOpacity(sliceVisuals.borrowedStone, 0.42);

            physics.setColliderEnabled("west-threshold-stone-collider", false);
          },
          destroyBorrowedObject: () => {
            sliceVisuals.borrowedStone.visible = false;
            sliceVisuals.anchorMarker.visible = false;
            physics.setColliderEnabled("west-threshold-stone-collider", false);
          },
          setBorrowedObjectAnchored: (_objectId, anchored) => {
            sliceVisuals.borrowedStone.visible = true;
            setSliceObjectOpacity(sliceVisuals.borrowedStone, anchored ? 1 : 0.42);

            sliceVisuals.anchorMarker.visible = !anchored;
            physics.setColliderEnabled("west-threshold-stone-collider", anchored);
          },
        });
        borrow.restore(initialCheckpoint.mechanics);
        const portal = new BorrowedViewPortal({
          id: CH1_BORROWED_VIEW_POINT.id,
          surface: sliceVisuals.portalSurface,
          maxDistance: 8,
          resolution: 384,
          renderScale: 0.8,
        });

        world.interactables.filter((item) => item.kind === "contradiction").forEach((item) => {
          const focusRoot = item.id === "corridor-count" ? sliceVisuals.loopLandmark : sliceVisuals.traceObjects.get("waterline");
          interaction.registerPoint({
            id: item.id,
            type: "evidence",
            label: item.label,
            maxDistance: INTERACTION_RANGE_CALIBRATION.standardEvidence,
            enabledWhen: () => phaseRef.current === "playing" && item.memoryIds.includes(checkpointRef.current.memoryId),
            onInteract: () => inspectContradiction(item),
          }, item.position, INTERACTION_RANGE_CALIBRATION.standardProxyRadius, focusRoot);
        });
        CH1_TRACES.forEach((item) => {
          interaction.registerPoint({
            id: `slice-trace-${item.id}`,
            type: "evidence",
            label: item.label,
            maxDistance: INTERACTION_RANGE_CALIBRATION.standardEvidence,
            enabledWhen: () => phaseRef.current === "playing" && checkpointRef.current.earnedFlags.includes("west.arrived") && !checkpointRef.current.earnedFlags.includes(item.flag),
            onInteract: () => inspectSliceEvidence(item),
          }, new THREE.Vector3(item.position[0], PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY, item.position[2]), INTERACTION_RANGE_CALIBRATION.standardProxyRadius, sliceVisuals.traceObjects.get(item.id));
        });
        interaction.registerPoint({
          id: CH1_BORROWED_VIEW_POINT.id,
          type: "evidence",
          label: CH1_BORROWED_VIEW_POINT.label,
          maxDistance: INTERACTION_RANGE_CALIBRATION.standardEvidence,
          enabledWhen: () => phaseRef.current === "playing"
            && checkpointRef.current.memoryId === "gardener"
            && checkpointRef.current.earnedFlags.includes("west.borrowed-view.ready"),
          onInteract: inspectBorrowedView,
        }, new THREE.Vector3(CH1_BORROWED_VIEW_POINT.position[0], CH1_BORROWED_VIEW_POINT.position[1], CH1_BORROWED_VIEW_POINT.position[2]), 0.72, sliceVisuals.portalSurface);
        interaction.registerPoint({
          id: CH1_BORROW_SOURCE.id,
          type: "evidence",
          label: CH1_BORROW_SOURCE.label,
          maxDistance: INTERACTION_RANGE_CALIBRATION.standardEvidence,
          enabledWhen: () => phaseRef.current === "playing"
            && checkpointRef.current.memoryId === "wife"
            && checkpointRef.current.earnedFlags.includes("west.borrowed-view.seen")
            && !checkpointRef.current.earnedFlags.includes("west.borrowed.threshold-stone"),
          onInteract: inspectBorrowSource,
        }, new THREE.Vector3(CH1_BORROW_SOURCE.position[0], 0.45, CH1_BORROW_SOURCE.position[2]), 0.72, sliceVisuals.borrowSource);
        interaction.registerPoint({
          id: CH1_ANCHOR_TARGET.id,
          type: "evidence",
          label: CH1_ANCHOR_TARGET.label,
          maxDistance: INTERACTION_RANGE_CALIBRATION.standardEvidence,
          enabledWhen: () => phaseRef.current === "playing" && Boolean(runtimeRef.current?.borrow.borrowedObject && !runtimeRef.current.borrow.borrowedObject.anchored),
          onInteract: anchorThresholdStone,
        }, new THREE.Vector3(CH1_ANCHOR_TARGET.position[0], 0.35, CH1_ANCHOR_TARGET.position[2]), 0.8, sliceVisuals.borrowedStone);
        CH1_REWARD_POINTS.forEach((item) => {
          interaction.registerPoint({
            id: `slice-reward-${item.id}`,
            type: "evidence",
            label: item.label,
            maxDistance: INTERACTION_RANGE_CALIBRATION.standardEvidence,
            enabledWhen: () => phaseRef.current === "playing" && checkpointRef.current.earnedFlags.includes("west.loop-broken") && !checkpointRef.current.earnedFlags.includes(item.flag),
            onInteract: () => inspectSliceEvidence(item),
          }, new THREE.Vector3(item.position[0], PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY, item.position[2]), INTERACTION_RANGE_CALIBRATION.standardProxyRadius, sliceVisuals.rewardObjects.get(item.id));
        });
        world.setMemory(initialCheckpoint.memoryId);
        physics.setMemory(initialCheckpoint.memoryId);
        yawRef.current = visualMode && Number.isFinite(visualYaw) ? visualYaw! : visualMode ? anchor.yaw : (initialCheckpoint.yaw ?? anchor.yaw);
        pitchRef.current = visualMode ? visualPitch : 0;
        cameraRig.syncExploration(new THREE.Vector3(spawn.x, spawn.y, spawn.z), yawRef.current, pitchRef.current, true);
        runtimeRef.current = { renderer, world, physics, audio, cameraRig, interaction, objectInspector, playerAvatar, borrow, portal, sliceVisuals };
        setBackend(renderer.backend);
        canvas.dataset.rendererBackend = renderer.backend;
        canvas.dataset.architectureMode = world.architectureMode();
        void world.ensureAreaAssets({ x: spawn.x, z: spawn.z })
          .then(() => { canvas.dataset.assetsReady = "true"; })
          .catch((reason) => {
            if (cancelled) return;
            console.error("[chapter-one] area assets failed to appear", reason);
            setError("这段旧园没有完整显现。请返回案卷，在设置中开启画面兼容模式后重新进入。");
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

        // Warm the final Master/light shader set before gameplay begins. Range
        // lights stay in a stable renderer light set and only fade intensity, so
        // first entry into a lit area does not compile a lighting pipeline on the
        // movement frame.
        canvas.dataset.pipelineWarmup = "warming";
        await renderer.renderer.compileAsync(world.scene, world.camera);
        canvas.dataset.pipelineWarmup = "ready";

        let previous = performance.now();
        let telemetryWindowStarted = previous;
        let telemetryFrames = 0;
        const clock = (now: number) => {
          const delta = Math.min((now - previous) / 1000, 0.05);
          previous = now;
          const activePhase = phaseRef.current;
          let pose = physics.pose();
          let avatarMoving = false;
          const inspectionOpen = Boolean(objectInspectionRef.current || sliceInspectionRef.current);
          const inputReady = !panelRef.current && !inspectionOpen && (document.pointerLockElement === canvas || touchModeRef.current || keyboardFallbackRef.current);
          if (activePhase === "playing" && !dialogueRef.current && !panelRef.current && !inspectionOpen) {
            const keys = keysRef.current;
            let movementX = 0;
            let movementZ = 0;
            if (specialStructureWalkAuditEnabled) {
              const target = { x: -15.2, z: 0.25 };
              const dx = target.x - pose.x;
              const dz = target.z - pose.z;
              const distance = Math.hypot(dx, dz);
              canvas.dataset.specialStructureWalkStatus = distance <= 0.3 ? "complete" : "running";
              canvas.dataset.specialStructureWalkRemaining = distance.toFixed(3);
              if (distance > 0.3) {
                yawRef.current = Math.atan2(-dx, -dz);
                const step = Math.min(distance, 2.1 * delta);
                movementX = dx / distance * step;
                movementZ = dz / distance * step;
              }
            } else if (walkAuditEnabled) {
              const target = tingYuXuanRouteAnchors[walkAuditTargetIndexRef.current];
              if (target) {
                // The A-zone route is intentionally impossible in one cognition:
                // gardener memory opens the side path to ROUTE_03, while wife
                // memory re-opens the east exit for ROUTE_04+. Keep the automated
                // walk audit faithful to the actual puzzle instead of bypassing
                // the memory-specific colliders.
                const auditMemory: MemoryId = target.id === "ROUTE_03_A_LOOP" ? "gardener" : "wife";
                if (checkpointRef.current.memoryId !== auditMemory) {
                  world.setMemory(auditMemory);
                  physics.setMemory(auditMemory);
                  checkpointRef.current = { ...checkpointRef.current, memoryId: auditMemory };
                }
                const dx = target.position[0] - pose.x;
                const dz = target.position[2] - pose.z;
                const distance = Math.hypot(dx, dz);
                canvas.dataset.walkAuditStatus = "running";
                canvas.dataset.walkAuditTarget = target.id;
                // A 0.32 m capsule plus the character-controller offset cannot
                // always reach a marker placed flush against a gate plane.
                // 0.65 m remains well inside every route interaction volume.
                if (distance <= 0.65) {
                  recordWalkAuditMilestone(canvas, target.id, pose, physics.isGrounded());
                  walkAuditTargetIndexRef.current += 1;
                } else {
                  yawRef.current = Math.atan2(-dx, -dz);
                  const step = Math.min(distance, 2.75 * delta);
                  movementX = dx / distance * step;
                  movementZ = dz / distance * step;
                }
              } else {
                canvas.dataset.walkAuditStatus = "complete";
                canvas.dataset.walkAuditTarget = "ROUTE_COMPLETE";
              }
            } else {
              const turn = inputReady ? Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft")) : 0;
              yawRef.current -= turn * 1.8 * delta;
              const forward = inputReady ? Number(keys.has("KeyW")) - Number(keys.has("KeyS")) : 0;
              const strafe = inputReady ? Number(keys.has("KeyD")) - Number(keys.has("KeyA")) : 0;
              const speed = keys.has("ShiftLeft") ? PLAYER_PHYSICS_CALIBRATION.fastWalkSpeed : PLAYER_PHYSICS_CALIBRATION.walkSpeed;
              const sin = Math.sin(yawRef.current);
              const cos = Math.cos(yawRef.current);
              movementX = (forward * -sin + strafe * cos) * speed * delta;
              movementZ = (forward * -cos - strafe * sin) * speed * delta;
            }
            avatarMoving = Math.hypot(movementX, movementZ) > 0.0001;
            pose = physics.move({ x: movementX, y: 0, z: movementZ }, delta);
          }
          const gameplayArea = resolveGameplayRegionForPoint({ x: pose.x, z: pose.z });
          const nearestRoute = resolveNearestRouteAnchor({ x: pose.x, z: pose.z });
          if (now - lastMapUpdateRef.current >= 160) {
            lastMapUpdateRef.current = now;
            setMapPose({ x: pose.x, z: pose.z, yaw: yawRef.current });
          }
          if (process.env.NODE_ENV === "development" || debugHudEnabled) {
            canvas.dataset.playerPose = `${pose.x.toFixed(3)},${pose.y.toFixed(3)},${pose.z.toFixed(3)}`;
            canvas.dataset.grounded = String(physics.isGrounded());
            canvas.dataset.gameplayArea = gameplayArea;
            canvas.dataset.nearestRouteAnchor = nearestRoute.id;
            canvas.dataset.nearestRouteDistance = nearestRoute.distance.toFixed(2);
            canvas.dataset.playerAvatarVisible = String(playerAvatar.root.visible && playerAvatar.root.parent !== null);
          }

          if (now - lastAreaLoadRef.current > 450 && !areaLoadInFlightRef.current) {
            const layoutZones = resolveLayoutZonesForPoint({ x: pose.x, z: pose.z });
            const audioZones = world.architectureMode() === "legacy"
              ? (pose.z > 17 ? ["front-hall", ...layoutZones] : layoutZones)
              : gameplayArea === "AREA_C" ? ["water-court"]
                : gameplayArea === "AREA_B" ? ["inner-house"]
                  : gameplayArea === "AREA_A" ? ["west-courtyard"] : ["front-gate"];
            audio.setZone(audioZoneForLayoutZones(audioZones));
            lastAreaLoadRef.current = now;
            areaLoadInFlightRef.current = true;
            canvas.dataset.streaming = "true";
            void world.ensureAreaAssets({ x: pose.x, z: pose.z })
              .then(() => { canvas.dataset.assetsReady = "true"; })
              .catch((reason) => {
                if (cancelled) return;
                console.error("[chapter-one] streamed area failed to appear", reason);
                setError("前方的旧园没有完整显现。请返回案卷，在设置中开启画面兼容模式后重新进入。");
                setPhase("error");
              })
              .finally(() => {
                areaLoadInFlightRef.current = false;
                canvas.dataset.streaming = "false";
              });
          }

          const objective = resolveActiveObjective(chapter.objectives ?? [], checkpointRef.current);
          const objectivePosition = resolveChapterOneObjectivePosition(checkpointRef.current, objective);
          const objectiveTarget = objectivePosition ? new THREE.Vector3(...objectivePosition) : undefined;
          const sliceMapTarget = resolveChapterOneMapTarget(checkpointRef.current);
          const sliceTarget = sliceMapTarget ? new THREE.Vector3(sliceMapTarget.x, 1.1, sliceMapTarget.z) : undefined;
          const target = sliceTarget ?? objectiveTarget;
          const targetDistance = target ? Math.hypot(target.x - pose.x, target.z - pose.z) : undefined;
          const liveGuidanceLevel = guidanceLevelForProximity(sliceTarget ? sliceGuidanceLevelRef.current : (objective?.hintLevel ?? 0), targetDistance);
          const showMarker = Boolean(sliceTarget
            ? liveGuidanceLevel >= 3
            : target && objective?.step.guidance.includes("world-marker") && liveGuidanceLevel >= 3);
          world.setGuidanceTarget(showMarker ? target : undefined, "subtle");
          if (target && now - lastGuideUpdateRef.current > 120) {
            lastGuideUpdateRef.current = now;
            const dx = target.x - pose.x;
            const dz = target.z - pose.z;
            setGuideDistance(targetDistance);
            setGuideAngle(THREE.MathUtils.radToDeg(Math.atan2(dx, -dz) - yawRef.current));
          }

          const emittedHint = directorRef.current.tick(delta, activePhase !== "playing" || Boolean(dialogueRef.current) || Boolean(panelRef.current) || inspectionOpen || !inputReady || !saveRef.current.settings.guidanceAssist, checkpointRef.current.activeObjectiveId, checkpointRef.current.objectiveStepId);
          if (emittedHint && objective) {
            const key = objectiveProgressKey(objective.objective.id, objective.step.id);
            commitCheckpoint((current) => ({ ...current, hintLevels: { ...current.hintLevels, [key]: emittedHint } }));
            if (emittedHint >= 2) setSubtitle(objective.step.hints[emittedHint - 1]);
            
            audio.bell(checkpointRef.current.memoryId === "gardener" ? "gardener" : "wife");
          }

          const sliceFlags = checkpointRef.current.earnedFlags;
          const borrowedViewReady = sliceFlags.includes("west.borrowed-view.ready");
          const borrowedViewSeen = sliceFlags.includes("west.borrowed-view.seen");
          const borrowedThreshold = sliceFlags.includes("west.borrowed.threshold-stone");
          const loopBroken = sliceFlags.includes("west.loop-broken");
          sliceVisuals.loopLandmark.visible = sliceFlags.includes("west.loop-return.seen") && !checkpointRef.current.contradictions.includes("corridor-count");
          sliceVisuals.portalSurface.visible = borrowedViewReady && checkpointRef.current.memoryId === "gardener";
          sliceVisuals.borrowSource.visible = borrowedViewSeen && checkpointRef.current.memoryId === "wife" && !borrowedThreshold;
          sliceVisuals.anchorMarker.visible = Boolean(borrow.borrowedObject && !borrow.borrowedObject.anchored);
          CH1_REWARD_POINTS.forEach((item) => {
            const object = sliceVisuals.rewardObjects.get(item.id);
            if (object) object.visible = loopBroken;
          });

          if (objective?.objective.id === "west-arrival" && objective.step.id === "follow-lantern" && containsLayoutPoint(getLayoutTrigger("front-hall-to-west"), pose)) {
            directorRef.current.markProgress();
            commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, "west.arrived"]) }));
            startDialogueRef.current("wife-arrival");
          }

          const loopDestination = resolveLayoutTriggerDestination("gardener-corridor-loop", checkpointRef.current.memoryId, pose);
          if (loopDestination && !borrow.borrowedObject?.anchored) {
            if (walkAuditEnabled) {
              // Reaching ROUTE_03 in gardener memory must trigger the real loop.
              // Record the milestone before teleporting so the audit observes
              // the trigger-side pose, then continue from A_BASELINE in wife
              // memory on the following frame.
              canvas.dataset.walkAuditLoopTeleport = "true";
              if (walkAuditTargetIndexRef.current === 2) {
                recordWalkAuditMilestone(canvas, "ROUTE_03_A_LOOP", pose, physics.isGrounded());
                walkAuditTargetIndexRef.current = 3;
              }
            }
            const destination = loopDestination;
            physics.teleport({ x: destination.position[0], y: destination.position[1], z: destination.position[2] });
            yawRef.current = destination.yaw;
            pose = physics.pose();
            if (!checkpointRef.current.earnedFlags.includes("west.loop-return.seen")) {
              commitCheckpoint((current) => ({
                ...current,
                anchorId: "A_BASELINE",
                mechanics: { ...current.mechanics, safeAnchorId: "A_BASELINE" },
                earnedFlags: unique([...current.earnedFlags, "west.loop-return.seen"]),
              }));
            }
            setSubtitle("同一盏灯、同一扇漏窗——你回到了刚才经过的地方。");
            
          }

          if (borrow.borrowedObject?.anchored
            && checkpointRef.current.memoryId === "gardener"
            && !checkpointRef.current.earnedFlags.includes("west.loop-broken")
            && distance2D(pose, CH1_REWARD_COURTYARD.position) <= (CH1_REWARD_COURTYARD.radius ?? 2.3)) {
            commitCheckpoint((current) => ({
              ...current,
              mechanics: { ...current.mechanics, chapterBeat: "west-reward-courtyard" },
              reconstructionTrace: {
                ...current.reconstructionTrace,
                solvedWithCognition: {
                  ...current.reconstructionTrace.solvedWithCognition,
                  "west-loop-break": ["wife", "gardener"],
                },
              },
              earnedFlags: unique([...current.earnedFlags, "west.loop-broken", "west.borrow-anchor.solved"]),
            }));
            setSubtitle("");
            startDialogueRef.current("anchor-confirmed");
            
          }

          if (walkAuditEnabled && walkAuditTargetIndexRef.current === 4) {
            const exitDestination = resolveLayoutTriggerDestination("wife-moon-gate-exit", checkpointRef.current.memoryId, pose);
            if (exitDestination) {
              physics.teleport({ x: exitDestination.position[0], y: exitDestination.position[1], z: exitDestination.position[2] });
              pose = physics.pose();
              canvas.dataset.walkAuditExitHandoff = "true";
              recordWalkAuditMilestone(canvas, "ROUTE_05_B_MAIN_COURT", pose, physics.isGrounded());
              walkAuditTargetIndexRef.current = 5;
            }
          }

          const cameraPlayer = new THREE.Vector3(pose.x, pose.y, pose.z);
          playerAvatar.update(pose, yawRef.current, avatarMoving, delta);
          if (cameraRig.mode === "investigation") cameraRig.syncInvestigation(cameraPlayer, yawRef.current, pitchRef.current);
          else cameraRig.syncExploration(cameraPlayer, yawRef.current, pitchRef.current);
          cameraRig.update(delta);

          const playerVector = new THREE.Vector3(pose.x, pose.y, pose.z);
          world.update(delta, playerVector, false);

          const focus = panelRef.current || dialogueRef.current || inspectionOpen ? (interaction.clearFocus(), undefined) : interaction.focus(world.camera, world.camera.position);
          setPrompt((currentPrompt) => {
            const nextPrompt = focus?.canInteract ? focus.definition.label : undefined;
            return currentPrompt === nextPrompt ? currentPrompt : nextPrompt;
          });
          if (sliceVisuals.portalSurface.visible) {
            portal.render(
              renderer.renderer,
              world.scene,
              world.camera,
              "wife",
              (cognition) => {
                if (cognition === "wife" || cognition === "gardener") world.setMemory(cognition);
              },
              () => world.setMemory(checkpointRef.current.memoryId),
            );
          }
          renderer.renderer.render(world.scene, world.camera);
          telemetryFrames += 1;
          if ((process.env.NODE_ENV === "development" || debugHudEnabled) && now - telemetryWindowStarted >= 500) {
            const renderInfo = renderer.renderer.info.render as { calls?: number; triangles?: number; points?: number; lines?: number };
            const fps = telemetryFrames * 1000 / (now - telemetryWindowStarted);
            canvas.dataset.fps = fps.toFixed(1);
            canvas.dataset.drawCalls = String(renderInfo.calls ?? 0);
            canvas.dataset.triangles = String(renderInfo.triangles ?? 0);
            canvas.dataset.points = String(renderInfo.points ?? 0);
            canvas.dataset.visibleModels = world.visibleModelNames().join(",");
            canvas.dataset.loadedAssetIds = world.loadedAssetIds().join(",");
            canvas.dataset.loadedAssetBytes = String(world.loadedAssetBytes());
            if (debugHudEnabled) {
              setDebugTelemetry({
                position: [pose.x, pose.y, pose.z],
                fps,
                areaId: gameplayArea,
                routeAnchorId: nearestRoute.id,
                routeDistance: nearestRoute.distance,
                grounded: physics.isGrounded(),
                architecture: world.architectureMode(),
              });
            }
            telemetryFrames = 0;
            telemetryWindowStarted = now;
          }
          animationFrame = window.requestAnimationFrame(clock);
        };
        animationFrame = window.requestAnimationFrame(clock);

        canvas.dataset.runtimeReady = "true";
        const resumeId = initialCheckpoint.dialogueProgress?.sequenceId;
        if (visualMode) setPhase("playing");
        else if (resumeId) startDialogueRef.current(resumeId);
        else if (!initialCheckpoint.earnedFlags.includes("west.dialogue.breakfast-complete")) startDialogueRef.current("opening");
        else if (initialCheckpoint.earnedFlags.includes("west-corridor-loop.complete")) setPhase("complete");
        else { audio.start(save.settings.masterVolume); setPhase("playing"); }

        return () => window.removeEventListener("resize", resize);
      } catch (reason) {
        console.error("[chapter-one] scene failed to appear", reason);
        setError("两份证词里的听雨轩没有完整显现。请返回案卷，在设置中开启画面兼容模式后重新进入。");
        setPhase("error");
      }
    };

    let removeResize: (() => void) | undefined;
    void boot().then((cleanup) => { removeResize = cleanup; });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      removeResize?.();
      runtimeRef.current?.audio.dispose();
      runtimeRef.current?.interaction.dispose();
      runtimeRef.current?.objectInspector.dispose();
      runtimeRef.current?.cameraRig.dispose();
      runtimeRef.current?.portal.dispose();
      runtimeRef.current?.world.dispose();
      runtimeRef.current?.physics.dispose();
      runtimeRef.current?.renderer.dispose();
      runtimeRef.current = undefined;
    };
  }, [anchorThresholdStone, chapter.memories, chapter.objectives, chapter.spawnAnchor, commitCheckpoint, debugHudEnabled, finishChapter, initialCheckpoint, inspectBorrowSource, inspectBorrowedView, inspectContradiction, inspectSliceEvidence, save.settings.masterVolume, save.settings.quality, save.settings.renderer, save.settings.stableCamera, setPhase, specialStructureWalkAuditEnabled, visualAnchorId, visualMode, visualPitch, visualX, visualY, visualYaw, visualZ, walkAuditEnabled]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (objectInspectionRef.current || sliceInspectionRef.current) return;
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
      if (event.code === "KeyM" && phaseRef.current === "playing") {
        event.preventDefault();
        if (panelRef.current === "map") closeRuntimePanel();
        else openRuntimePanel("map");
        return;
      }
      if (event.code === "KeyN" && phaseRef.current === "playing") {
        event.preventDefault();
        if (panelRef.current === "case-file") closeRuntimePanel();
        else if (!panelRef.current) openRuntimePanel("case-file");
        return;
      }
      if (panelRef.current || dialogueRef.current?.presentation === "stage") return;
      if (event.code === "Space" && phaseRef.current === "playing") {
        event.preventDefault();
        runtimeRef.current?.physics.requestJump();
        return;
      }
      keysRef.current.add(event.code);
      if (["ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
      if (event.code === "Tab") { event.preventDefault(); switchMemory(); }
      if (event.code === "KeyF") interact();
      if (event.code === "KeyE" && phaseRef.current === "playing") {
        const runtime = runtimeRef.current;
        if (runtime) {
          const pose = runtime.physics.pose();
          const player = new THREE.Vector3(pose.x, pose.y, pose.z);
          if (runtime.cameraRig.mode === "exploration") {
            runtime.cameraRig.enterInvestigation(player, yawRef.current, pitchRef.current);
            setSubtitle("调查视角：靠近证物后用准星对准，再按 F 勘验。按 E 返回探索视角。");
          } else {
            runtime.cameraRig.exitInvestigation(player, yawRef.current, pitchRef.current);
          }
        }
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const onWindowBlur = () => {
      keysRef.current.clear();
      keyboardFallbackRef.current = false;
      setKeyboardFallback(false);
    };
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvasRef.current) return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0018, -1.18, 1.18);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("blur", onWindowBlur);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("blur", onWindowBlur); };
  }, [closeRuntimePanel, interact, openRuntimePanel, requestPointerLock, switchMemory]);

  const activeObjective = resolveActiveObjective(chapter.objectives ?? [], checkpoint);
  const traceCount = countFlags(checkpoint.earnedFlags, "west.trace.");
  const rewardCount = CH1_REWARD_POINTS.filter((item) => checkpoint.earnedFlags.includes(item.flag)).length;
  const borrowedObjectAnchored = Boolean(checkpoint.mechanics.borrowedObject?.anchored);
  const sliceObjective = checkpoint.earnedFlags.includes("west.arrived") && !checkpoint.contradictions.includes("waterline-direction") && traceCount < 3
    ? "沿墙脚寻找雨夜留下的痕迹"
    : checkpoint.earnedFlags.includes("west.borrowed-view.ready") && !checkpoint.earnedFlags.includes("west.borrowed-view.seen")
    ? checkpoint.memoryId === "gardener" ? "站在漏窗前，看沈夫人记得的西院" : "回到老周记得的西院，再看同一扇漏窗"
    : checkpoint.earnedFlags.includes("west.borrowed-view.seen") && !checkpoint.earnedFlags.includes("west.borrowed.threshold-stone")
      ? checkpoint.memoryId === "wife" ? "走近沈夫人记得的门槛踏石" : "回到沈夫人的记忆，找到刚才看见的踏石"
      : checkpoint.earnedFlags.includes("west.borrowed.threshold-stone") && !borrowedObjectAnchored
        ? "把这块踏石留在循环转角前"
        : borrowedObjectAnchored && !checkpoint.earnedFlags.includes("west.loop-broken")
          ? checkpoint.memoryId === "gardener" ? "带着踏石继续走过老周记得的回廊" : "回到老周的记忆，看看踏石是否还在"
          : checkpoint.earnedFlags.includes("west.loop-broken") && rewardCount < 2
            ? "沿新出现的路进入夹院"
            : undefined;
  const sliceMapTarget = resolveChapterOneMapTarget(checkpoint);
  const activeObjectivePosition = resolveChapterOneObjectivePosition(checkpoint, activeObjective);
  const activeObjectiveTarget = activeObjective && activeObjectivePosition
    ? { x: activeObjectivePosition[0], z: activeObjectivePosition[2], label: activeObjective.step.instruction }
    : undefined;
  const sliceGuidanceKey = sliceObjective ?? "";
  const sliceGuidanceLevel = sliceGuidanceState.key === sliceGuidanceKey ? sliceGuidanceState.level : 0;
  useEffect(() => {
    sliceGuidanceKeyRef.current = sliceGuidanceKey;
    sliceGuidanceElapsedRef.current = 0;
    sliceGuidanceLevelRef.current = 0;
    if (!sliceGuidanceKey || !save.settings.guidanceAssist) return;
    const timer = window.setInterval(() => {
      const paused = phaseRef.current !== "playing" || Boolean(dialogueRef.current) || Boolean(panelRef.current) || Boolean(objectInspectionRef.current) || Boolean(sliceInspectionRef.current);
      if (paused || sliceGuidanceKeyRef.current !== sliceGuidanceKey) return;
      sliceGuidanceElapsedRef.current += 1;
      const nextLevel = guidanceLevelForElapsed(sliceGuidanceElapsedRef.current);
      if (nextLevel <= sliceGuidanceLevelRef.current) return;
      sliceGuidanceLevelRef.current = nextLevel;
      setSliceGuidanceState({ key: sliceGuidanceKey, level: nextLevel });
      if (nextLevel === 2) {
        
        setSubtitle("先看目标方向上的灯、墙脚与门窗；地图只标调查位置，不会替你判断证词。 ");
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [save.settings.guidanceAssist, sliceGuidanceKey]);
  const candidateMapTarget = sliceMapTarget ?? activeObjectiveTarget;
  const visibleGuidanceLevel = guidanceLevelForProximity(sliceObjective ? sliceGuidanceLevel : (activeObjective?.hintLevel ?? 0), guideDistance);
  const mapTarget = candidateMapTarget && visibleGuidanceLevel >= 1
    ? candidateMapTarget
    : undefined;
  const mapObjective = sliceObjective ?? activeObjective?.step.instruction ?? "在西侧旧园比较两份证词";
  const mapRegion = resolveGameplayRegionForPoint(mapPose);



  const beginTouchMove = (code: string) => {
    touchModeRef.current = true;
    setTouchMode(true);
    keysRef.current.add(code);
  };

  return (
    <main className={`runtime runtime-${checkpoint.memoryId} runtime-phase-${phase}${visualMode ? " visual-regression-mode" : ""}${visualUi ? " visual-regression-ui" : ""}`} data-renderer={backend}>
      <canvas ref={canvasRef} className="runtime-canvas" aria-label="听雨轩西侧旧园调查场景" tabIndex={0} onClick={() => phase === "playing" && !objectInspection && !sliceInspection && requestPointerLock()} onBlur={() => { if (!hasPointerLock) { keyboardFallbackRef.current = false; setKeyboardFallback(false); } }} />
      <div className="vignette" aria-hidden="true" />
      {memoryTransition && <div className="cognition-transition" aria-live="polite"><span>同一位置</span><strong>{memoryTransition.from}</strong><i>→</i><strong>{memoryTransition.to}</strong></div>}
      <header className="runtime-topbar">
        <button type="button" onClick={onExit} className="text-button">← 章节总览</button>
        <div><span>第一章</span><strong>不存在的路</strong></div>

      </header>

      {debugHudEnabled && <aside className="runtime-debug-hud" aria-label="First Walkable 调试信息">
        <strong>{debugTelemetry.architecture === "master" ? "MASTER · tyx-master-scene" : "LEGACY ROLLBACK"}</strong>
        <span>XYZ {debugTelemetry.position.map((value) => value.toFixed(2)).join(" / ")}</span>
        <span>FPS {debugTelemetry.fps.toFixed(1)}</span>
        <span>AREA {debugTelemetry.areaId}</span>
        <span>ROUTE {debugTelemetry.routeAnchorId} · {debugTelemetry.routeDistance.toFixed(1)}m</span>
        <span>GROUNDED {debugTelemetry.grounded ? "YES" : "NO"}</span>
      </aside>}

      <ExplorationHud
        objective={sliceObjective
          ? { label: "当前任务", title: sliceObjective, detail: "先在同一地点核对两份证词能分别成立的事实。" }
          : activeObjective
            ? { label: "当前任务", title: activeObjective.objective.title, detail: activeObjective.step.instruction }
            : undefined}
        map={phase === "playing" ? <MiniMap pose={mapPose} regionId={mapRegion} target={mapTarget} subdued={Boolean(activeDialogue)} onOpen={() => openRuntimePanel("map")} /> : undefined}
        direction={guideDistance !== undefined && visibleGuidanceLevel >= 1 && (sliceObjective || activeObjective?.step.guidance.includes("direction"))
          ? <div className="objective-direction"><i style={{ transform: `rotate(${guideAngle}deg)` }}>↑</i><span>{Math.max(1, Math.round(guideDistance))} m</span></div>
          : undefined}
        prompt={prompt}
        subtitle={save.settings.subtitles && subtitle && !activeDialogue ? <NarrativeInline kind="interaction" text={subtitle} /> : undefined}
      />

      {!objectInspection && !sliceInspection && <div className="touch-controls" aria-label="移动端控制"><div className="touch-move"><button type="button" aria-label="向前" onPointerDown={() => beginTouchMove("KeyW")} onPointerUp={() => keysRef.current.delete("KeyW")} onPointerCancel={() => keysRef.current.delete("KeyW")}>↑</button><button type="button" aria-label="向左" onPointerDown={() => beginTouchMove("KeyA")} onPointerUp={() => keysRef.current.delete("KeyA")} onPointerCancel={() => keysRef.current.delete("KeyA")}>←</button><button type="button" aria-label="向后" onPointerDown={() => beginTouchMove("KeyS")} onPointerUp={() => keysRef.current.delete("KeyS")} onPointerCancel={() => keysRef.current.delete("KeyS")}>↓</button><button type="button" aria-label="向右" onPointerDown={() => beginTouchMove("KeyD")} onPointerUp={() => keysRef.current.delete("KeyD")} onPointerCancel={() => keysRef.current.delete("KeyD")}>→</button></div><div className="touch-actions"><button type="button" onClick={switchMemory}>换证词</button><button type="button" onClick={interact}>勘验</button></div></div>}

      {phase === "loading" && <RuntimeModal eyebrow="正在载入" title="雨夜旧园正在显现…"><p>即将回到两份彼此矛盾的听雨轩。</p></RuntimeModal>}

      {activeDialogue && <DialogueRunner key={activeDialogue.id} sequence={activeDialogue} settings={save.settings} suspended={Boolean(runtimePanel)} restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={checkpoint.seenDialogueLines} onCommand={applyDialogueCommand} onProgress={(inkStateJson) => commitCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))} onSeen={(lineId) => commitCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))} onComplete={() => completeDialogue(activeDialogue)} />}

      {!activeDialogue && phase === "playing" && !hasPointerLock && !keyboardFallback && !touchMode && !sliceInspection && !objectInspection && !runtimePanel && <button type="button" className="resume-control" onClick={requestPointerLock}><span>回到园中</span><small>WASD 移动 · 方向键转向</small></button>}


      {phase === "complete" && !activeDialogue && <RuntimeModal eyebrow="第一章结束" title="脚印是谁的？"><p>侧路尽头的旧脚印从这条“不存在的路”进入夹院，并继续朝主宅和水榭方向延伸。现在只能确认：七年前有人从这里进来过。</p><button type="button" className="primary-button" onClick={onContinue}>继续调查</button><button type="button" className="text-button" onClick={onExit}>返回章节总览</button></RuntimeModal>}
      {phase === "error" && <RuntimeModal eyebrow="雨夜中断" title="旧园没有完整显现"><p>{error}</p><p>已经记下的证物与证词不会丢失。</p><button type="button" className="primary-button" onClick={onExit}>返回案卷</button></RuntimeModal>}

      {sliceInspection && <RuntimeModal eyebrow="现场记录" title={sliceInspection.title} backdropId={sliceInspection.id === "borrowed-view" ? "ch1.borrowed-view" : undefined}><p>{sliceInspection.body}</p><p>{sliceInspection.note}</p><button type="button" className="primary-button" onClick={closeSliceInspection}>记下这一条</button></RuntimeModal>}
      {objectInspection && <ObjectInspector controller={objectInspection.controller} contextLabel={objectInspection.contextLabel} confirmLabel={objectInspection.confirmLabel} onConfirm={closeObjectInspection} />}

      {runtimePanel === "case-file" && <CaseFilePanel checkpoint={checkpoint} completedChapters={save.completedChapters} chapterTitle="第一章 · 不存在的路" onClose={closeRuntimePanel} onOpenMap={() => openRuntimePanel("map", "case-file")} />}
      {runtimePanel === "tutorial" && <TutorialGuide onStart={finishTutorial} />}
      {runtimePanel === "map" && <FullMap pose={mapPose} regionId={mapRegion} target={mapTarget} objective={mapObjective} openRegions={["AREA_A"]} onClose={closeRuntimePanel} />}
      {runtimePanel === "pause" && <PauseMenu onResume={closeRuntimePanel} onMap={() => openRuntimePanel("map", "pause")} onHelp={() => openRuntimePanel("help", "pause")} onSettings={() => openRuntimePanel("settings", "pause")} onExit={onExit} />}
      {runtimePanel === "help" && <HelpPanel chapterTitle="第一章 · 不存在的路" onTutorial={() => openRuntimePanel("tutorial", "help")} onClose={closeRuntimePanel} />}
      {runtimePanel === "settings" && <RuntimeSettingsPanel settings={save.settings} onChange={updateRuntimeSettings} onClose={closeRuntimePanel} />}
    </main>
  );
}

function RuntimeModal({ eyebrow, title, backdropId, children }: { eyebrow: string; title: string; backdropId?: StoryBackdropId; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop">{backdropId && <StoryBackdrop id={backdropId} label={title} />}<section className="runtime-modal" role="dialog" aria-modal="true"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</section></div>;
}
