"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { createCheckpoint } from "./campaign-save";
import { DialogueRunner } from "./narrative/DialogueRunner";
import northStory from "./narrative/north-tower-ledger.json";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueCommand, DialogueSequence, MemoryId } from "./types";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { NorthTowerScene, type NorthTimeline, type NorthTowerInteractable, type NorthTowerZone } from "./runtime/NorthTowerScene";

type NorthPhase = "loading" | "dialogue" | "playing" | "complete" | "error";

interface NorthTowerRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
}

const unique = <T,>(values: T[]) => [...new Set(values)];
const memoryOrder: MemoryId[] = ["accountant", "wife", "gardener"];
const memoryName: Record<string, string> = { accountant: "账房证词", wife: "夫人证词", gardener: "园丁证词" };

const objectiveFor = (checkpoint: CheckpointState) => {
  const flags = checkpoint.earnedFlags;
  if (!flags.includes("north.reached.upper-floor")) return { title: "登上北楼", detail: "沿一层尽头找到楼梯，按 F 进入二层账房。", targetId: "north-stairs" };
  if (!flags.includes("north.window.inspected")) return { title: "找到借景窗", detail: "保持账房证词，在二层左侧检查发出蓝光的窗框。", targetId: "borrowed-window" };
  if (!flags.includes("north.borrowed-view.crossed")) return { title: "跨过时间切口", detail: "再次触碰借景窗，进入案发前的东院。", targetId: "borrowed-window" };
  if (!flags.includes("north.rockery.moved")) return { title: "移动过去的假山", detail: "在“过去”靠近完整假山，按 F 改变它的位置。", targetId: "past-rockery" };
  if (!flags.includes("north.present.route-open")) return { title: "回到现在验证结果", detail: "返回庭院入口的借景框，按 F 切回现在。", targetId: "borrowed-window-return" };
  if (!flags.includes("north.contradiction.scratches")) return { title: "核对窗框划痕", detail: "先用账房证词勘验，再按 Tab 切到夫人证词复查。", targetId: "window-scratches" };
  if (!flags.includes("north.contradiction.passage")) return { title: "核对秘密通道", detail: "先用账房证词勘验，再按 Tab 切到园丁证词复查。", targetId: "secret-passage" };
  return { title: "采用一份工作假设", detail: "两条矛盾已经成立，完成信任选择。", targetId: undefined };
};

export function NorthTowerRuntime({ chapter, save, onSave, onExit }: NorthTowerRuntimeProps) {
  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) {
      return { ...save.activeCheckpoint, memoryId: memoryOrder.includes(save.activeCheckpoint.memoryId) ? save.activeCheckpoint.memoryId : "accountant" };
    }
    return { ...createCheckpoint(chapter.id, "accountant"), anchorId: chapter.spawnAnchor };
  });
  const initialPosition: [number, number, number] = initialCheckpoint.position ?? [0, 1.65, 7];
  const initialZone: NorthTowerZone = initialPosition[0] < -5 ? "courtyard" : initialPosition[1] > 3 ? "upper" : "lower";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{ renderer: Awaited<ReturnType<typeof createRenderer>>; world: NorthTowerScene } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const playerRef = useRef(new THREE.Vector3(...initialPosition));
  const yawRef = useRef(initialCheckpoint.yaw ?? 0);
  const pitchRef = useRef(0);
  const nearestRef = useRef<NorthTowerInteractable | undefined>(undefined);
  const promptIdRef = useRef("");
  const memoryRef = useRef<MemoryId>(initialCheckpoint.memoryId);
  const timelineRef = useRef<NorthTimeline>("present");
  const zoneRef = useRef<NorthTowerZone>(initialZone);
  const phaseRef = useRef<NorthPhase>("loading");
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const dialogueRef = useRef<DialogueSequence | undefined>(undefined);
  const startDialogueRef = useRef<(id: string) => void>(() => undefined);

  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const checkpointRef = useRef(checkpoint);
  const [phase, setPhaseState] = useState<NorthPhase>(save.completedChapters.includes(chapter.id) ? "complete" : "loading");
  const [backend, setBackend] = useState<RendererBackend>();
  const [memory, setMemoryState] = useState<MemoryId>(initialCheckpoint.memoryId);
  const [timeline, setTimelineState] = useState<NorthTimeline>("present");
  const [zone, setZoneState] = useState<NorthTowerZone>(initialZone);
  const [prompt, setPrompt] = useState<string>();
  const [subtitle, setSubtitle] = useState("算盘珠自己落下，像有人在黑暗里核对你的脚步。");
  const [activeDialogue, setActiveDialogue] = useState<DialogueSequence>();
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [error, setError] = useState("");

  const setPhase = useCallback((next: NorthPhase) => { phaseRef.current = next; setPhaseState(next); }, []);
  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [onSave, save]);

  const requestPointerLock = useCallback(() => {
    const result = canvasRef.current?.requestPointerLock();
    if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
  }, []);

  const commitCheckpoint = useCallback((producer: (current: CheckpointState) => CheckpointState) => {
    const current = checkpointRef.current;
    const position = playerRef.current;
    const next = producer({ ...current, position: [position.x, position.y, position.z], yaw: yawRef.current, updatedAt: new Date().toISOString() });
    checkpointRef.current = next;
    setCheckpoint(next);
    const nextSave = { ...saveRef.current, activeCheckpoint: next };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    return next;
  }, []);

  const addFlags = useCallback((...flags: string[]) => commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, ...flags]) })), [commitCheckpoint]);

  const changeMemory = useCallback((next: MemoryId) => {
    memoryRef.current = next;
    setMemoryState(next);
    runtimeRef.current?.world.setMemory(next);
    commitCheckpoint((current) => ({ ...current, memoryId: next }));
    setSubtitle(`同一个位置，现在由${memoryName[next] ?? "另一份证词"}重新描述。`);
  }, [commitCheckpoint]);

  const changeTimeline = useCallback((next: NorthTimeline) => {
    timelineRef.current = next;
    setTimelineState(next);
    runtimeRef.current?.world.setTimeline(next, checkpointRef.current.earnedFlags.includes("north.rockery.moved"));
  }, []);

  const changeZone = useCallback((next: NorthTowerZone, position: [number, number, number]) => {
    zoneRef.current = next;
    setZoneState(next);
    playerRef.current.set(...position);
  }, []);

  const startDialogue = useCallback((id: string) => {
    const sequence = chapter.dialogueSequences?.find((item) => item.id === id);
    if (!sequence || dialogueRef.current?.id === id) return;
    dialogueRef.current = sequence;
    setActiveDialogue(sequence);
    keysRef.current.clear();
    document.exitPointerLock?.();
    setPhase("dialogue");
  }, [chapter.dialogueSequences, setPhase]);
  useEffect(() => { startDialogueRef.current = startDialogue; }, [startDialogue]);

  const applyDialogueCommand = useCallback((command: DialogueCommand) => {
    if (command.type === "flag:set") addFlags(command.flag);
    else if (command.type === "memory:unlock") addFlags(`memory.${command.memoryId}.unlocked`);
    else if (command.type === "objective:start") commitCheckpoint((current) => ({ ...current, activeObjectiveId: command.objectiveId, objectiveStepId: command.stepId }));
    else if (command.type === "objective:step") commitCheckpoint((current) => ({ ...current, objectiveStepId: command.stepId }));
    else if (command.type === "trust:set") commitCheckpoint((current) => ({
      ...current,
      trustDecisions: { ...current.trustDecisions, [command.nodeId]: command.choiceId },
      earnedFlags: unique([...current.earnedFlags, "north.trust.decided", command.outputFlag]),
    }));
  }, [addFlags, commitCheckpoint]);

  const finishChapter = useCallback(() => {
    const finalCheckpoint = commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, "north.chapter.complete", "campaign.witness.accountant"]), dialogueProgress: undefined }));
    const nextSave: CampaignSave = {
      ...saveRef.current,
      activeCheckpoint: finalCheckpoint,
      completedChapters: unique([...saveRef.current.completedChapters, chapter.id]),
      unlockedChapters: unique([...saveRef.current.unlockedChapters, "front-hall-guest"]),
    };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    setPhase("complete");
  }, [chapter.id, commitCheckpoint, setPhase]);

  const completeDialogue = useCallback((sequence: DialogueSequence) => {
    dialogueRef.current = undefined;
    setActiveDialogue(undefined);
    commitCheckpoint((current) => ({
      ...current,
      dialogueProgress: undefined,
      seenDialogueLines: current.seenDialogueLines,
      earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags,
    }));
    if (sequence.id === "north-passage") {
      window.setTimeout(() => startDialogueRef.current("north-trust"), 120);
      return;
    }
    if (sequence.id === "north-trust") {
      const chosen = checkpointRef.current.trustDecisions["north-route-owner"] as MemoryId | undefined;
      if (chosen && memoryOrder.includes(chosen)) changeMemory(chosen);
      window.setTimeout(() => startDialogueRef.current("north-completion"), 120);
      return;
    }
    if (sequence.id === "north-completion") {
      finishChapter();
      return;
    }
    setPhase("playing");
    requestPointerLock();
  }, [changeMemory, commitCheckpoint, finishChapter, requestPointerLock, setPhase]);

  const observeEvidence = useCallback((id: "window-scratches" | "secret-passage") => {
    const contradiction = chapter.contradictions.find((item) => item.id === id);
    if (!contradiction) return;
    const currentMemory = memoryRef.current;
    const next = commitCheckpoint((current) => {
      const observed = unique([...(current.observedBy[id] ?? []), currentMemory]);
      const confirmed = contradiction.requiredIndependentTestimonies.every((required) => observed.includes(required));
      return {
        ...current,
        observedBy: { ...current.observedBy, [id]: observed },
        contradictions: confirmed ? unique([...current.contradictions, id]) : current.contradictions,
        earnedFlags: confirmed ? unique([...current.earnedFlags, contradiction.outputFlag]) : current.earnedFlags,
      };
    });
    const observedCount = next.observedBy[id]?.length ?? 0;
    if (next.contradictions.includes(id)) {
      setSubtitle(id === "window-scratches" ? "两份证词都留下同一组翻越痕。第一条矛盾成立。" : "暗道与回环占据同一位置。第二条矛盾成立。 ");
      if (id === "window-scratches" && !next.earnedFlags.includes("north.dialogue.scratches")) startDialogue("north-scratches");
      if (id === "secret-passage" && !next.earnedFlags.includes("north.dialogue.passage")) startDialogue("north-passage");
    } else {
      const other = id === "window-scratches" ? "夫人" : "园丁";
      setSubtitle(`已记录 ${observedCount}/2。按 Tab 切到${other}证词，在同一位置复查。`);
    }
  }, [chapter.contradictions, commitCheckpoint, startDialogue]);

  const interact = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const item = nearestRef.current;
    if (!item) return;
    if (item.id === "north-stairs") {
      changeZone("upper", [0, 4.72, -6]);
      addFlags("north.reached.upper-floor");
      setSubtitle("二层像一张摊开的账页。左侧窗框里，东院仍停在案发以前。");
    } else if (item.id === "borrowed-window") {
      if (!checkpointRef.current.earnedFlags.includes("north.window.inspected")) {
        addFlags("north.window.inspected");
        setSubtitle("窗内假山完整，窗外雨水却已经积了七年。再触碰一次，跨过时间切口。");
      } else {
        changeTimeline("past");
        changeZone("courtyard", [-7, 1.65, -10]);
        addFlags("north.borrowed-view.crossed");
        setSubtitle("过去。假山还没有坍塌，石缝里的泥是干的。");
      }
    } else if (item.id === "past-rockery") {
      const next = addFlags("north.rockery.moved");
      runtimeRef.current?.world.setTimeline("past", true);
      setSubtitle("假山向侧面移开。这个动作已经发生在过去，现在会记住它。");
      if (!next.earnedFlags.includes("north.present.route-open")) setPrompt("回到借景框，按 F 切回现在");
    } else if (item.id === "borrowed-window-return") {
      changeTimeline("present");
      addFlags("north.present.route-open");
      runtimeRef.current?.world.setTimeline("present", true);
      setSubtitle("现在。坍塌的石块不再堵路，墙下露出一股向内吸气的暗风。");
    } else if (item.id === "window-scratches" || item.id === "secret-passage") {
      observeEvidence(item.id);
    }
  }, [addFlags, changeTimeline, changeZone, observeEvidence]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const world = new NorthTowerScene(chapter.memories, save.settings.quality);
    world.setMemory(memoryRef.current);
    world.setTimeline(timelineRef.current, checkpointRef.current.earnedFlags.includes("north.rockery.moved"));

    const resize = () => {
      const runtime = runtimeRef.current;
      if (!runtime) return;
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      world.camera.aspect = width / Math.max(1, height);
      world.camera.updateProjectionMatrix();
      runtime.renderer.resize(width, height, window.devicePixelRatio);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      keysRef.current.add(event.code);
      if (event.code === "KeyF") interact();
      if (event.code === "Tab" && phaseRef.current === "playing") {
        event.preventDefault();
        const index = memoryOrder.indexOf(memoryRef.current);
        changeMemory(memoryOrder[(index + 1) % memoryOrder.length]);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas || phaseRef.current !== "playing") return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0019, -1.25, 1.25);
    };
    const onLockChange = () => setHasPointerLock(document.pointerLockElement === canvas);

    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onLockChange);

    void createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality }).then((renderer) => {
      if (cancelled) { renderer.dispose(); return; }
      runtimeRef.current = { renderer, world };
      setBackend(renderer.backend);
      resize();
      let previous = performance.now();
      renderer.renderer.setAnimationLoop((now: number) => {
        const delta = Math.min((now - previous) / 1000, 0.05);
        previous = now;
        if (phaseRef.current === "playing") {
          const input = new THREE.Vector3(
            (keysRef.current.has("KeyD") ? 1 : 0) - (keysRef.current.has("KeyA") ? 1 : 0),
            0,
            (keysRef.current.has("KeyS") ? 1 : 0) - (keysRef.current.has("KeyW") ? 1 : 0),
          );
          if (input.lengthSq() > 0) {
            input.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current).multiplyScalar(delta * (keysRef.current.has("ShiftLeft") ? 5.4 : 3.25));
            playerRef.current.add(input);
            world.constrain(playerRef.current, zoneRef.current);
          }
        }
        world.camera.position.copy(playerRef.current);
        world.camera.rotation.set(pitchRef.current, yawRef.current, 0);
        world.update(delta);

        const available = world.availableInteractables(memoryRef.current, timelineRef.current, zoneRef.current, checkpointRef.current.earnedFlags.includes("north.rockery.moved"));
        const nearest = available
          .map((item) => ({ item, distance: item.position.distanceTo(playerRef.current) }))
          .filter(({ distance }) => distance < 2.25)
          .sort((a, b) => a.distance - b.distance)[0]?.item;
        nearestRef.current = nearest;
        const nextPromptId = phaseRef.current === "playing" ? nearest?.id ?? "" : "";
        if (nextPromptId !== promptIdRef.current) {
          promptIdRef.current = nextPromptId;
          setPrompt(nearest?.label);
        }

        const objective = objectiveFor(checkpointRef.current);
        const target = world.interactables.find((item) => item.id === objective.targetId);
        world.setGuidanceTarget(target?.position);
        renderer.renderer.render(world.scene, world.camera);
      });

      if (save.completedChapters.includes(chapter.id)) setPhase("complete");
      else if (checkpointRef.current.earnedFlags.includes("north.dialogue.opening")) setPhase("playing");
      else startDialogueRef.current("north-opening");
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "无法初始化北楼场景");
      setPhase("error");
    });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onLockChange);
      runtimeRef.current?.renderer.dispose();
      world.dispose();
      runtimeRef.current = undefined;
    };
  }, [changeMemory, chapter.id, chapter.memories, interact, save.completedChapters, save.settings.quality, save.settings.renderer, setPhase]);

  const objective = objectiveFor(checkpoint);
  const evidenceCount = checkpoint.contradictions.filter((id) => chapter.contradictions.some((item) => item.id === id)).length;

  return (
    <main className={`runtime runtime-${memory} runtime-north-${timeline}`}>
      <canvas ref={canvasRef} className="runtime-canvas" onClick={() => { if (phase === "playing") requestPointerLock(); }} aria-label="第二章北楼暗账三维场景" />
      <div className="vignette" aria-hidden="true" />
      <div className="runtime-topbar">
        <button type="button" className="text-button" onClick={onExit}>← 返回案卷</button>
        <div><span>CHAPTER 02</span><strong>北楼暗账</strong></div>
        <div className="runtime-status"><i className="status-dot" /> {backend?.toUpperCase() ?? "LOADING"} · {zone === "lower" ? "北楼一层" : zone === "upper" ? "北楼二层" : "东院假山"}</div>
      </div>

      <section className="objective-card" aria-live="polite">
        <span>CURRENT OBJECTIVE</span>
        <strong>{objective.title}</strong>
        <p>{objective.detail}</p>
      </section>

      <section className="case-progress">
        <span>TIME / EVIDENCE</span>
        <strong>{timeline === "past" ? "过去 · 假山完整" : "现在 · 雨后废墟"}</strong>
        <small>空间矛盾 {evidenceCount} / {chapter.contradictions.length}</small>
      </section>

      <section className="memory-card">
        <span>ACTIVE TESTIMONY</span>
        <strong>{memoryName[memory] ?? memory}</strong>
        <small>按 Tab 在账房、夫人、园丁证词间切换。借景窗只存在于账房证词。</small>
      </section>

      {prompt && phase === "playing" && <div className="interaction-prompt">{prompt}</div>}
      {subtitle && phase === "playing" && <div className="bark-subtitle"><p><b>勘验记录</b>{subtitle}</p></div>}
      <div className="runtime-controls">WASD 移动 · 鼠标观察 · F 勘验/穿越 · Tab 切换证词 · Shift 加速</div>

      {phase === "playing" && !hasPointerLock && <button type="button" className="pointer-lock-callout" onClick={requestPointerLock}>点击恢复第一人称视角</button>}

      {activeDialogue && (
        <DialogueRunner
          key={activeDialogue.id}
          sequence={activeDialogue}
          storyContent={northStory}
          settings={save.settings}
          restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined}
          seenLineIds={checkpoint.seenDialogueLines}
          onCommand={applyDialogueCommand}
          onProgress={(inkStateJson) => commitCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))}
          onSeen={(lineId) => commitCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))}
          onComplete={() => completeDialogue(activeDialogue)}
        />
      )}

      {phase === "complete" && !activeDialogue && (
        <NorthModal eyebrow="CHAPTER 02 COMPLETE" title="北楼的账暂时平了">
          <p>过去移动的假山已经改变现在；两条空间矛盾与一次信任选择已写入存档。</p>
          <button type="button" className="primary-button" onClick={onExit}>返回章节总览</button>
        </NorthModal>
      )}

      {phase === "error" && (
        <NorthModal eyebrow="可恢复错误" title="北楼场景未能启动">
          <p>{error}</p>
          <button type="button" className="primary-button" onClick={onExit}>返回章节总览</button>
        </NorthModal>
      )}
    </main>
  );
}

function NorthModal({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop"><section className="runtime-modal" role="dialog" aria-modal="true"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</section></div>;
}
