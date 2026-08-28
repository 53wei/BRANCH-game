"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { createCheckpoint } from "./campaign-save";
import { DialogueRunner } from "./narrative/DialogueRunner";
import northStory from "./narrative/north-tower-ledger.json";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueCommand, DialogueSequence, MemoryId } from "./types";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { NorthTowerScene, type NorthTimeline, type NorthTowerInteractable, type NorthTowerZone } from "./runtime/NorthTowerScene";

type NorthPhase = "loading" | "dialogue" | "transition" | "playing" | "complete" | "error";
type NorthTransitionKind = "stairs" | "to-past" | "to-present";

interface NorthTransition {
  kind: NorthTransitionKind;
  startedAt: number;
  duration: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  fromYaw: number;
  toYaw: number;
  targetZone: NorthTowerZone;
  midpointDone: boolean;
  onMidpoint?: () => void;
  onComplete?: () => void;
}

interface NorthTowerRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
}

const unique = <T,>(values: T[]) => [...new Set(values)];
const memoryOrder: MemoryId[] = ["accountant", "wife", "gardener"];
const memoryName: Record<string, string> = { accountant: "账房证词", wife: "夫人证词", gardener: "园丁证词" };
const transitionCopy: Record<NorthTransitionKind, { eyebrow: string; title: string; detail: string }> = {
  stairs: { eyebrow: "北楼 · 一层至二层", title: "木梯记住了第二个人的脚步", detail: "每向上一阶，算盘声就少一颗。" },
  "to-past": { eyebrow: "借景 · 案发当夜", title: "跨过窗框，雨停在半空", detail: "空间没有把你送到别处，只把你送回它愿意承认的时间。" },
  "to-present": { eyebrow: "借景 · 七年以后", title: "过去已经发生，现在必须让路", detail: "雨声回来以前，假山的位置先变了。" },
};

export const objectiveFor = (checkpoint: CheckpointState) => {
  const flags = checkpoint.earnedFlags;
  if (!flags.includes("north.reached.upper-floor")) return { title: "登上北楼", detail: "沿一层尽头找到楼梯，按 F 进入二层账房。", targetId: "north-stairs", memoryId: "accountant" as const, timeline: "present" as const, zone: "lower" as const };
  if (!flags.includes("north.ledger.inspected")) return { title: "先查账，再查窗", detail: "走到账房深处，检查钱先生声称整夜没有离开的账桌。", targetId: "ledger-desk", memoryId: "accountant" as const, timeline: "present" as const, zone: "upper" as const };
  if (!flags.includes("north.window.inspected")) return { title: "找到借景窗", detail: "保持账房证词，在二层左侧检查发出蓝光的窗框。", targetId: "borrowed-window", memoryId: "accountant" as const, timeline: "present" as const, zone: "upper" as const };
  if (!flags.includes("north.borrowed-view.crossed")) return { title: "跨过时间切口", detail: "再次触碰借景窗，进入案发前的东院。", targetId: "borrowed-window", memoryId: "accountant" as const, timeline: "present" as const, zone: "upper" as const };
  if (!flags.includes("north.past.trail-inspected")) return { title: "追踪不该存在的珠痕", detail: "不要急着搬石头；先检查过去庭院泥地里的算盘珠痕。", targetId: "past-beads", memoryId: "accountant" as const, timeline: "past" as const, zone: "courtyard" as const };
  if (!flags.includes("north.rockery.moved")) return { title: "移动过去的假山", detail: "在“过去”靠近完整假山，按 F 改变它的位置。", targetId: "past-rockery", memoryId: "accountant" as const, timeline: "past" as const, zone: "courtyard" as const };
  if (!flags.includes("north.present.route-open")) return { title: "回到现在验证结果", detail: "返回庭院入口的借景框，按 F 切回现在。", targetId: "borrowed-window-return", memoryId: "accountant" as const, timeline: "past" as const, zone: "courtyard" as const };
  if (!flags.includes("north.contradiction.scratches")) {
    const memoryId = (checkpoint.observedBy["window-scratches"] ?? []).includes("accountant") ? "wife" as const : "accountant" as const;
    return { title: "核对窗框划痕", detail: "先用账房证词勘验，再按 Tab 切到夫人证词复查。", targetId: "window-scratches", memoryId, timeline: "present" as const, zone: "courtyard" as const };
  }
  if (!flags.includes("north.contradiction.passage")) {
    const memoryId = (checkpoint.observedBy["secret-passage"] ?? []).includes("accountant") ? "gardener" as const : "accountant" as const;
    return { title: "核对秘密通道", detail: "先用账房证词勘验，再按 Tab 切到园丁证词复查。", targetId: "secret-passage", memoryId, timeline: "present" as const, zone: "courtyard" as const };
  }
  return { title: "采用一份工作假设", detail: "回到已经打开的暗道口，按 F 完成信任选择。", targetId: "secret-passage", memoryId: "accountant" as const, timeline: "present" as const, zone: "courtyard" as const };
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
  const keyboardFallbackRef = useRef(false);
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
  const transitionRef = useRef<NorthTransition | undefined>(undefined);
  const lastGuideUpdateRef = useRef(0);

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
  const [transitionKind, setTransitionKind] = useState<NorthTransitionKind>();
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [keyboardFallback, setKeyboardFallback] = useState(false);
  const [guideDistance, setGuideDistance] = useState<number>();
  const [guideAngle, setGuideAngle] = useState(0);
  const [error, setError] = useState("");

  const setPhase = useCallback((next: NorthPhase) => { phaseRef.current = next; setPhaseState(next); }, []);
  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [onSave, save]);

  const requestPointerLock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.focus();
    keyboardFallbackRef.current = true;
    setKeyboardFallback(true);
    const result = canvas.requestPointerLock?.();
    if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
    window.setTimeout(() => {
      if (document.pointerLockElement !== canvas) setHasPointerLock(false);
    }, 120);
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

  const beginTransition = useCallback((options: {
    kind: NorthTransitionKind;
    duration: number;
    targetZone: NorthTowerZone;
    targetPosition: [number, number, number];
    targetYaw?: number;
    onMidpoint?: () => void;
    onComplete?: () => void;
  }) => {
    keysRef.current.clear();
    document.exitPointerLock?.();
    transitionRef.current = {
      kind: options.kind,
      startedAt: performance.now(),
      duration: options.duration,
      from: playerRef.current.clone(),
      to: new THREE.Vector3(...options.targetPosition),
      fromYaw: yawRef.current,
      toYaw: options.targetYaw ?? yawRef.current,
      targetZone: options.targetZone,
      midpointDone: false,
      onMidpoint: options.onMidpoint,
      onComplete: options.onComplete,
    };
    setTransitionKind(options.kind);
    promptIdRef.current = "";
    setPrompt(undefined);
    setPhase("transition");
  }, [setPhase]);

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
    if (sequence.id === "north-rockery") {
      addFlags("north.rockery.moved");
      runtimeRef.current?.world.setTimeline("past", true);
      setSubtitle("假山向侧面移开。这个动作已经发生在过去，现在会记住它。");
      setPhase("playing");
      requestPointerLock();
      return;
    }
    if (sequence.id === "north-passage") {
      setSubtitle("两条矛盾已经互相咬合。先看看暗道如何变化，再在暗道口按 F 采用一份工作假设。");
      setPhase("playing");
      requestPointerLock();
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
  }, [addFlags, changeMemory, commitCheckpoint, finishChapter, requestPointerLock, setPhase]);

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
      beginTransition({
        kind: "stairs",
        duration: 2600,
        targetZone: "upper",
        targetPosition: [0, 4.72, -6.2],
        targetYaw: 0,
        onComplete: () => {
          addFlags("north.reached.upper-floor");
          setSubtitle("脚步声停在二层。先去账桌核对最后一笔，再相信那扇窗。");
        },
      });
    } else if (item.id === "ledger-desk") {
      const askedLedger = checkpointRef.current.earnedFlags.includes("north.inquiry.ledger");
      addFlags("north.ledger.inspected");
      setSubtitle(askedLedger
        ? "你问过的子时三刻就在末页，墨色却比前几页新。钱先生在事后补过这本账。"
        : "窗框修缮款被整页撕走，只剩装订线上的蓝色纸屑。那扇窗不是无关紧要的景。"
      );
    } else if (item.id === "borrowed-window") {
      if (!checkpointRef.current.earnedFlags.includes("north.window.inspected")) {
        addFlags("north.window.inspected");
        setSubtitle("窗内假山完整，窗外雨水却已经积了七年。再触碰一次，跨过时间切口。");
        startDialogue("north-window");
      } else if (!checkpointRef.current.earnedFlags.includes("north.borrowed-view.crossed")) {
        beginTransition({
          kind: "to-past",
          duration: 2100,
          targetZone: "courtyard",
          targetPosition: [-7.5, 1.65, -11.6],
          targetYaw: -Math.PI / 2,
          onMidpoint: () => changeTimeline("past"),
          onComplete: () => {
            addFlags("north.borrowed-view.crossed");
            setSubtitle("雨声停了。先别碰假山——泥里有一串从北楼滚来的圆形浅痕。");
          },
        });
      }
    } else if (item.id === "past-beads") {
      addFlags("north.past.trail-inspected");
      setSubtitle("算盘珠痕绕过假山，最后消失在墙根。账房的物件比他的证词先到了东院。");
      startDialogue("north-past");
    } else if (item.id === "past-rockery") {
      if (!checkpointRef.current.earnedFlags.includes("north.dialogue.rockery")) startDialogue("north-rockery");
    } else if (item.id === "borrowed-window-return") {
      const position = playerRef.current;
      beginTransition({
        kind: "to-present",
        duration: 1900,
        targetZone: "courtyard",
        targetPosition: [position.x, 1.65, position.z],
        onMidpoint: () => changeTimeline("present"),
        onComplete: () => {
          addFlags("north.present.route-open");
          runtimeRef.current?.world.setTimeline("present", true);
          setSubtitle("雨重新落下。假山已经记住你的动作，墙下露出一股向内吸气的暗风。");
        },
      });
    } else if (item.id === "window-scratches" || item.id === "secret-passage") {
      if (item.id === "secret-passage"
        && checkpointRef.current.contradictions.includes("secret-passage")
        && checkpointRef.current.earnedFlags.includes("north.dialogue.passage")
        && !checkpointRef.current.earnedFlags.includes("north.dialogue.trust")) {
        startDialogue("north-trust");
      } else {
        observeEvidence(item.id);
      }
    }
  }, [addFlags, beginTransition, changeTimeline, observeEvidence, startDialogue]);

  const locateObjective = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const objective = objectiveFor(checkpointRef.current);
    const target = runtime.world.interactables.find((item) => item.id === objective.targetId);
    if (!target) return;
    memoryRef.current = objective.memoryId;
    setMemoryState(objective.memoryId);
    runtime.world.setMemory(objective.memoryId);
    timelineRef.current = objective.timeline;
    setTimelineState(objective.timeline);
    runtime.world.setTimeline(objective.timeline, checkpointRef.current.earnedFlags.includes("north.rockery.moved"));
    zoneRef.current = objective.zone;
    setZoneState(objective.zone);
    playerRef.current.set(target.position.x, target.position.y, target.position.z + 1.35);
    runtime.world.constrain(playerRef.current, objective.zone);
    const dx = target.position.x - playerRef.current.x;
    const dz = target.position.z - playerRef.current.z;
    yawRef.current = Math.atan2(-dx, -dz);
    nearestRef.current = target;
    promptIdRef.current = target.id;
    setPrompt(target.id === "secret-passage" && checkpointRef.current.contradictions.includes("secret-passage") ? "按 F 在暗道口作出判断" : target.label);
    commitCheckpoint((current) => ({ ...current, memoryId: objective.memoryId }));
    setSubtitle(`测试定位完成：已切到${memoryName[objective.memoryId]}并抵达“${objective.title}”触发范围，按 F 或点击中央提示继续。`);
  }, [commitCheckpoint]);

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
      if (phaseRef.current === "playing" && !event.repeat) {
        const tapInput = new THREE.Vector3(
          event.code === "KeyD" ? 1 : event.code === "KeyA" ? -1 : 0,
          0,
          event.code === "KeyS" ? 1 : event.code === "KeyW" ? -1 : 0,
        );
        if (tapInput.lengthSq() > 0) {
          tapInput.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current).multiplyScalar(0.18);
          playerRef.current.add(tapInput);
          world.constrain(playerRef.current, zoneRef.current);
        }
        if (event.code === "ArrowLeft") yawRef.current += 0.08;
        if (event.code === "ArrowRight") yawRef.current -= 0.08;
      }
      if (event.code === "KeyF") interact();
      if (event.code === "KeyH" && !event.repeat) locateObjective();
      if (event.code === "Tab" && phaseRef.current === "playing") {
        event.preventDefault();
        const index = memoryOrder.indexOf(memoryRef.current);
        changeMemory(memoryOrder[(index + 1) % memoryOrder.length]);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const onWindowBlur = () => {
      keysRef.current.clear();
      keyboardFallbackRef.current = false;
      setKeyboardFallback(false);
    };
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas || phaseRef.current !== "playing") return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0019, -1.25, 1.25);
    };
    const onLockChange = () => setHasPointerLock(document.pointerLockElement === canvas);

    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onWindowBlur);
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
        const activeTransition = transitionRef.current;
        if (phaseRef.current === "transition" && activeTransition) {
          const progress = THREE.MathUtils.clamp((now - activeTransition.startedAt) / activeTransition.duration, 0, 1);
          const eased = progress * progress * (3 - 2 * progress);
          playerRef.current.lerpVectors(activeTransition.from, activeTransition.to, eased);
          if (activeTransition.kind === "stairs") playerRef.current.y += Math.sin(progress * Math.PI * 9) * 0.025;
          yawRef.current = THREE.MathUtils.lerp(activeTransition.fromYaw, activeTransition.toYaw, eased);
          if (!activeTransition.midpointDone && progress >= 0.5) {
            activeTransition.midpointDone = true;
            activeTransition.onMidpoint?.();
          }
          if (progress >= 1) {
            const onComplete = activeTransition.onComplete;
            playerRef.current.copy(activeTransition.to);
            yawRef.current = activeTransition.toYaw;
            zoneRef.current = activeTransition.targetZone;
            setZoneState(activeTransition.targetZone);
            transitionRef.current = undefined;
            setTransitionKind(undefined);
            promptIdRef.current = "";
            setPrompt(undefined);
            onComplete?.();
            setPhase("playing");
            requestPointerLock();
          }
        }
        if (phaseRef.current === "playing") {
          const turn = Number(keysRef.current.has("ArrowRight")) - Number(keysRef.current.has("ArrowLeft"));
          yawRef.current -= turn * 1.8 * delta;
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

        const available = world.availableInteractables(
          memoryRef.current,
          timelineRef.current,
          zoneRef.current,
          checkpointRef.current.earnedFlags.includes("north.rockery.moved"),
          checkpointRef.current.earnedFlags,
        );
        const nearest = available
          .map((item) => ({ item, distance: item.position.distanceTo(playerRef.current) }))
          .filter(({ distance }) => distance < 3.1)
          .sort((a, b) => a.distance - b.distance)[0]?.item;
        nearestRef.current = nearest;
        const nextPromptId = phaseRef.current === "playing" ? nearest?.id ?? "" : "";
        if (nextPromptId !== promptIdRef.current) {
          promptIdRef.current = nextPromptId;
          const promptLabel = nearest?.id === "borrowed-window" && checkpointRef.current.earnedFlags.includes("north.window.inspected")
            ? "按 F 跨过借景框"
            : nearest?.id === "secret-passage"
              && checkpointRef.current.earnedFlags.includes("north.dialogue.passage")
              && !checkpointRef.current.earnedFlags.includes("north.dialogue.trust")
              ? "按 F 在暗道口作出判断"
              : nearest?.label;
          setPrompt(promptLabel);
        }

        const objective = objectiveFor(checkpointRef.current);
        const target = world.interactables.find((item) => item.id === objective.targetId);
        world.setGuidanceTarget(target?.position);
        if (target && now - lastGuideUpdateRef.current > 120) {
          lastGuideUpdateRef.current = now;
          const dx = target.position.x - playerRef.current.x;
          const dz = target.position.z - playerRef.current.z;
          setGuideDistance(Math.hypot(dx, dz));
          setGuideAngle(THREE.MathUtils.radToDeg(Math.atan2(dx, -dz) - yawRef.current));
        }
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
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onLockChange);
      transitionRef.current = undefined;
      world.dispose();
      runtimeRef.current?.renderer.dispose();
      runtimeRef.current = undefined;
    };
  }, [changeMemory, chapter.id, chapter.memories, interact, locateObjective, requestPointerLock, save.completedChapters, save.settings.quality, save.settings.renderer, setPhase]);

  const objective = objectiveFor(checkpoint);
  const evidenceCount = checkpoint.contradictions.filter((id) => chapter.contradictions.some((item) => item.id === id)).length;
  const testSteps = [
    { label: "沿灯笼走到楼梯并按 F 上楼", done: checkpoint.earnedFlags.includes("north.reached.upper-floor") },
    { label: "检查二层账桌留下的补写痕迹", done: checkpoint.earnedFlags.includes("north.ledger.inspected") },
    { label: "在账房证词中检查蓝色借景窗", done: checkpoint.earnedFlags.includes("north.window.inspected") },
    { label: "穿过借景框，进入案发前的东院", done: checkpoint.earnedFlags.includes("north.borrowed-view.crossed") },
    { label: "沿泥地追踪算盘珠留下的浅痕", done: checkpoint.earnedFlags.includes("north.past.trail-inspected") },
    { label: "移动完整假山，再从窗框回到现在", done: checkpoint.earnedFlags.includes("north.present.route-open") },
    { label: "账房＋夫人核对窗框划痕", done: checkpoint.contradictions.includes("window-scratches") },
    { label: "账房＋园丁核对假山暗道", done: checkpoint.contradictions.includes("secret-passage") },
    { label: "回到暗道口作出信任选择", done: checkpoint.earnedFlags.includes("north.chapter.complete") },
  ];
  const completedTestSteps = testSteps.filter((step) => step.done).length;
  const activeTestStep = testSteps.findIndex((step) => !step.done);
  const investigationTraces = [
    checkpoint.earnedFlags.includes("north.inquiry.ledger") ? "末页补写" : checkpoint.earnedFlags.includes("north.inquiry.window") ? "窗景异时" : undefined,
    checkpoint.earnedFlags.includes("north.window.focus.scratches") ? "窗框硬痕" : checkpoint.earnedFlags.includes("north.window.focus.time") ? "冻结雨滴" : undefined,
    checkpoint.earnedFlags.includes("north.past.clue.beads") ? "算盘珠痕" : checkpoint.earnedFlags.includes("north.past.clue.rain") ? "时间残影" : undefined,
    checkpoint.earnedFlags.includes("north.rockery.choice.ledger") ? "缺失石料款" : checkpoint.earnedFlags.includes("north.rockery.choice.direct") ? "记忆改路" : undefined,
  ].filter((trace): trace is string => Boolean(trace));
  const trustChoice = checkpoint.trustDecisions["north-route-owner"];
  const completionOutcome = trustChoice === "gardener"
    ? "你让暗道重新坍塌，带血的园艺剪从石缝中滑出。它证明园丁隐瞒了东西，却仍不能替账房洗清路线。"
    : trustChoice === "wife"
      ? "你保留了夫人在二层的影子，账页间的私信把情感动机带进案件，但暗道仍证明钱先生说了谎。"
      : "你保留了账房版本的暗道，一本总数被改过的私账留在出口。钱先生隐瞒的不只是路线，还有一笔让人消失的支出。";

  return (
    <main className={`runtime runtime-${memory} runtime-north-${timeline}`}>
      <canvas ref={canvasRef} className="runtime-canvas" tabIndex={0} onClick={() => { if (phase === "playing") requestPointerLock(); }} onBlur={() => { if (!hasPointerLock) { keyboardFallbackRef.current = false; setKeyboardFallback(false); } }} aria-label="第二章北楼暗账三维场景" />
      <div className="vignette" aria-hidden="true" />
      {transitionKind && (
        <div className={`north-transition north-transition-${transitionKind}`} role="status" aria-live="polite">
          <i aria-hidden="true" />
          <div>
            <span>{transitionCopy[transitionKind].eyebrow}</span>
            <strong>{transitionCopy[transitionKind].title}</strong>
            <p>{transitionCopy[transitionKind].detail}</p>
          </div>
        </div>
      )}
      <div className="runtime-topbar">
        <button type="button" className="text-button" onClick={onExit}>← 返回案卷</button>
        <div><span>CHAPTER 02</span><strong>北楼暗账</strong></div>
        <div className="runtime-status"><i className="status-dot" /> {backend?.toUpperCase() ?? "LOADING"} · {zone === "lower" ? "北楼一层" : zone === "upper" ? "北楼二层" : "东院假山"}</div>
      </div>

      <section className="objective-card" aria-live="polite">
        <span>CURRENT OBJECTIVE</span>
        <strong>{objective.title}</strong>
        <p>{objective.detail}</p>
        <div className="chapter-test-route">
          <b>第二章测试路线 · {completedTestSteps}/{testSteps.length}</b>
          <ol>
            {testSteps.map((step, index) => <li key={step.label} className={step.done ? "done" : index === activeTestStep ? "active" : ""}><i>{step.done ? "✓" : index + 1}</i>{step.label}</li>)}
          </ol>
          <button type="button" className="qa-locate-button" onClick={locateObjective}>H · 定位当前测试点</button>
        </div>
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
        {investigationTraces.length > 0 && <div className="investigation-traces">{investigationTraces.map((trace) => <i key={trace}>{trace}</i>)}</div>}
      </section>

      {guideDistance !== undefined && phase === "playing" && <div className="objective-direction"><i style={{ transform: `rotate(${guideAngle}deg)` }}>↑</i><span>{Math.max(1, Math.round(guideDistance))} m</span></div>}
      {prompt && phase === "playing" && <button type="button" className="interaction-prompt" onClick={interact}>{prompt} · 点击也可触发</button>}
      {subtitle && phase === "playing" && <div className="bark-subtitle"><p><b>勘验记录</b>{subtitle}</p></div>}
      <div className="runtime-controls">WASD 移动 · {keyboardFallback && !hasPointerLock ? "方向键转向" : "鼠标观察"} · F 勘验/穿越 · Tab 切换证词 · H 定位测试点 · Shift 加速</div>

      {phase === "playing" && !hasPointerLock && !keyboardFallback && <button type="button" className="pointer-lock-callout" onClick={requestPointerLock}>开始控制<br /><small>点击后使用 WASD；内置浏览器可用方向键转向</small></button>}

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
          <p>{completionOutcome}</p>
          <blockquote>过去移动的假山已经改变现在；两条空间矛盾与你采用的解释均已写入存档。</blockquote>
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
