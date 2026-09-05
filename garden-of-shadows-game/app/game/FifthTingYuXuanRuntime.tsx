"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { completeCampaignChapter } from "./campaign-progress";
import { createCheckpoint } from "./campaign-save";
import { CameraRig } from "./mechanics/CameraRig";
import { DialogueRunner } from "./narrative/DialogueRunner";
import { deriveEndingLens } from "./narrative/finale-ending";
import { FINAL_FACT_IDS } from "./narrative/finale-facts";
import { compileInkSource } from "./narrative/ink-runtime";
import fifthTingYuXuanInkSource from "./narrative/fifth-tingyuxuan.ink?raw";
import { StoryCGViewer } from "./narrative/StoryCGViewer";
import { storyCGById } from "./narrative/story-cg";
import { campaignManifest } from "./manifests/campaign";
import { registerArchitectureCollisionCoverage } from "./runtime/architecture-collision-runtime";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { PhysicsController, PLAYER_PHYSICS_CALIBRATION } from "./runtime/PhysicsController";
import { PLAYER_BODY_CALIBRATION } from "./runtime/player-calibration";
import { PlayerAvatar } from "./runtime/PlayerAvatar";
import { TingYuXuanScene } from "./runtime/TingYuXuanScene";
import { FINALE_DOCUMENTARY_ADDENDUM } from "./runtime/document-content";
import { getGameplayAnchor } from "./runtime/tingyuxuan-gameplay-map";
import { tingYuXuanLayout } from "./runtime/tingyuxuan-layout";
import { CaseFilePanel } from "./ui/CaseFilePanel";
import { DocumentViewer } from "./ui/DocumentViewer";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueSequence } from "./types";

interface FifthTingYuXuanRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
}

type Phase = "loading" | "playing" | "complete" | "error";

const STORY_CONTENT = compileInkSource("fifth-tingyuxuan", fifthTingYuXuanInkSource);
const GATE = getGameplayAnchor("ROUTE_01_START");
const SIDE_ROUTE = getGameplayAnchor("ROUTE_04_A_EAST_EXIT");
const OLD_ROOM = getGameplayAnchor("B_CHILD_BOX");
const OLD_ROOM_WINDOW = getGameplayAnchor("B_MISSING_WINDOW");
const WATER = getGameplayAnchor("C_WATER_EDGE");
const ROUTE_SEQUENCE = ["finale-gate", "finale-side-route", "finale-old-room", "finale-water"] as const;
const GOODBYE_SEQUENCE = ["finale-wife-goodbye", "finale-steward-goodbye", "finale-accountant-goodbye", "finale-painter-goodbye"] as const;
const unique = <T,>(values: T[]) => [...new Set(values)];
const distance2D = (pose: { x: number; z: number }, target: readonly [number, number, number]) => Math.hypot(pose.x - target[0], pose.z - target[2]);

const sequenceById = (chapter: ChapterManifest, id: string) => chapter.dialogueSequences?.find((item) => item.id === id);

const endingMomentComplete = (checkpoint: CheckpointState) => checkpoint.earnedFlags.includes("finale.ending-moment-complete");

async function buildCompositeSpatialSting(world: TingYuXuanScene) {
  const root = new THREE.Group();
  root.name = "Finale_Composite_SilentSeventhFrame";
  root.visible = false;

  // A real authored lattice/wall mesh is reused here. This is intentionally not a
  // debug-primitive frame: the final sting must look like architecture, not UI.
  const lattice = await world.cloneFormalAsset("tyx-arch-pavilion-a", "LP_ChinesePavWalls");
  lattice.name = "Finale_Composite_AuthoredLattice_CC_BY";
  const bounds = new THREE.Box3().setFromObject(lattice);
  const size = bounds.getSize(new THREE.Vector3());
  const uniform = 1.7 / Math.max(size.x, size.y, size.z, 0.001);
  lattice.scale.multiplyScalar(uniform);
  lattice.updateMatrixWorld(true);
  const scaled = new THREE.Box3().setFromObject(lattice);
  const center = scaled.getCenter(new THREE.Vector3());
  lattice.position.set(
    OLD_ROOM_WINDOW.position[0] + 0.82 - center.x,
    0.42 - scaled.min.y,
    OLD_ROOM_WINDOW.position[2] + 0.28 - center.z,
  );
  lattice.rotation.y = OLD_ROOM_WINDOW.yaw + 0.03;
  lattice.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const sourceWasArray = Array.isArray(child.material);
    const materials = sourceWasArray ? child.material : [child.material];
    const prepared = materials.map((source: THREE.Material) => {
      const material = source.clone();
      material.transparent = true;
      material.opacity = 0.88;
      material.depthWrite = true;
      return material;
    });
    child.material = sourceWasArray ? prepared : prepared[0];
  });
  root.add(lattice);
  world.proceduralDressing.add(root);
  return root;
}

export function FifthTingYuXuanRuntime({ chapter, save, onSave, onExit }: FifthTingYuXuanRuntimeProps) {
  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) return { ...save.activeCheckpoint, memoryId: "zhaoying" };
    return {
      ...createCheckpoint(chapter.id, "zhaoying"),
      earnedFlags: [...save.activeCheckpoint.earnedFlags],
      reconstructionTrace: save.activeCheckpoint.reconstructionTrace,
      observedBy: save.activeCheckpoint.observedBy,
      contradictions: [...save.activeCheckpoint.contradictions],
      anchorId: "ROUTE_01_START",
      position: [...GATE.position],
      yaw: GATE.yaw,
    };
  });
  const initialComplete = initialCheckpoint.earnedFlags.includes("fifth-tingyuxuan.complete");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{
    renderer: Awaited<ReturnType<typeof createRenderer>>;
    world: TingYuXuanScene;
    physics: PhysicsController;
    cameraRig: CameraRig;
    playerAvatar: PlayerAvatar;
    compositeSting: THREE.Group;
  } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const checkpointRef = useRef(initialCheckpoint);
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const phaseRef = useRef<Phase>(initialComplete ? "complete" : "loading");
  const dialogueRef = useRef<DialogueSequence | undefined>(undefined);
  const caseFileOpenRef = useRef(false);
  const yawRef = useRef(initialCheckpoint.yaw ?? GATE.yaw);
  const pitchRef = useRef(0);
  const keyboardFallbackRef = useRef(false);
  const lastAreaLoadRef = useRef(0);
  const endingMomentOpenRef = useRef(false);

  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const [phase, setPhaseState] = useState<Phase>(initialComplete ? "complete" : "loading");
  const [activeDialogue, setActiveDialogue] = useState<DialogueSequence>();
  const [showCaseFile, setShowCaseFile] = useState(false);
  const [backend, setBackend] = useState<RendererBackend>();
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [keyboardFallback, setKeyboardFallback] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [save, onSave]);
  const setPhase = useCallback((next: Phase) => { phaseRef.current = next; setPhaseState(next); }, []);

  const commitCheckpoint = useCallback((producer: (current: CheckpointState) => CheckpointState) => {
    const pose = runtimeRef.current?.physics.pose();
    const current = checkpointRef.current;
    const next = producer({
      ...current,
      memoryId: "zhaoying",
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
    if (!canvas || phaseRef.current !== "playing" || dialogueRef.current || caseFileOpenRef.current || endingMomentOpenRef.current) return;
    canvas.focus();
    keyboardFallbackRef.current = true;
    setKeyboardFallback(true);
    const result = canvas.requestPointerLock?.();
    if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
  }, []);

  const setCaseFileOpen = useCallback((next: boolean) => {
    caseFileOpenRef.current = next;
    setShowCaseFile(next);
    keysRef.current.clear();
    if (next) document.exitPointerLock?.();
    else if (phaseRef.current === "playing" && !dialogueRef.current && !endingMomentOpenRef.current) requestPointerLock();
  }, [requestPointerLock]);

  const startDialogue = useCallback((id: string) => {
    const sequence = sequenceById(chapter, id);
    if (!sequence || dialogueRef.current?.id === id) return;
    dialogueRef.current = sequence;
    setActiveDialogue(sequence);
    keysRef.current.clear();
    document.exitPointerLock?.();
    commitCheckpoint((current) => ({
      ...current,
      dialogueProgress: current.dialogueProgress?.sequenceId === id ? current.dialogueProgress : undefined,
      pointerLockPending: true,
    }));
  }, [chapter, commitCheckpoint]);

  const deriveAndStoreLens = useCallback((source: CheckpointState) => {
    const lens = source.finalAssemblyState.endingLens ?? deriveEndingLens(source);
    return commitCheckpoint((current) => ({
      ...current,
      earnedFlags: unique([...current.earnedFlags, `finale.lens.${lens}`]),
      finalAssemblyState: { ...current.finalAssemblyState, endingLens: lens },
    }));
  }, [commitCheckpoint]);

  const finishChapter = useCallback((source: CheckpointState) => {
    if (phaseRef.current === "complete") return;
    const lens = source.finalAssemblyState.endingLens ?? deriveEndingLens(source);
    const finalCheckpoint: CheckpointState = {
      ...source,
      activeObjectiveId: undefined,
      objectiveStepId: undefined,
      dialogueProgress: undefined,
      earnedFlags: unique([...source.earnedFlags, `finale.lens.${lens}`]),
      finalAssemblyState: {
        ...source.finalAssemblyState,
        endingLens: lens,
        complete: true,
        factSkeletonFlags: [...FINAL_FACT_IDS],
      },
      updatedAt: new Date().toISOString(),
    };
    const nextSave = completeCampaignChapter(saveRef.current, chapter.id, finalCheckpoint, lens);
    checkpointRef.current = nextSave.activeCheckpoint;
    setCheckpoint(nextSave.activeCheckpoint);
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    document.exitPointerLock?.();
    setPhase("complete");
  }, [chapter.id, setPhase]);

  const completeDialogue = useCallback((sequence: DialogueSequence) => {
    dialogueRef.current = undefined;
    setActiveDialogue(undefined);
    const next = commitCheckpoint((current) => ({
      ...current,
      dialogueProgress: undefined,
      pointerLockPending: false,
      earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags,
    }));

    const routeIndex = ROUTE_SEQUENCE.indexOf(sequence.id as (typeof ROUTE_SEQUENCE)[number]);
    if (routeIndex >= 0) {
      if (sequence.id === "finale-water") startDialogue("finale-wife-goodbye");
      else requestPointerLock();
      return;
    }

    const goodbyeIndex = GOODBYE_SEQUENCE.indexOf(sequence.id as (typeof GOODBYE_SEQUENCE)[number]);
    if (goodbyeIndex >= 0) {
      const following = GOODBYE_SEQUENCE[goodbyeIndex + 1];
      if (following) startDialogue(following);
      else {
        deriveAndStoreLens(next);
        requestPointerLock();
      }
      return;
    }

    if (sequence.id === "finale-note") {
      const lens = next.finalAssemblyState.endingLens ?? deriveEndingLens(next);
      if (lens === "composite") {
        commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, "finale.ending-moment-complete"]) }));
        requestPointerLock();
      } else if (lens === "spatial") {
        requestPointerLock();
      }
      // domestic/documentary/pictorial immediately open their authored ending moment.
      return;
    }

    if (sequence.id === "finale-main-departure") {
      finishChapter(next);
      return;
    }

    requestPointerLock();
  }, [commitCheckpoint, deriveAndStoreLens, finishChapter, requestPointerLock, startDialogue]);

  const markEndingMomentComplete = useCallback(() => {
    commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, "finale.ending-moment-complete"]) }));
  }, [commitCheckpoint]);

  const closeEndingMoment = useCallback(() => {
    markEndingMomentComplete();
    requestPointerLock();
  }, [markEndingMomentComplete, requestPointerLock]);

  const handleSpatialMilestones = useCallback((pose: { x: number; z: number }) => {
    if (dialogueRef.current || phaseRef.current !== "playing") return;
    const current = checkpointRef.current;
    const flags = current.earnedFlags;

    if (!flags.includes("finale.route.gate")) return;
    if (!flags.includes("finale.route.side") && distance2D(pose, SIDE_ROUTE.position) <= 1.55) {
      startDialogue("finale-side-route");
      return;
    }
    if (flags.includes("finale.route.side") && !flags.includes("finale.route.room") && distance2D(pose, OLD_ROOM.position) <= 1.65) {
      startDialogue("finale-old-room");
      return;
    }
    if (flags.includes("finale.route.room") && !flags.includes("finale.route.water") && distance2D(pose, WATER.position) <= 1.8) {
      startDialogue("finale-water");
      return;
    }

    const allGoodbyes = GOODBYE_SEQUENCE.every((id) => {
      const sequence = sequenceById(chapter, id);
      return sequence?.completionFlag ? flags.includes(sequence.completionFlag) : false;
    });
    if (!allGoodbyes) return;

    const lens = current.finalAssemblyState.endingLens ?? deriveEndingLens(current);
    if (!flags.includes("finale.note-written") && distance2D(pose, OLD_ROOM.position) <= 1.65) {
      startDialogue("finale-note");
      return;
    }

    if (flags.includes("finale.note-written") && lens === "composite" && !flags.includes("finale.composite-sting-seen") && distance2D(pose, OLD_ROOM_WINDOW.position) <= 1.7) {
      const sting = runtimeRef.current?.compositeSting;
      // eslint-disable-next-line react-hooks/immutability -- Three.js scene-graph visibility is intentionally imperative.
      if (sting) sting.visible = true;
      // Silent by design: the sting only becomes visible, nothing else fires.
      commitCheckpoint((value) => ({ ...value, earnedFlags: unique([...value.earnedFlags, "finale.composite-sting-seen"]) }));
      return;
    }

    if (flags.includes("finale.note-written") && lens === "spatial" && !endingMomentComplete(current) && distance2D(pose, SIDE_ROUTE.position) <= 1.55) {
      markEndingMomentComplete();
      return;
    }

    if (flags.includes("finale.note-written") && endingMomentComplete(current) && distance2D(pose, GATE.position) <= 1.55) {
      startDialogue("finale-main-departure");
    }
  }, [chapter, commitCheckpoint, markEndingMomentComplete, startDialogue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let resizeCleanup: (() => void) | undefined;

    const boot = async () => {
      try {
        const renderer = await createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality });
        const restored = initialCheckpoint.position;
        const spawn = {
          x: restored?.[0] ?? GATE.position[0],
          y: Math.max(restored?.[1] ?? GATE.position[1], PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY),
          z: restored?.[2] ?? GATE.position[2],
        };
        const physics = await PhysicsController.create(spawn, tingYuXuanLayout.colliders);
        physics.setMemory("zhaoying");
        if (cancelled) { physics.dispose(); renderer.dispose(); return; }
        const world = await TingYuXuanScene.create(chapter.memories, save.settings.quality, renderer.renderer);
        registerArchitectureCollisionCoverage(world, physics, canvas);
        if (cancelled) { physics.dispose(); world.dispose(); renderer.dispose(); return; }
        world.setMemory("zhaoying");
        world.setRainEnabled(false);
        world.setGuidanceTarget(undefined);
        await world.ensureAreaAssets({ x: spawn.x, z: spawn.z });
        const compositeSting = await buildCompositeSpatialSting(world);
        compositeSting.visible = initialCheckpoint.earnedFlags.includes("finale.composite-sting-seen");
        const cameraRig = new CameraRig(world.camera, physics, { smoothTime: save.settings.stableCamera ? 0.11 : 0.16 });
        const playerAvatar = new PlayerAvatar();
        playerAvatar.root.visible = false;
        world.proceduralDressing.add(playerAvatar.root);
        yawRef.current = initialCheckpoint.yaw ?? GATE.yaw;
        cameraRig.syncExploration(new THREE.Vector3(spawn.x, spawn.y, spawn.z), yawRef.current, pitchRef.current, true);
        runtimeRef.current = { renderer, world, physics, cameraRig, playerAvatar, compositeSting };
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
          const inputReady = document.pointerLockElement === canvas || keyboardFallbackRef.current;
          let moving = false;
          if (phaseRef.current === "playing" && !dialogueRef.current && !caseFileOpenRef.current && !endingMomentOpenRef.current) {
            const keys = keysRef.current;
            const turn = inputReady ? Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft")) : 0;
            yawRef.current -= turn * 1.8 * delta;
            const forward = inputReady ? Number(keys.has("KeyW")) - Number(keys.has("KeyS")) : 0;
            const strafe = inputReady ? Number(keys.has("KeyD")) - Number(keys.has("KeyA")) : 0;
            const speed = keys.has("ShiftLeft") ? PLAYER_PHYSICS_CALIBRATION.fastWalkSpeed : PLAYER_PHYSICS_CALIBRATION.walkSpeed;
            const sin = Math.sin(yawRef.current);
            const cos = Math.cos(yawRef.current);
            const x = (forward * -sin + strafe * cos) * speed * delta;
            const z = (forward * -cos - strafe * sin) * speed * delta;
            moving = Math.hypot(x, z) > 0.0001;
            pose = physics.move({ x, y: 0, z }, delta);
            handleSpatialMilestones(pose);
          }

          playerAvatar.update(pose, yawRef.current, moving, delta);
          const player = new THREE.Vector3(pose.x, pose.y, pose.z);
          cameraRig.syncExploration(player, yawRef.current, pitchRef.current);
          cameraRig.update(delta);
          world.update(delta, player, false);
          world.setGuidanceTarget(undefined);

          if (now - lastAreaLoadRef.current >= 600) {
            lastAreaLoadRef.current = now;
            void world.ensureAreaAssets({ x: pose.x, z: pose.z }).catch(() => undefined);
          }

          canvas.dataset.playerPose = `${pose.x.toFixed(2)},${pose.y.toFixed(2)},${pose.z.toFixed(2)}`;
          canvas.dataset.grounded = String(physics.isGrounded());
          renderer.renderer.render(world.scene, world.camera);
        });

        if (phaseRef.current !== "complete") {
          setPhase("playing");
          const resumeId = initialCheckpoint.dialogueProgress?.sequenceId;
          if (resumeId) startDialogue(resumeId);
          else if (!initialCheckpoint.earnedFlags.includes("finale.route.gate")) startDialogue("finale-gate");
          else if (initialCheckpoint.earnedFlags.includes("finale.main-departure-complete")) finishChapter(initialCheckpoint);
        }
      } catch (reason) {
        console.error("[finale] scene failed to appear", reason);
        setError("雨停后的听雨轩没有完整显现。调查记录仍然保留，可以返回案卷后重新进入。");
        setPhase("error");
      }
    };

    void boot();
    return () => {
      cancelled = true;
      resizeCleanup?.();
      const runtime = runtimeRef.current;
      runtime?.renderer.renderer.setAnimationLoop(null);
      runtime?.cameraRig.dispose();
      runtime?.physics.dispose();
      runtime?.world.dispose();
      runtime?.renderer.dispose();
      runtimeRef.current = undefined;
    };
  }, [chapter, finishChapter, handleSpatialMilestones, initialCheckpoint, save.settings.quality, save.settings.renderer, save.settings.stableCamera, setPhase, startDialogue]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "Space", "KeyN"].includes(event.code)) event.preventDefault();
      if (event.repeat || phaseRef.current !== "playing" || endingMomentOpenRef.current) return;
      if (event.code === "KeyN") {
        setCaseFileOpen(!caseFileOpenRef.current);
        return;
      }
      if (dialogueRef.current || caseFileOpenRef.current) return;
      if (event.code === "Space") { runtimeRef.current?.physics.requestJump(); return; }
      keysRef.current.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvasRef.current || phaseRef.current !== "playing" || dialogueRef.current || caseFileOpenRef.current || endingMomentOpenRef.current) return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0019, -1.12, 1.04);
    };
    const onLockChange = () => setHasPointerLock(document.pointerLockElement === canvasRef.current);
    const onBlur = () => { keysRef.current.clear(); keyboardFallbackRef.current = false; setKeyboardFallback(false); };
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
  }, [setCaseFileOpen]);

  const lens = checkpoint.finalAssemblyState.endingLens ?? deriveEndingLens(checkpoint);
  const rule = campaignManifest.endingRules[lens];
  const allGoodbyes = GOODBYE_SEQUENCE.every((id) => {
    const sequence = sequenceById(chapter, id);
    return sequence?.completionFlag ? checkpoint.earnedFlags.includes(sequence.completionFlag) : false;
  });
  const noteWritten = checkpoint.earnedFlags.includes("finale.note-written");
  const showDomesticMoment = allGoodbyes && noteWritten && lens === "domestic" && !endingMomentComplete(checkpoint);
  const showDocumentaryMoment = allGoodbyes && noteWritten && lens === "documentary" && !endingMomentComplete(checkpoint);
  const showPictorialMoment = allGoodbyes && noteWritten && lens === "pictorial" && !endingMomentComplete(checkpoint);

  const endingMomentOverlay = showDomesticMoment
    ? <StoryCGViewer entry={storyCGById("child-room")} eyebrow="Ending A · 家还记得你" text="沈夫人把原本装箱的物件重新放回一部分。赵映离开后，房间里仍留下有人长期使用过的生活位置。" continueLabel="留下一部分" onContinue={closeEndingMoment} />
    : showPictorialMoment
      ? <StoryCGViewer entry={storyCGById("liusheng-fifth-figure")} eyebrow="Ending D · 画外之人" text="柳生重新挂出七年前原稿。普通角度里人影仍然很淡；观看位置改变时，第五个人重新进入画面。" continueLabel="保留原画" onContinue={closeEndingMoment} />
      : showDocumentaryMoment
        ? <DocumentViewer document={FINALE_DOCUMENTARY_ADDENDUM} closeLabel="保留原件与补充说明" onClose={closeEndingMoment} />
        : undefined;
  const endingMomentOpen = Boolean(endingMomentOverlay);
  useEffect(() => {
    endingMomentOpenRef.current = endingMomentOpen;
    if (endingMomentOpen) {
      keysRef.current.clear();
      document.exitPointerLock?.();
    }
  }, [endingMomentOpen]);

  return (
    <main className="runtime runtime-zhaoying finale-runtime" data-renderer={backend}>
      <canvas ref={canvasRef} className="runtime-canvas" tabIndex={0} aria-label="终章第五种听雨轩" onClick={() => phase === "playing" && !activeDialogue && !showCaseFile && requestPointerLock()} />
      <div className="vignette" aria-hidden="true" />
      <header className="runtime-topbar">
        <button type="button" className="text-button" onClick={onExit}>← 返回案卷</button>
        <div><span>终章</span><strong>第五种听雨轩</strong></div>

      </header>

      {phase === "playing" && !activeDialogue && !showCaseFile && !endingMomentOverlay && !hasPointerLock && !keyboardFallback && <button type="button" className="pointer-lock-callout" onClick={requestPointerLock}>继续最后一次走园子</button>}

      {endingMomentOverlay}
      {activeDialogue && <DialogueRunner key={activeDialogue.id} sequence={activeDialogue} storyContent={STORY_CONTENT} settings={save.settings} suspended={showCaseFile} restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={checkpoint.seenDialogueLines} onCommand={() => undefined} onProgress={(inkStateJson) => commitCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))} onSeen={(lineId) => commitCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))} onComplete={() => completeDialogue(activeDialogue)} />}
      {showCaseFile && <CaseFilePanel checkpoint={checkpoint} completedChapters={save.completedChapters} chapterTitle="终章 · 第五种听雨轩" onClose={() => setCaseFileOpen(false)} />}

      {phase === "loading" && <Modal eyebrow="终章" title="雨已经停了"><p>天还没有完全亮，听雨轩第一次没有雨声。</p></Modal>}
      {phase === "complete" && <Modal eyebrow={rule.title} title="《游园惊梦：四面证词》"><blockquote>我回来过。<br />我也会再离开。</blockquote><button type="button" className="primary-button" onClick={onExit}>返回案卷目录</button></Modal>}
      {phase === "error" && <Modal eyebrow="旧园中断" title="雨停后的听雨轩没有完整显现"><p>{error}</p><button type="button" className="primary-button" onClick={onExit}>返回案卷目录</button></Modal>}
    </main>
  );
}

function Modal({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop"><section className="runtime-modal"><span>{eyebrow}</span><h2>{title}</h2>{children}</section></div>;
}
