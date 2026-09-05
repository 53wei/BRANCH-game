"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { completeCampaignChapter } from "./campaign-progress";
import { createCheckpoint } from "./campaign-save";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueCommand, DialogueSequence, MemoryId } from "./types";
import { CameraRig } from "./mechanics/CameraRig";
import { InteractionController, INTERACTION_RANGE_CALIBRATION } from "./mechanics/InteractionController";
import { registerArchitectureCollisionCoverage } from "./runtime/architecture-collision-runtime";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { PhysicsController, PLAYER_PHYSICS_CALIBRATION } from "./runtime/PhysicsController";
import { PLAYER_BODY_CALIBRATION } from "./runtime/player-calibration";
import { TingYuXuanScene } from "./runtime/TingYuXuanScene";
import { PlayerAvatar } from "./runtime/PlayerAvatar";
import type { CaseFileTab } from "./runtime/case-file-content";
import { NORTH_DEPARTURE_DOCUMENT } from "./runtime/document-content";
import { DialogueRunner } from "./narrative/DialogueRunner";
import { compileInkSource } from "./narrative/ink-runtime";
import northInkSource from "./narrative/north-tower-ledger.ink?raw";
import { CaseFilePanel } from "./ui/CaseFilePanel";
import { DocumentViewer } from "./ui/DocumentViewer";
import { ExplorationHud } from "./ui/ExplorationHud";
import { NarrativeInline } from "./narrative/NarrativeInline";
import { guidanceLevelForElapsed, guidanceLevelForProximity } from "./runtime/guidance-config";
import { getGameplayAnchor, resolveGameplayRegionForPoint } from "./runtime/tingyuxuan-gameplay-map";
import { tingYuXuanLayout } from "./runtime/tingyuxuan-layout";

interface NorthTowerRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
  onContinue?: () => void;
}

type NorthPhase = "loading" | "playing" | "complete" | "error";
type EvidenceId = "sixth-teacup" | "departure-record" | "artist-viewpoint";

const unique = <T,>(values: T[]) => [...new Set(values)];
const memoryOrder: MemoryId[] = ["wife", "accountant", "painter"];
const evidenceFlags = [
  "north.evidence.sixth-cup",
  "north.evidence.departure-record",
  "north.evidence.rain-figure",
] as const;
const NORTH_STORY_CONTENT = compileInkSource("north-tower-ledger", northInkSource);

const evidenceAnchor = (id: EvidenceId) => {
  const anchorId = id === "sixth-teacup" ? "B_TEA_TABLE"
    : id === "departure-record" ? "B_LEDGER"
      : "B_IMAGE_EVIDENCE";
  return getGameplayAnchor(anchorId);
};

const resumeNorthDialogueId = (checkpoint: CheckpointState): string | undefined => {
  if (checkpoint.dialogueProgress?.sequenceId) return checkpoint.dialogueProgress.sequenceId;
  const flags = checkpoint.earnedFlags;
  if (!flags.includes("north.dialogue.opening-complete")) return "north-opening";
  if (flags.includes("north.evidence.sixth-cup") && !flags.includes("north.dialogue.cup-reaction-complete")) return "north-cup-confirmed";
  if (flags.includes("north.dialogue.cup-reaction-complete") && !flags.includes("north.dialogue.record-intro-complete")) return "north-record-intro";
  if (flags.includes("north.evidence.departure-record") && !flags.includes("north.dialogue.record-reaction-complete")) return "north-record-confirmed";
  if (flags.includes("north.dialogue.record-reaction-complete") && !flags.includes("north.dialogue.image-intro-complete")) return "north-image-intro";
  if (flags.includes("north.evidence.rain-figure") && !flags.includes("north.dialogue.image-reaction-complete")) return "north-image-confirmed";
  return undefined;
};

const objectiveFor = (checkpoint: CheckpointState) => {
  const flags = checkpoint.earnedFlags;
  if (!flags.includes("north.evidence.sixth-cup")) {
    return { title: "先确认多出来的生活痕迹", detail: "主院茶桌上有六只杯子。先证明第六只确实被人用过。", hint: "先数杯子，再看杯沿与杯底是否有刚留下的水痕。", targetId: "sixth-teacup" as const };
  }
  if (!flags.includes("north.evidence.departure-record")) {
    return { title: "去看那张被改过的离园记录", detail: "回到钱先生记得的主宅内侧，看看纸上的补墨和压痕。", hint: "后补的墨色，与原来的字并不完全一样。", targetId: "departure-record" as const };
  }
  if (!flags.includes("north.evidence.rain-figure")) {
    return { title: "站到柳生当年画画的位置", detail: "在旧画旁顺着他的视线望出去，让远处的人影落进画框。", hint: "站在旧画旁，缓慢转动视线，让远处人影落进画框中心。", targetId: "artist-viewpoint" as const };
  }
  if (!flags.includes("north.fifth-person.confirmed")) {
    return { title: "在案卷中交叉核对三件事实", detail: "打开案卷的问题页，只回答一个问题：案发当晚有没有第五个人？", hint: "按 N 打开案卷。生活痕迹、文字记录和图像框景都已归档。", targetId: undefined };
  }
  return { title: "第五人确实存在", detail: "本章到这里为止。身份仍然未知。", hint: "", targetId: undefined };
};

interface EvidenceVisuals {
  root: THREE.Group;
  teaAnchor: THREE.Group;
  ledgerAnchor: THREE.Group;
  painting: THREE.Mesh;
  figure: THREE.Group;
}

async function buildEvidenceVisuals(world: TingYuXuanScene): Promise<EvidenceVisuals> {
  const root = new THREE.Group();
  root.name = "B_Chapter02_EvidenceLayer";

  const tea = evidenceAnchor("sixth-teacup").position;
  const teaAnchor = new THREE.Group();
  teaAnchor.name = "B_TeaTable_FormalAssetAnchor";
  teaAnchor.position.set(tea[0], 0, tea[2]);
  // Never substitute cylinders for tableware in formal play. The authored Master
  // environment carries the physical room; this anchor only owns interaction and
  // a local light until a licensed tea-set asset is added to the manifest.
  const teaLight = new THREE.PointLight("#d8b777", 1.8, 3.4, 1.8);
  teaLight.position.y = 1.0;
  teaAnchor.add(teaLight);
  world.registerRangeLimitedPointLight(teaLight);
  root.add(teaAnchor);

  const ledger = evidenceAnchor("departure-record").position;
  const ledgerAnchor = new THREE.Group();
  ledgerAnchor.name = "B_DepartureRecord_FormalAssetAnchor";
  ledgerAnchor.position.set(ledger[0], 0.82, ledger[2]);
  root.add(ledgerAnchor);

  const paintingPosition = evidenceAnchor("artist-viewpoint").position;
  const paintingTexture = await new THREE.TextureLoader().loadAsync("/media/cg/story-v1/cg-03-liusheng-fifth-figure-v1.png");
  paintingTexture.colorSpace = THREE.SRGBColorSpace;
  const paintingMaterial = new THREE.MeshStandardMaterial({ map: paintingTexture, roughness: 0.78, transparent: true, opacity: 0.64, side: THREE.DoubleSide });
  const painting = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.6), paintingMaterial);
  painting.name = "B_PaintingEvidence_AuthoredArtwork";
  painting.position.set(paintingPosition[0], 1.18, paintingPosition[2]);
  painting.rotation.y = 0.4;
  root.add(painting);

  const figure = new THREE.Group();
  figure.name = "B_RainFigure_ViewDependent_Anchor";
  figure.position.set(paintingPosition[0] - 3.1, 0.7, paintingPosition[2] - 3.7);
  root.add(figure);

  world.proceduralDressing.add(root);
  return { root, teaAnchor, ledgerAnchor, painting, figure };
}

function setEvidenceMemory(visuals: EvidenceVisuals, memory: MemoryId, aligned: boolean) {
  const paintingMaterial = visuals.painting.material as THREE.MeshStandardMaterial;
  paintingMaterial.opacity = memory === "painter" ? (aligned ? 0.98 : 0.72) : 0.26;
  visuals.teaAnchor.visible = memory === "wife";
  visuals.ledgerAnchor.visible = memory === "accountant";
}

export function NorthTowerRuntime({ chapter, save, onSave, onExit, onContinue }: NorthTowerRuntimeProps) {
  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) {
      const memoryId = memoryOrder.includes(save.activeCheckpoint.memoryId) ? save.activeCheckpoint.memoryId : "wife";
      return { ...save.activeCheckpoint, memoryId, anchorId: save.activeCheckpoint.anchorId || "ROUTE_05_B_MAIN_COURT" };
    }
    return {
      ...createCheckpoint(chapter.id, "wife"),
      anchorId: "ROUTE_05_B_MAIN_COURT",
      activeObjectiveId: "north-life-evidence",
      objectiveStepId: "inspect-sixth-cup",
    };
  });
  const initialMemory = initialCheckpoint.memoryId;
  const initialPhase: NorthPhase = initialCheckpoint.earnedFlags.includes("north.fifth-person.confirmed") ? "complete" : "loading";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{
    renderer: Awaited<ReturnType<typeof createRenderer>>;
    world: TingYuXuanScene;
    physics: PhysicsController;
    cameraRig: CameraRig;
    interaction: InteractionController;
    playerAvatar: PlayerAvatar;
    visuals: EvidenceVisuals;
  } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const yawRef = useRef(initialCheckpoint.yaw ?? getGameplayAnchor("ROUTE_05_B_MAIN_COURT").yaw);
  const pitchRef = useRef(0);
  const memoryRef = useRef<MemoryId>(initialMemory);
  const phaseRef = useRef<NorthPhase>(initialPhase);
  const checkpointRef = useRef(initialCheckpoint);
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const keyboardFallbackRef = useRef(false);
  const viewAlignedRef = useRef(false);
  const caseFileOpenRef = useRef(false);
  const documentOpenRef = useRef(false);
  const dialogueRef = useRef<DialogueSequence | undefined>(undefined);
  const guidanceKeyRef = useRef("");
  const guidanceElapsedRef = useRef(0);
  const guidanceLevelRef = useRef(0);
  const lastGuideUiUpdateRef = useRef(0);

  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const [phase, setPhaseState] = useState<NorthPhase>(initialPhase);
  const [backend, setBackend] = useState<RendererBackend>();
  const [memory, setMemory] = useState<MemoryId>(initialMemory);
  const [prompt, setPrompt] = useState<string>();
  const [subtitle, setSubtitle] = useState("西侧旧园的脚印把你带进主宅。现在先查清：今晚到底有没有多出来一个人。");
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [keyboardFallback, setKeyboardFallback] = useState(false);
  const [guidanceLevel, setGuidanceLevel] = useState(0);
  const [guideDistance, setGuideDistance] = useState<number>();
  const [guideAngle, setGuideAngle] = useState(0);

  const [error, setError] = useState("");

  const [showCaseFile, setShowCaseFileState] = useState(false);
  const [caseFileInitialTab, setCaseFileInitialTab] = useState<CaseFileTab>("evidence");
  const [showDepartureDocument, setShowDepartureDocument] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<DialogueSequence>();

  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [save, onSave]);
  const setPhase = useCallback((next: NorthPhase) => { phaseRef.current = next; setPhaseState(next); }, []);
  const requestPointerLock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.focus();
    keyboardFallbackRef.current = true;
    setKeyboardFallback(true);
    const result = canvas.requestPointerLock?.();
    if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
  }, []);

  const setCaseFileOpen = useCallback((next: boolean, initialTab: CaseFileTab = "evidence") => {
    caseFileOpenRef.current = next;
    if (next) setCaseFileInitialTab(initialTab);
    setShowCaseFileState(next);
    keysRef.current.clear();
    runtimeRef.current?.interaction.clearFocus();
    if (next) document.exitPointerLock?.();
    else if (phaseRef.current === "playing" && !documentOpenRef.current) requestPointerLock();
  }, [requestPointerLock]);

  const setDepartureDocumentOpen = useCallback((next: boolean) => {
    documentOpenRef.current = next;
    setShowDepartureDocument(next);
    keysRef.current.clear();
    runtimeRef.current?.interaction.clearFocus();
    if (next) document.exitPointerLock?.();
    else if (phaseRef.current === "playing" && !caseFileOpenRef.current) requestPointerLock();
  }, [requestPointerLock]);

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

  const addFlag = useCallback((flag: string) => commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, flag]) })), [commitCheckpoint]);
  const setObjective = useCallback((objectiveId: string, stepId: string) => commitCheckpoint((current) => ({ ...current, activeObjectiveId: objectiveId, objectiveStepId: stepId })), [commitCheckpoint]);

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

  const applyDialogueCommand = useCallback((command: DialogueCommand) => {
    if (command.type === "objective:start") {
      setObjective(command.objectiveId, command.stepId);
    } else if (command.type === "objective:step") {
      commitCheckpoint((current) => ({ ...current, objectiveStepId: command.stepId }));
    } else if (command.type === "flag:set") {
      addFlag(command.flag);
    } else if (command.type === "memory:unlock") {
      addFlag(`memory.${command.memoryId}.unlocked`);
    }
  }, [addFlag, commitCheckpoint, setObjective]);

  const finishDepartureDocument = useCallback(() => {
    setDepartureDocumentOpen(false);
    if (checkpointRef.current.earnedFlags.includes("north.evidence.departure-record")) return;
    addFlag("north.evidence.departure-record");
    setSubtitle("");
    startDialogue("north-record-confirmed");
  }, [addFlag, setDepartureDocumentOpen, startDialogue]);

  const changeMemory = useCallback((next: MemoryId) => {
    memoryRef.current = next;
    setMemory(next);
    runtimeRef.current?.world.setMemory(next);
    runtimeRef.current?.interaction.clearFocus();
    viewAlignedRef.current = false;
    if (runtimeRef.current) setEvidenceMemory(runtimeRef.current.visuals, next, false);
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
    setSubtitle(next === "wife"
      ? "沈夫人记得茶杯、座位和那些被收起来的东西。"
      : next === "accountant"
        ? "钱先生记得被写下来的事实。改字、补墨和压痕会变得更清楚。"
        : "柳生只记得自己当时看见的画面。站回原来的位置，远处的人影才看得清。"
    );
  }, [commitCheckpoint]);

  const finishChapter = useCallback(() => {
    if (phaseRef.current === "complete") return;
    const finalCheckpoint = commitCheckpoint((current) => ({
      ...current,
      anchorId: "ROUTE_06_B_NORTHEAST_LINK",
      mechanics: { ...current.mechanics, safeAnchorId: "ROUTE_06_B_NORTHEAST_LINK" },
      activeObjectiveId: undefined,
      objectiveStepId: undefined,
      earnedFlags: unique([...current.earnedFlags, "north.fifth-person.confirmed"]),
    }));
    const nextSave = completeCampaignChapter(saveRef.current, chapter.id, finalCheckpoint);
    checkpointRef.current = nextSave.activeCheckpoint;
    setCheckpoint(nextSave.activeCheckpoint);
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    document.exitPointerLock?.();
    setPhase("complete");
  }, [chapter.id, commitCheckpoint, setPhase]);

  const completeDialogue = useCallback((sequence: DialogueSequence) => {
    dialogueRef.current = undefined;
    setActiveDialogue(undefined);
    commitCheckpoint((current) => ({
      ...current,
      dialogueProgress: undefined,
      pointerLockPending: false,
      earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags,
    }));

    if (sequence.id === "north-opening") {
      setSubtitle("");
      requestPointerLock();
    } else if (sequence.id === "north-cup-confirmed") {
      startDialogue("north-record-intro");
    } else if (sequence.id === "north-record-intro") {
      setSubtitle("");
      requestPointerLock();
    } else if (sequence.id === "north-record-confirmed") {
      startDialogue("north-image-intro");
    } else if (sequence.id === "north-image-intro") {
      setSubtitle("");
      requestPointerLock();
    } else if (sequence.id === "north-image-confirmed") {
      setSubtitle("三条事实已经分别归档。现在去案卷的问题页交叉核对。 ");
      setCaseFileOpen(true, "questions");
    } else if (sequence.id === "north-completion") {
      finishChapter();
    }
  }, [commitCheckpoint, finishChapter, requestPointerLock, setCaseFileOpen, startDialogue]);

  const handleEvidence = useCallback((id: EvidenceId) => {
    const flags = checkpointRef.current.earnedFlags;
    if (id === "sixth-teacup") {
      if (flags.includes("north.evidence.sixth-cup")) return;
      addFlag("north.evidence.sixth-cup");
      setSubtitle("");
      startDialogue("north-cup-confirmed");
      return;
    }
    if (id === "departure-record") {
      if (!flags.includes("north.evidence.sixth-cup")) { setSubtitle("先确认茶桌上多出来的生活痕迹。"); return; }
      if (memoryRef.current !== "accountant") { setSubtitle("先回到钱先生记得的主宅。这里要查的是纸上的痕迹。"); return; }
      if (flags.includes("north.evidence.departure-record")) return;
      setDepartureDocumentOpen(true);
      return;
    }
    if (id === "artist-viewpoint") {
      if (!flags.includes("north.evidence.departure-record")) { setSubtitle("先把文字记录的修改痕迹固定下来。"); return; }
      if (memoryRef.current !== "painter") { setSubtitle("先回到柳生画画时看见的主宅，再站到旧画旁。"); return; }
      if (!viewAlignedRef.current) { setSubtitle("位置差不多，但角度还不对。慢慢转动镜头，让远处人影落进画框中心。"); return; }
      if (flags.includes("north.evidence.rain-figure")) return;
      addFlag("north.evidence.rain-figure");
      setSubtitle("");
      startDialogue("north-image-confirmed");
      return;
    }
  }, [addFlag, setDepartureDocumentOpen, startDialogue]);

  const synthesizeFifthPerson = useCallback(() => {
    const ready = evidenceFlags.every((flag) => checkpointRef.current.earnedFlags.includes(flag));
    if (!ready) {
      setSubtitle("还缺事实。茶杯、离园记录和旧画里的人影都要先查清。");
      setCaseFileOpen(false);
      return;
    }
    setCaseFileOpen(false);
    setSubtitle("");
    startDialogue("north-completion");
  }, [setCaseFileOpen, startDialogue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const boot = async () => {
      try {
        const renderer = await createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality });
        const spawnAnchor = getGameplayAnchor("ROUTE_05_B_MAIN_COURT");
        const restored = initialCheckpoint.position;
        const spawn = {
          x: restored?.[0] ?? spawnAnchor.position[0],
          y: Math.max(restored?.[1] ?? spawnAnchor.position[1], PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY),
          z: restored?.[2] ?? spawnAnchor.position[2],
        };
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
        const visuals = await buildEvidenceVisuals(world);
        const evidenceItems: Array<{ id: EvidenceId; label: string }> = [
          { id: "sixth-teacup", label: "检查第六只茶杯" },
          { id: "departure-record", label: "核对离园记录" },
          { id: "artist-viewpoint", label: "固定柳生框景中的人影" },
        ];
        evidenceItems.forEach((item) => {
          const anchor = evidenceAnchor(item.id);
          const position = new THREE.Vector3(anchor.position[0], item.id === "artist-viewpoint" ? 1.15 : 0.9, anchor.position[2]);
          const focusRoot = item.id === "artist-viewpoint" ? visuals.painting : undefined;
          interaction.registerPoint({
            id: item.id,
            type: "evidence",
            label: item.label,
            maxDistance: item.id === "artist-viewpoint" ? INTERACTION_RANGE_CALIBRATION.viewpoint : INTERACTION_RANGE_CALIBRATION.standardEvidence,
            enabledWhen: () => phaseRef.current === "playing" && objectiveFor(checkpointRef.current).targetId === item.id,
            onInteract: () => handleEvidence(item.id),
          }, position, INTERACTION_RANGE_CALIBRATION.standardProxyRadius, focusRoot);
        });
        world.setMemory(memoryRef.current);
        setEvidenceMemory(visuals, memoryRef.current, false);
        yawRef.current = initialCheckpoint.yaw ?? spawnAnchor.yaw;
        cameraRig.syncExploration(new THREE.Vector3(spawn.x, spawn.y, spawn.z), yawRef.current, pitchRef.current, true);
        runtimeRef.current = { renderer, world, physics, cameraRig, interaction, playerAvatar, visuals };
        setBackend(renderer.backend);
        canvas.dataset.architectureMode = world.architectureMode();
        canvas.dataset.gameplayArea = "AREA_B";

        const resize = () => {
          const rect = canvas.getBoundingClientRect();
          renderer.resize(rect.width, rect.height, window.devicePixelRatio);
          world.camera.aspect = rect.width / Math.max(rect.height, 1);
          world.camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        let previous = performance.now();
        renderer.renderer.setAnimationLoop((now: number) => {
          const delta = Math.min((now - previous) / 1000, 0.05);
          previous = now;
          let pose = physics.pose();
          if (phaseRef.current === "playing" && !caseFileOpenRef.current && !documentOpenRef.current && !dialogueRef.current) {
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
          const avatarMoving = phaseRef.current === "playing" && !caseFileOpenRef.current && !documentOpenRef.current && !dialogueRef.current && (keysRef.current.has("KeyW") || keysRef.current.has("KeyA") || keysRef.current.has("KeyS") || keysRef.current.has("KeyD"));
          playerAvatar.update(pose, yawRef.current, avatarMoving, delta);
          cameraRig.syncExploration(player, yawRef.current, pitchRef.current);
          cameraRig.update(delta);
          world.update(delta, player, false);

          const painterAnchor = evidenceAnchor("artist-viewpoint");
          const painterPos = new THREE.Vector3(painterAnchor.position[0], 1.1, painterAnchor.position[2]);
          const nearFrame = player.distanceTo(painterPos) < 2.8;
          const cameraForward = new THREE.Vector3();
          world.camera.getWorldDirection(cameraForward);
          const toFigure = visuals.figure.position.clone().sub(world.camera.position).normalize();
          const aligned = memoryRef.current === "painter" && nearFrame && cameraForward.dot(toFigure) > 0.965;
          if (aligned !== viewAlignedRef.current) {
            viewAlignedRef.current = aligned;
            setEvidenceMemory(visuals, memoryRef.current, aligned);
          }

          const focus = caseFileOpenRef.current || documentOpenRef.current || dialogueRef.current
            ? (interaction.clearFocus(), undefined)
            : interaction.focus(world.camera, world.camera.position);
          setPrompt(focus?.canInteract ? focus.definition.label : undefined);
          const currentObjective = objectiveFor(checkpointRef.current);
          const guidanceKey = currentObjective.targetId ?? "";
          const targetAnchor = currentObjective.targetId ? evidenceAnchor(currentObjective.targetId) : undefined;
          const targetDistance = targetAnchor ? Math.hypot(targetAnchor.position[0] - pose.x, targetAnchor.position[2] - pose.z) : undefined;
          if (guidanceKey !== guidanceKeyRef.current) {
            guidanceKeyRef.current = guidanceKey;
            guidanceElapsedRef.current = 0;
            guidanceLevelRef.current = 0;
            setGuidanceLevel(0);
            setGuideDistance(undefined);

          } else if (phaseRef.current === "playing" && !caseFileOpenRef.current && !documentOpenRef.current && !dialogueRef.current && saveRef.current.settings.guidanceAssist && guidanceKey) {
            guidanceElapsedRef.current += delta;
            const nextLevel = guidanceLevelForProximity(guidanceLevelForElapsed(guidanceElapsedRef.current), targetDistance);
            if (nextLevel !== guidanceLevelRef.current) {
              const previousLevel = guidanceLevelRef.current;
              guidanceLevelRef.current = nextLevel;
              setGuidanceLevel(nextLevel);

              if (nextLevel === 2 && previousLevel < 2) setSubtitle(currentObjective.hint);
            }
          }
          if (targetAnchor && now - lastGuideUiUpdateRef.current >= 120) {
            lastGuideUiUpdateRef.current = now;
            setGuideDistance(targetDistance);
            setGuideAngle(THREE.MathUtils.radToDeg(Math.atan2(targetAnchor.position[0] - pose.x, -(targetAnchor.position[2] - pose.z)) - yawRef.current));
          }
          if (targetAnchor && saveRef.current.settings.guidanceAssist && guidanceLevelRef.current >= 3) {
            world.setGuidanceTarget(new THREE.Vector3(targetAnchor.position[0], 0, targetAnchor.position[2]), "subtle");
          } else {
            world.setGuidanceTarget(undefined);
          }
          const currentArea = resolveGameplayRegionForPoint({ x: pose.x, z: pose.z });
          canvas.dataset.playerPose = `${pose.x.toFixed(2)},${pose.y.toFixed(2)},${pose.z.toFixed(2)}`;
          canvas.dataset.playerAvatarVisible = String(playerAvatar.root.visible && playerAvatar.root.parent !== null);
          canvas.dataset.gameplayArea = currentArea;
          canvas.dataset.grounded = String(physics.isGrounded());
          renderer.renderer.render(world.scene, world.camera);
        });

        if (phaseRef.current !== "complete") {
          setPhase("playing");
          const resumeDialogueId = resumeNorthDialogueId(initialCheckpoint);
          if (resumeDialogueId) startDialogue(resumeDialogueId);
          else if (initialCheckpoint.earnedFlags.includes("north.dialogue.completion-complete") && !initialCheckpoint.earnedFlags.includes("north.fifth-person.confirmed")) finishChapter();
          else requestPointerLock();
        }
        return () => window.removeEventListener("resize", resize);
      } catch (reason) {
        console.error("[north-tower] scene failed to appear", reason);
        setError("主宅与画室的旧日痕迹没有完整显现。调查记录仍然保留，可以返回案卷后重新进入。");
        setPhase("error");
      }
    };

    let resizeCleanup: (() => void) | undefined;
    void boot().then((cleanup) => { resizeCleanup = cleanup; });
    return () => {
      cancelled = true;
      resizeCleanup?.();
      const runtime = runtimeRef.current;
      runtime?.renderer.renderer.setAnimationLoop(null);
      runtime?.interaction.dispose();
      runtime?.cameraRig.dispose();
      runtime?.physics.dispose();
      runtime?.world.dispose();
      runtime?.renderer.dispose();
      runtimeRef.current = undefined;
    };
  }, [chapter.memories, finishChapter, handleEvidence, initialCheckpoint, requestPointerLock, save.settings.quality, save.settings.renderer, save.settings.stableCamera, setPhase, startDialogue]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "Tab", "Space", "KeyN"].includes(event.code)) event.preventDefault();
      if (event.repeat || phaseRef.current !== "playing") return;
      if (documentOpenRef.current || dialogueRef.current) return;
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
      if (document.pointerLockElement !== canvasRef.current || phaseRef.current !== "playing" || caseFileOpenRef.current || documentOpenRef.current || dialogueRef.current) return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0019, -1.12, 1.04);
    };
    const onBlur = () => { keysRef.current.clear(); keyboardFallbackRef.current = false; setKeyboardFallback(false); };
    const onLockChange = () => setHasPointerLock(document.pointerLockElement === canvasRef.current);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("blur", onBlur);
    document.addEventListener("pointerlockchange", onLockChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerlockchange", onLockChange);
    };
  }, [changeMemory, setCaseFileOpen]);

  const objective = objectiveFor(checkpoint);
  return (
    <main className={`runtime runtime-${memory}`} data-renderer={backend}>
      <canvas ref={canvasRef} className="runtime-canvas" tabIndex={0} aria-label="第二章主宅调查场景" onClick={() => phase === "playing" && !showCaseFile && !showDepartureDocument && !activeDialogue && requestPointerLock()} />
      <div className="vignette" aria-hidden="true" />
      <div className="runtime-topbar">
        <button type="button" className="text-button" onClick={onExit}>← 返回案卷</button>
        <div><span>第二章</span><strong>多出来的人</strong></div>

      </div>
      <ExplorationHud
        objective={phase !== "complete" && !activeDialogue ? { label: "当前问题", title: objective.title, detail: objective.detail } : undefined}
        direction={guideDistance !== undefined && guidanceLevel >= 1 ? <div className="objective-direction"><i style={{ transform: `rotate(${guideAngle}deg)` }}>↑</i><span>{Math.max(1, Math.round(guideDistance))} m</span></div> : undefined}
        prompt={phase === "playing" && !showCaseFile && !showDepartureDocument && !activeDialogue ? prompt : undefined}
        subtitle={save.settings.subtitles && subtitle && phase === "playing" && !showCaseFile && !showDepartureDocument && !activeDialogue ? <NarrativeInline kind="interaction" text={subtitle} /> : undefined}
      />



      {phase === "playing" && !showCaseFile && !showDepartureDocument && !activeDialogue && !hasPointerLock && !keyboardFallback && <button type="button" className="pointer-lock-callout" onClick={requestPointerLock}>继续调查<br /><small>回到主宅雨夜</small></button>}
      {activeDialogue && <DialogueRunner key={activeDialogue.id} sequence={activeDialogue} storyContent={NORTH_STORY_CONTENT} settings={save.settings} restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={checkpoint.seenDialogueLines} onCommand={applyDialogueCommand} onProgress={(inkStateJson) => commitCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))} onSeen={(lineId) => commitCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))} onComplete={() => completeDialogue(activeDialogue)} />}
      {showDepartureDocument && <DocumentViewer document={NORTH_DEPARTURE_DOCUMENT} onClose={finishDepartureDocument} />}
      {showCaseFile && <CaseFilePanel checkpoint={checkpoint} completedChapters={save.completedChapters} chapterTitle="第二章 · 多出来的人" initialTab={caseFileInitialTab} questionAction={{ questionId: "was-there-fifth-person", requiredEvidenceIds: ["north-sixth-cup", "north-departure-record", "north-rain-figure"], label: "确认：案发当晚确实还有第五个人", onConfirm: synthesizeFifthPerson }} onClose={() => setCaseFileOpen(false)} />}
      {phase === "complete" && <NorthModal eyebrow="第二章结束" title="被所有人删掉的第五个人是谁？"><img className="chapter-cg-inline" src="/media/cg/story-v1/cg-03-liusheng-fifth-figure-v1.png" alt="柳生雨夜画中只有特定观看角度才能成立的人影" /><p>侧路脚印、第六只反复使用过的茶杯、被改过的离园记录和柳生的雨夜画稿已经被放在一起。</p><blockquote>老周留下了一把北墙旧锁的备份钥匙。下一步不去猜这个人是谁，而是去找这个人在听雨轩里真正生活过的位置。</blockquote>{onContinue && <button type="button" className="primary-button" onClick={onContinue}>继续第三章：不存在的房间</button>}<button type="button" className="text-button" onClick={onExit}>返回案卷目录</button></NorthModal>}
      {phase === "error" && <NorthModal eyebrow="旧影中断" title="主宅没有完整显现"><p>{error}</p><button type="button" className="primary-button" onClick={onExit}>返回案卷目录</button></NorthModal>}
    </main>
  );
}

function NorthModal({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop"><section className="runtime-modal"><span>{eyebrow}</span><h2>{title}</h2>{children}</section></div>;
}
