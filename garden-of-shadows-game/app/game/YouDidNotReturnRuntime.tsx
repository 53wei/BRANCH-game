"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { createCheckpoint } from "./campaign-save";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueSequence } from "./types";
import { CameraRig } from "./mechanics/CameraRig";
import { DialogueRunner } from "./narrative/DialogueRunner";
import { compileInkSource } from "./narrative/ink-runtime";
import youDidNotReturnInkSource from "./narrative/you-did-not-return.ink?raw";
import { registerArchitectureCollisionCoverage } from "./runtime/architecture-collision-runtime";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { PhysicsController, PLAYER_PHYSICS_CALIBRATION } from "./runtime/PhysicsController";
import { PLAYER_BODY_CALIBRATION } from "./runtime/player-calibration";
import { PlayerAvatar } from "./runtime/PlayerAvatar";
import { TingYuXuanScene } from "./runtime/TingYuXuanScene";
import { guidanceLevelForElapsed } from "./runtime/guidance-config";
import { getGameplayAnchor, resolveGameplayRegionForPoint } from "./runtime/tingyuxuan-gameplay-map";
import { tingYuXuanLayout } from "./runtime/tingyuxuan-layout";

interface YouDidNotReturnRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
  onContinue?: () => void;
}

type Phase = "loading" | "playing" | "complete" | "error";
type RouteStage = "reverse" | "return-room" | "cinematic";

const STORY_CONTENT = compileInkSource("you-did-not-return", youDidNotReturnInkSource);
const REVERSE_ROUTE_TARGET = getGameplayAnchor("ROUTE_01_START");
const RETURN_ROOM_TARGET = getGameplayAnchor("B_CHILD_BOX");
const ROUTE_REVERSE_FLAG = "you-did-not-return.route.reverse-complete";
const ROUTE_RETURN_ROOM_FLAG = "you-did-not-return.route.return-room-complete";
const SCENE_IDS = [
  "flashback-return-route",
  "flashback-return-room",
  "flashback-argument",
  "flashback-accident",
  "flashback-four-arrive",
  "flashback-cover-plan",
  "flashback-delayed-treatment",
  "flashback-present-return",
] as const;

const unique = <T,>(values: T[]) => [...new Set(values)];
const distance2D = (pose: { x: number; z: number }, target: readonly [number, number, number]) => Math.hypot(pose.x - target[0], pose.z - target[2]);

const routeStageFor = (checkpoint: CheckpointState): RouteStage => {
  if (!checkpoint.earnedFlags.includes(ROUTE_REVERSE_FLAG)) return "reverse";
  if (!checkpoint.earnedFlags.includes(ROUTE_RETURN_ROOM_FLAG)) return "return-room";
  return "cinematic";
};

const nextIncompleteDialogueId = (chapter: ChapterManifest, checkpoint: CheckpointState): string | undefined => {
  if (checkpoint.dialogueProgress?.sequenceId) return checkpoint.dialogueProgress.sequenceId;
  const flags = checkpoint.earnedFlags;
  if (flags.includes(ROUTE_REVERSE_FLAG) && !flags.includes("you-did-not-return.scene.5-1-complete")) return "flashback-return-route";
  if (!flags.includes(ROUTE_RETURN_ROOM_FLAG)) return undefined;
  for (const id of SCENE_IDS.slice(1)) {
    const sequence = chapter.dialogueSequences?.find((item) => item.id === id);
    if (sequence?.completionFlag && !flags.includes(sequence.completionFlag)) return id;
  }
  return undefined;
};

const objectiveFor = (checkpoint: CheckpointState) => {
  const stage = routeStageFor(checkpoint);
  if (stage === "reverse") {
    return {
      title: "沿第一章侧路反向走出去",
      detail: "不要把它当成真相录像。只重走已经由前四章证据确认过的那条路，直到七年前离园的方向重新成立。",
      hint: "从西院向正门外反走：东侧出口 → 循环段 → 前厅入口 → 正门外。",
      target: REVERSE_ROUTE_TARGET,
    };
  }
  if (stage === "return-room") {
    return {
      title: "按七年前的方向折返回自己的房间",
      detail: "车票没有被使用，旧房钥匙也没有被收走。沿刚才确认的路线重新进入园子。",
      hint: "从正门回到西院，再向主宅北侧那间已经重构过的旧房走。",
      target: RETURN_ROOM_TARGET,
    };
  }
  return undefined;
};

export function YouDidNotReturnRuntime({ chapter, save, onSave, onExit, onContinue }: YouDidNotReturnRuntimeProps) {
  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) return { ...save.activeCheckpoint, memoryId: "zhaoying" };
    const entry = getGameplayAnchor("ROUTE_04_A_EAST_EXIT");
    return {
      ...createCheckpoint(chapter.id, "zhaoying"),
      anchorId: "ROUTE_04_A_EAST_EXIT",
      position: [...entry.position],
      yaw: entry.yaw,
    };
  });
  const initialComplete = initialCheckpoint.earnedFlags.includes("you-did-not-return.complete");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{
    renderer: Awaited<ReturnType<typeof createRenderer>>;
    world: TingYuXuanScene;
    physics: PhysicsController;
    cameraRig: CameraRig;
    playerAvatar: PlayerAvatar;
  } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const yawRef = useRef(initialCheckpoint.yaw ?? getGameplayAnchor("ROUTE_04_A_EAST_EXIT").yaw);
  const pitchRef = useRef(0);
  const checkpointRef = useRef(initialCheckpoint);
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const phaseRef = useRef<Phase>(initialComplete ? "complete" : "loading");
  const dialogueRef = useRef<DialogueSequence | undefined>(undefined);
  const keyboardFallbackRef = useRef(false);
  const guidanceKeyRef = useRef("");
  const guidanceElapsedRef = useRef(0);
  const guidanceLevelRef = useRef(0);
  const lastAreaLoadRef = useRef(0);

  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const [phase, setPhaseState] = useState<Phase>(initialComplete ? "complete" : "loading");
  const [backend, setBackend] = useState<RendererBackend>();
  const [activeDialogue, setActiveDialogue] = useState<DialogueSequence>();
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [keyboardFallback, setKeyboardFallback] = useState(false);
  const [guidanceLevel, setGuidanceLevel] = useState(0);
  const [guideDistance, setGuideDistance] = useState<number>();
  const [area, setArea] = useState("AREA_A");
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
    if (!canvas || phaseRef.current !== "playing" || dialogueRef.current) return;
    canvas.focus();
    keyboardFallbackRef.current = true;
    setKeyboardFallback(true);
    const result = canvas.requestPointerLock?.();
    if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
  }, []);

  const startDialogue = useCallback((id: string) => {
    const sequence = chapter.dialogueSequences?.find((item) => item.id === id);
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
  }, [chapter.dialogueSequences, commitCheckpoint]);

  const finishChapter = useCallback((sourceCheckpoint: CheckpointState = checkpointRef.current) => {
    if (phaseRef.current === "complete") return;
    const finalCheckpoint: CheckpointState = {
      ...sourceCheckpoint,
      dialogueProgress: undefined,
      activeObjectiveId: undefined,
      objectiveStepId: undefined,
      earnedFlags: unique([...sourceCheckpoint.earnedFlags, ...chapter.completionFlags]),
      updatedAt: new Date().toISOString(),
    };
    checkpointRef.current = finalCheckpoint;
    setCheckpoint(finalCheckpoint);
    const nextSave: CampaignSave = {
      ...saveRef.current,
      activeCheckpoint: finalCheckpoint,
      completedChapters: unique([...saveRef.current.completedChapters, chapter.id]),
      unlockedChapters: unique([...saveRef.current.unlockedChapters, "fifth-tingyuxuan"]),
    };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    document.exitPointerLock?.();
    setPhase("complete");
  }, [chapter.completionFlags, chapter.id, setPhase]);

  const completeDialogue = useCallback((sequence: DialogueSequence) => {
    dialogueRef.current = undefined;
    setActiveDialogue(undefined);
    const nextCheckpoint = commitCheckpoint((current) => ({
      ...current,
      dialogueProgress: undefined,
      pointerLockPending: false,
      earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags,
    }));

    if (sequence.id === "flashback-return-route") {
      requestPointerLock();
      return;
    }
    if (sequence.id === "flashback-present-return") {
      finishChapter(nextCheckpoint);
      return;
    }
    const index = SCENE_IDS.indexOf(sequence.id as (typeof SCENE_IDS)[number]);
    const nextId = index >= 0 ? SCENE_IDS[index + 1] : undefined;
    if (nextId) startDialogue(nextId);
    else requestPointerLock();
  }, [commitCheckpoint, finishChapter, requestPointerLock, startDialogue]);

  const handleRouteMilestone = useCallback((pose: { x: number; z: number }) => {
    if (dialogueRef.current || phaseRef.current !== "playing") return;
    const flags = checkpointRef.current.earnedFlags;
    if (!flags.includes(ROUTE_REVERSE_FLAG) && distance2D(pose, REVERSE_ROUTE_TARGET.position) <= 1.45) {
      commitCheckpoint((current) => ({ ...current, anchorId: "ROUTE_01_START", earnedFlags: unique([...current.earnedFlags, ROUTE_REVERSE_FLAG]) }));
      startDialogue("flashback-return-route");
      return;
    }
    if (flags.includes("you-did-not-return.scene.5-1-complete")
      && !flags.includes(ROUTE_RETURN_ROOM_FLAG)
      && distance2D(pose, RETURN_ROOM_TARGET.position) <= 1.55) {
      commitCheckpoint((current) => ({ ...current, anchorId: "B_CHILD_BOX", earnedFlags: unique([...current.earnedFlags, ROUTE_RETURN_ROOM_FLAG]) }));
      startDialogue("flashback-return-room");
    }
  }, [commitCheckpoint, startDialogue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let resizeCleanup: (() => void) | undefined;

    const boot = async () => {
      try {
        const renderer = await createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality });
        const defaultAnchor = getGameplayAnchor("ROUTE_04_A_EAST_EXIT");
        const restored = initialCheckpoint.position;
        const spawn = {
          x: restored?.[0] ?? defaultAnchor.position[0],
          y: Math.max(restored?.[1] ?? defaultAnchor.position[1], PLAYER_BODY_CALIBRATION.capsuleGroundedCentreY),
          z: restored?.[2] ?? defaultAnchor.position[2],
        };
        const physics = await PhysicsController.create(spawn, tingYuXuanLayout.colliders);
        physics.setMemory("zhaoying");
        if (cancelled) { physics.dispose(); renderer.dispose(); return; }
        const world = await TingYuXuanScene.create(chapter.memories, save.settings.quality, renderer.renderer);
        registerArchitectureCollisionCoverage(world, physics, canvas);
        if (cancelled) { physics.dispose(); world.dispose(); renderer.dispose(); return; }
        world.setMemory("zhaoying");
        await world.ensureAreaAssets({ x: spawn.x, z: spawn.z });
        const cameraRig = new CameraRig(world.camera, physics, { smoothTime: save.settings.stableCamera ? 0.11 : 0.16 });
        const playerAvatar = new PlayerAvatar();
        playerAvatar.root.visible = false;
        world.proceduralDressing.add(playerAvatar.root);
        yawRef.current = initialCheckpoint.yaw ?? defaultAnchor.yaw;
        cameraRig.syncExploration(new THREE.Vector3(spawn.x, spawn.y, spawn.z), yawRef.current, pitchRef.current, true);
        runtimeRef.current = { renderer, world, physics, cameraRig, playerAvatar };
        setBackend(renderer.backend);
        setArea(resolveGameplayRegionForPoint({ x: spawn.x, z: spawn.z }));

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
          if (phaseRef.current === "playing" && !dialogueRef.current) {
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
            handleRouteMilestone(pose);
          }

          playerAvatar.update(pose, yawRef.current, moving, delta);
          const player = new THREE.Vector3(pose.x, pose.y, pose.z);
          cameraRig.syncExploration(player, yawRef.current, pitchRef.current);
          cameraRig.update(delta);
          world.update(delta, player, false);

          const currentObjective = objectiveFor(checkpointRef.current);
          if (currentObjective) {
            const target = currentObjective.target.position;
            const distance = distance2D(pose, target);
            setGuideDistance((value) => value !== undefined && Math.abs(value - distance) < 0.12 ? value : distance);
            const key = currentObjective.title;
            if (guidanceKeyRef.current !== key) {
              guidanceKeyRef.current = key;
              guidanceElapsedRef.current = 0;
              guidanceLevelRef.current = 0;
              setGuidanceLevel(0);
            } else if (!dialogueRef.current && saveRef.current.settings.guidanceAssist) {
              guidanceElapsedRef.current += delta;
              const nextLevel = guidanceLevelForElapsed(guidanceElapsedRef.current);
              if (nextLevel > guidanceLevelRef.current) {
                guidanceLevelRef.current = nextLevel;
                setGuidanceLevel(nextLevel);
              }
            }
            world.setGuidanceTarget(saveRef.current.settings.guidanceAssist && guidanceLevelRef.current >= 3
              ? new THREE.Vector3(target[0], 0, target[2])
              : undefined,
              "subtle");
          } else {
            setGuideDistance(undefined);
            world.setGuidanceTarget(undefined);
          }

          const currentArea = resolveGameplayRegionForPoint({ x: pose.x, z: pose.z });
          setArea((value) => value === currentArea ? value : currentArea);
          if (now - lastAreaLoadRef.current >= 600) {
            lastAreaLoadRef.current = now;
            void world.ensureAreaAssets({ x: pose.x, z: pose.z }).catch(() => undefined);
          }

          canvas.dataset.playerPose = `${pose.x.toFixed(2)},${pose.y.toFixed(2)},${pose.z.toFixed(2)}`;
          canvas.dataset.grounded = String(physics.isGrounded());
          canvas.dataset.flashbackRouteStage = routeStageFor(checkpointRef.current);
          renderer.renderer.render(world.scene, world.camera);
        });

        if (phaseRef.current !== "complete") {
          setPhase("playing");
          const resumeDialogue = nextIncompleteDialogueId(chapter, initialCheckpoint);
          if (resumeDialogue) startDialogue(resumeDialogue);
          else if (initialCheckpoint.earnedFlags.includes("you-did-not-return.scene.5-8-complete")) finishChapter(initialCheckpoint);
          // Fresh spatial stages intentionally wait for an explicit player click before pointer lock.
        }
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "无法初始化案发雨夜重构场景");
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
  }, [chapter, finishChapter, handleRouteMilestone, initialCheckpoint, save.settings.quality, save.settings.renderer, save.settings.stableCamera, setPhase, startDialogue]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
      if (event.repeat || phaseRef.current !== "playing" || dialogueRef.current) return;
      if (event.code === "Space") { runtimeRef.current?.physics.requestJump(); return; }
      keysRef.current.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvasRef.current || phaseRef.current !== "playing" || dialogueRef.current) return;
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
  }, []);

  const objective = objectiveFor(checkpoint);
  return (
    <main className="runtime runtime-zhaoying" data-renderer={backend}>
      <canvas ref={canvasRef} className="runtime-canvas" tabIndex={0} aria-label="第五章案发雨夜折返路线" onClick={() => phase === "playing" && !activeDialogue && requestPointerLock()} />
      <div className="vignette" aria-hidden="true" />
      <header className="runtime-topbar">
        <button type="button" className="text-button" onClick={onExit}>← 返回案卷</button>
        <div><span>第五章</span><strong>今晚你没回来</strong></div>
        <div className="runtime-status"><i className="status-dot" /> {area === "AREA_A" ? "折返侧路" : area === "AREA_B" ? "旧房与主宅" : "水榭"}</div>
      </header>

      {objective && !activeDialogue && <section className="objective-card" aria-live="polite"><span>当前记忆节点</span><strong>{objective.title}</strong><p>{objective.detail}</p>{guidanceLevel >= 1 && <small>提示：{objective.hint}</small>}{guideDistance !== undefined && guidanceLevel >= 1 && <small>约 {Math.max(1, Math.round(guideDistance))} m</small>}</section>}
      {phase === "playing" && !activeDialogue && !hasPointerLock && !keyboardFallback && <button type="button" className="pointer-lock-callout" onClick={requestPointerLock}>继续重走雨夜<br /><small>WASD 移动 · Shift 快走 · Space 小跳</small></button>}

      {activeDialogue && <DialogueRunner key={activeDialogue.id} sequence={activeDialogue} storyContent={STORY_CONTENT} settings={save.settings} restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={checkpoint.seenDialogueLines} onCommand={() => undefined} onProgress={(inkStateJson) => commitCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))} onSeen={(lineId) => commitCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))} onComplete={() => completeDialogue(activeDialogue)} />}

      {phase === "loading" && <Modal eyebrow="第五章" title="正在重建已经确认过的折返路线"><p>这不是无条件播放的“真相录像”。场景只使用前四章已经固定过的路线与事实。</p></Modal>}
      {phase === "complete" && <Modal eyebrow="第五章结束" title="今晚，你回来过"><p>赵映回来过，但没有推沈老爷。湿木阶事故、保护性的删除计划和连续延误共同组成了案发夜。</p><blockquote>没有隐藏凶手，也不需要再补一个新的罪名。下一步是把已经验证过的事实放进同一座听雨轩。</blockquote><button type="button" className="primary-button" onClick={onContinue ?? onExit}>进入终章：第五种听雨轩</button></Modal>}
      {phase === "error" && <Modal eyebrow="可恢复错误" title="案发雨夜场景未能启动"><p>{error}</p><button type="button" className="primary-button" onClick={onExit}>返回案卷目录</button></Modal>}
    </main>
  );
}

function Modal({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop"><section className="runtime-modal"><span>{eyebrow}</span><h2>{title}</h2>{children}</section></div>;
}
