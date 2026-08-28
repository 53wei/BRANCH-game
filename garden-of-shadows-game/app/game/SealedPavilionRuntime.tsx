"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { createCheckpoint } from "./campaign-save";
import { DialogueRunner } from "./narrative/DialogueRunner";
import pavilionStory from "./narrative/sealed-pavilion.json";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueCommand, DialogueSequence, MemoryId } from "./types";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { SealedPavilionScene, type PavilionInteractable, type PavilionInteractableId } from "./runtime/SealedPavilionScene";

type PavilionPhase = "loading" | "dialogue" | "playing" | "verdict" | "complete" | "error";

interface SealedPavilionRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
}

const unique = <T,>(values: T[]) => [...new Set(values)];
const memoryOrder: MemoryId[] = ["wife", "gardener", "accountant", "painter"];
const memoryName: Record<string, string> = { wife: "夫人证词", gardener: "园丁证词", accountant: "账房证词", painter: "柳生证词" };
const routeFlags: Record<MemoryId, string> = {
  wife: "pavilion.route.wife",
  gardener: "pavilion.route.gardener",
  accountant: "pavilion.route.accountant",
  painter: "pavilion.route.painter",
  baseline: "",
  zhaoying: "",
};
const bodyFlags: Record<MemoryId, string> = {
  wife: "pavilion.body.wife",
  gardener: "pavilion.body.gardener",
  accountant: "pavilion.body.accountant",
  painter: "pavilion.body.painter",
  baseline: "",
  zhaoying: "",
};

export const objectiveFor = (checkpoint: CheckpointState): { title: string; detail: string; targetId: PavilionInteractableId; memoryId: MemoryId } => {
  const flags = checkpoint.earnedFlags;
  if (!flags.includes("pavilion.door.confirmed")) return { title: "先证明密室成立", detail: "保持基准视角，检查水榭正门的锁舌与窗封。", targetId: "sealed-door", memoryId: checkpoint.memoryId };
  if (!flags.includes("pavilion.routes.ready")) {
    const nextMemory = memoryOrder.find((memory) => !flags.includes(routeFlags[memory])) ?? "wife";
    const targetId = `${nextMemory}-entry` as PavilionInteractableId;
    return { title: "核对至少两条入口", detail: `切到${memoryName[nextMemory]}，验证这条入口属于哪个时间。`, targetId, memoryId: nextMemory };
  }
  if (!flags.includes("pavilion.entered")) return { title: "穿过记忆裂隙", detail: "两条入口无法同时存在，它们之间的矛盾已经形成临时通道。", targetId: "memory-threshold", memoryId: checkpoint.memoryId };
  if (!flags.includes("pavilion.body.all")) {
    const nextMemory = memoryOrder.find((memory) => !flags.includes(bodyFlags[memory])) ?? "wife";
    return { title: "四份死亡现场", detail: `切到${memoryName[nextMemory]}，勘验水榭中央同一个位置。`, targetId: "body-scene", memoryId: nextMemory };
  }
  if (!flags.includes("pavilion.evidence.inner-bolt")) return { title: "确认内部落锁", detail: "切到夫人证词，检查后门内侧锁舌。", targetId: "inner-bolt", memoryId: "wife" };
  if (!flags.includes("pavilion.evidence.reverse-water")) return { title: "确认逆水来源", detail: "切到园丁证词，检查排水槽里的反向苔线。", targetId: "drain-channel", memoryId: "gardener" };
  if (!flags.includes("pavilion.evidence.vanished-exit")) return { title: "确认消失的出口", detail: "切到柳生证词，检查屏画边缘的湿颜料。", targetId: "paint-residue", memoryId: "painter" };
  return { title: "排列唯一因果链", detail: "走到水榭最深处，排列内锁、出口消失、逆水与溺亡。", targetId: "final-reconstruction", memoryId: checkpoint.memoryId };
};

export function SealedPavilionRuntime({ chapter, save, onSave, onExit }: SealedPavilionRuntimeProps) {
  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) return { ...save.activeCheckpoint, memoryId: memoryOrder.includes(save.activeCheckpoint.memoryId) ? save.activeCheckpoint.memoryId : "wife" };
    return { ...createCheckpoint(chapter.id, "wife"), anchorId: chapter.spawnAnchor, position: [0, 1.65, 7] };
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{ renderer: Awaited<ReturnType<typeof createRenderer>>; world: SealedPavilionScene } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const playerRef = useRef(new THREE.Vector3(...(initialCheckpoint.position ?? [0, 1.65, 7] as [number, number, number])));
  const yawRef = useRef(initialCheckpoint.yaw ?? 0);
  const pitchRef = useRef(0);
  const memoryRef = useRef<MemoryId>(initialCheckpoint.memoryId);
  const phaseRef = useRef<PavilionPhase>("loading");
  const nearestRef = useRef<PavilionInteractable | undefined>(undefined);
  const promptIdRef = useRef("");
  const checkpointRef = useRef(initialCheckpoint);
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const dialogueRef = useRef<DialogueSequence | undefined>(undefined);
  const startDialogueRef = useRef<(id: string) => void>(() => undefined);
  const lastGuideUpdateRef = useRef(0);
  const backlashTimerRef = useRef<number | undefined>(undefined);

  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const [phase, setPhaseState] = useState<PavilionPhase>(save.completedChapters.includes(chapter.id) ? "complete" : "loading");
  const [backend, setBackend] = useState<RendererBackend>();
  const [memory, setMemoryState] = useState<MemoryId>(initialCheckpoint.memoryId);
  const [prompt, setPrompt] = useState<string>();
  const [subtitle, setSubtitle] = useState("四条入口同时浮在水面上，但基准现实里的门窗仍然紧闭。");
  const [activeDialogue, setActiveDialogue] = useState<DialogueSequence>();
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [keyboardFallback, setKeyboardFallback] = useState(false);
  const [transitionMemory, setTransitionMemory] = useState<MemoryId>();
  const [backlashMessage, setBacklashMessage] = useState<string>();
  const [guideDistance, setGuideDistance] = useState<number>();
  const [guideAngle, setGuideAngle] = useState(0);
  const [error, setError] = useState("");

  const setPhase = useCallback((next: PavilionPhase) => { phaseRef.current = next; setPhaseState(next); }, []);
  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [onSave, save]);

  const persistCheckpoint = useCallback((producer: (current: CheckpointState) => CheckpointState) => {
    const position = playerRef.current;
    const next = producer({ ...checkpointRef.current, position: [position.x, position.y, position.z], yaw: yawRef.current, updatedAt: new Date().toISOString() });
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
    setKeyboardFallback(true);
    const result = canvas.requestPointerLock?.();
    if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
  }, []);

  const showBacklash = useCallback((message: string) => {
    window.clearTimeout(backlashTimerRef.current);
    setBacklashMessage(message);
    backlashTimerRef.current = window.setTimeout(() => setBacklashMessage(undefined), 1250);
  }, []);

  const changeMemory = useCallback((next: MemoryId, immediate = false) => {
    memoryRef.current = next;
    setMemoryState(next);
    runtimeRef.current?.world.setMemory(next);
    persistCheckpoint((current) => ({ ...current, memoryId: next }));
    if (!immediate) {
      setTransitionMemory(next);
      showBacklash(`${memoryName[next]}覆盖水榭：入口、室内与尸体状态正在重写。`);
      window.setTimeout(() => setTransitionMemory(undefined), 720);
    }
  }, [persistCheckpoint, showBacklash]);

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
    if (command.type === "flag:set") persistCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, command.flag]) }));
    else if (command.type === "memory:unlock") persistCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, `memory.${command.memoryId}.unlocked`]) }));
    else if (command.type === "objective:start") persistCheckpoint((current) => ({ ...current, activeObjectiveId: command.objectiveId, objectiveStepId: command.stepId }));
    else if (command.type === "objective:step") persistCheckpoint((current) => ({ ...current, objectiveStepId: command.stepId }));
  }, [persistCheckpoint]);

  const finishChapter = useCallback(() => {
    const finalCheckpoint = persistCheckpoint((current) => ({ ...current, activeObjectiveId: undefined, objectiveStepId: undefined, earnedFlags: unique([...current.earnedFlags, ...chapter.completionFlags]), dialogueProgress: undefined }));
    const nextSave: CampaignSave = {
      ...saveRef.current,
      activeCheckpoint: finalCheckpoint,
      completedChapters: unique([...saveRef.current.completedChapters, chapter.id]),
      unlockedChapters: unique([...saveRef.current.unlockedChapters, "mirror-self"]),
    };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    setPhase("complete");
  }, [chapter.completionFlags, chapter.id, persistCheckpoint, setPhase]);

  const completeDialogue = useCallback((sequence: DialogueSequence) => {
    dialogueRef.current = undefined;
    setActiveDialogue(undefined);
    let next = persistCheckpoint((current) => ({ ...current, dialogueProgress: undefined, earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags }));

    if (sequence.id.startsWith("pavilion-route-")) {
      const count = memoryOrder.filter((candidate) => next.earnedFlags.includes(routeFlags[candidate])).length;
      if (count >= 2 && !next.earnedFlags.includes("pavilion.routes.ready")) next = persistCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, "pavilion.routes.ready"]) }));
      setSubtitle(count >= 2 ? "两条入口属于不同时间。门缝之间出现了一道记忆裂隙。" : "已核对 1/2 条入口。切换另一份证词，验证第二条路线。 ");
      setPhase("playing");
      requestPointerLock();
      return;
    }

    if (sequence.id.startsWith("pavilion-body-")) {
      const observedMemory = sequence.id.slice("pavilion-body-".length) as MemoryId;
      next = persistCheckpoint((current) => {
        const observed = unique([...(current.observedBy["body-scene"] ?? []), observedMemory]);
        const confirmed = memoryOrder.every((candidate) => observed.includes(candidate));
        return {
          ...current,
          observedBy: { ...current.observedBy, "body-scene": observed },
          contradictions: confirmed ? unique([...current.contradictions, "body-state"]) : current.contradictions,
          earnedFlags: confirmed ? unique([...current.earnedFlags, "pavilion.body.all", "pavilion.contradiction.body-state"]) : current.earnedFlags,
        };
      });
      const count = next.observedBy["body-scene"]?.length ?? 0;
      runtimeRef.current?.world.setEvidenceFlags(next.earnedFlags);
      showBacklash(count >= 4 ? "四种死亡现场同时重叠，空间正在拒绝唯一姿态。" : `认知反噬 ${count}/4：水榭正在改写你刚才看见的尸体。`);
      setSubtitle(count >= 4 ? "四份死亡现场全部记录。现在检查能跨越证词保留下来的物理痕迹。" : `已记录 ${count}/4 份现场。按 Tab 切换到下一份证词。`);
      setPhase("playing");
      requestPointerLock();
      return;
    }

    if (sequence.id === "pavilion-opening") setSubtitle("先检查基准现实中的正门。不要让任何证词替你预设入口。");
    else if (sequence.id === "pavilion-sealed-door") {
      next = persistCheckpoint((current) => ({ ...current, contradictions: unique([...current.contradictions, "locked-inside"]), earnedFlags: unique([...current.earnedFlags, "pavilion.contradiction.locked-inside"]) }));
      setSubtitle("密室成立。按 Tab 切换证词，至少核对两条入口。 ");
    } else if (sequence.id === "pavilion-threshold") {
      playerRef.current.set(0, 1.65, -6.9);
      setSubtitle("你已进入水榭。四份证词把同一个中央位置改成四种死亡现场。 ");
    } else if (sequence.id === "pavilion-inner-bolt") {
      next = persistCheckpoint((current) => ({ ...current, contradictions: unique([...current.contradictions, "locked-inside"]) }));
      setSubtitle("第一步确定：水榭从内部落锁。下一步检查园丁证词中的排水槽。 ");
    } else if (sequence.id === "pavilion-drain") {
      next = persistCheckpoint((current) => ({ ...current, contradictions: unique([...current.contradictions, "reverse-water"]), earnedFlags: unique([...current.earnedFlags, "pavilion.contradiction.reverse-water"]) }));
      setSubtitle("逆水成立。现在切到柳生证词，寻找已经消失的出口。 ");
    } else if (sequence.id === "pavilion-paint-residue") {
      next = persistCheckpoint((current) => ({ ...current, contradictions: unique([...current.contradictions, "vanished-exit"]), earnedFlags: unique([...current.earnedFlags, "pavilion.contradiction.vanished-exit"]) }));
      setSubtitle("三段条件齐全。走到水榭尽头，排列唯一因果顺序。 ");
    } else if (sequence.id === "pavilion-causality") {
      setPhase("verdict");
      return;
    } else if (sequence.id === "pavilion-completion") {
      finishChapter();
      return;
    }
    runtimeRef.current?.world.setEvidenceFlags(next.earnedFlags);
    setPhase("playing");
    requestPointerLock();
  }, [finishChapter, persistCheckpoint, requestPointerLock, setPhase, showBacklash]);

  const interact = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const item = nearestRef.current;
    if (!item) return;
    const dialogueByItem: Partial<Record<PavilionInteractableId, string>> = {
      "sealed-door": "pavilion-sealed-door",
      "wife-entry": "pavilion-route-wife",
      "gardener-entry": "pavilion-route-gardener",
      "accountant-entry": "pavilion-route-accountant",
      "painter-entry": "pavilion-route-painter",
      "memory-threshold": "pavilion-threshold",
      "inner-bolt": "pavilion-inner-bolt",
      "drain-channel": "pavilion-drain",
      "paint-residue": "pavilion-paint-residue",
      "final-reconstruction": "pavilion-causality",
    };
    if (item.id === "body-scene") startDialogue(`pavilion-body-${memoryRef.current}`);
    else {
      const dialogueId = dialogueByItem[item.id];
      if (dialogueId) startDialogue(dialogueId);
    }
  }, [startDialogue]);

  const chooseVerdict = useCallback((choice: MemoryId) => {
    persistCheckpoint((current) => ({
      ...current,
      trustDecisions: { ...current.trustDecisions, "pavilion-final-trust": choice },
      earnedFlags: unique([...current.earnedFlags, `pavilion.truth.${choice}`, "pavilion.trust.decided"]),
    }));
    changeMemory(choice, true);
    window.setTimeout(() => startDialogueRef.current("pavilion-completion"), 100);
  }, [changeMemory, persistCheckpoint]);

  const locateObjective = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const objective = objectiveFor(checkpointRef.current);
    const target = runtime.world.interactables.find((item) => item.id === objective.targetId);
    if (!target) return;
    if (memoryRef.current !== objective.memoryId) changeMemory(objective.memoryId, true);
    playerRef.current.set(target.position.x, 1.65, target.position.z + 1.35);
    runtime.world.constrain(playerRef.current, checkpointRef.current.earnedFlags);
    const dx = target.position.x - playerRef.current.x;
    const dz = target.position.z - playerRef.current.z;
    yawRef.current = Math.atan2(-dx, -dz);
    nearestRef.current = target;
    promptIdRef.current = target.id;
    setPrompt(target.label);
    persistCheckpoint((current) => ({ ...current, memoryId: objective.memoryId }));
    setSubtitle(`测试定位完成：已切到${memoryName[objective.memoryId]}并抵达“${objective.title}”触发范围，按 F 或点击中央提示继续。`);
  }, [changeMemory, persistCheckpoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const world = new SealedPavilionScene(chapter.memories, save.settings.quality);
    world.setMemory(memoryRef.current);
    world.setEvidenceFlags(checkpointRef.current.earnedFlags);

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
        const tap = new THREE.Vector3(event.code === "KeyD" ? 1 : event.code === "KeyA" ? -1 : 0, 0, event.code === "KeyS" ? 1 : event.code === "KeyW" ? -1 : 0);
        if (tap.lengthSq() > 0) { tap.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current).multiplyScalar(.18); playerRef.current.add(tap); world.constrain(playerRef.current, checkpointRef.current.earnedFlags); }
        if (event.code === "ArrowLeft") yawRef.current += .08;
        if (event.code === "ArrowRight") yawRef.current -= .08;
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
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas || phaseRef.current !== "playing") return;
      yawRef.current -= event.movementX * .0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * .0019, -1.2, 1.2);
    };
    const onLockChange = () => setHasPointerLock(document.pointerLockElement === canvas);
    const onBlur = () => { keysRef.current.clear(); setKeyboardFallback(false); };
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("blur", onBlur);
    document.addEventListener("pointerlockchange", onLockChange);

    void createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality }).then((renderer) => {
      if (cancelled) { renderer.dispose(); return; }
      runtimeRef.current = { renderer, world };
      setBackend(renderer.backend);
      resize();
      let previous = performance.now();
      renderer.renderer.setAnimationLoop((now: number) => {
        const delta = Math.min((now - previous) / 1000, .05);
        previous = now;
        if (phaseRef.current === "playing") {
          const turn = Number(keysRef.current.has("ArrowRight")) - Number(keysRef.current.has("ArrowLeft"));
          yawRef.current -= turn * 1.8 * delta;
          const input = new THREE.Vector3((keysRef.current.has("KeyD") ? 1 : 0) - (keysRef.current.has("KeyA") ? 1 : 0), 0, (keysRef.current.has("KeyS") ? 1 : 0) - (keysRef.current.has("KeyW") ? 1 : 0));
          if (input.lengthSq() > 0) { input.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current).multiplyScalar(delta * (keysRef.current.has("ShiftLeft") ? 5.2 : 3.15)); playerRef.current.add(input); world.constrain(playerRef.current, checkpointRef.current.earnedFlags); }
        }
        world.setEvidenceFlags(checkpointRef.current.earnedFlags);
        world.update(delta);
        world.camera.position.copy(playerRef.current);
        world.camera.rotation.set(pitchRef.current, yawRef.current, world.cameraRoll());
        const available = world.availableInteractables(memoryRef.current, checkpointRef.current.earnedFlags);
        const nearest = available.map((item) => ({ item, distance: item.position.distanceTo(playerRef.current) })).filter(({ distance }) => distance < 3.1).sort((a, b) => a.distance - b.distance)[0]?.item;
        nearestRef.current = nearest;
        const nextPromptId = phaseRef.current === "playing" ? nearest?.id ?? "" : "";
        if (nextPromptId !== promptIdRef.current) { promptIdRef.current = nextPromptId; setPrompt(nearest?.label); }
        const objective = objectiveFor(checkpointRef.current);
        const target = world.interactables.find((item) => item.id === objective.targetId)?.position;
        world.setGuidanceTarget(target);
        if (target && now - lastGuideUpdateRef.current > 120) {
          lastGuideUpdateRef.current = now;
          const dx = target.x - playerRef.current.x;
          const dz = target.z - playerRef.current.z;
          setGuideDistance(Math.hypot(dx, dz));
          setGuideAngle(THREE.MathUtils.radToDeg(Math.atan2(dx, -dz) - yawRef.current));
        }
        renderer.renderer.render(world.scene, world.camera);
      });
      if (save.completedChapters.includes(chapter.id)) setPhase("complete");
      else if (checkpointRef.current.earnedFlags.includes("pavilion.dialogue.opening")) setPhase("playing");
      else startDialogueRef.current("pavilion-opening");
    }).catch((reason: unknown) => { setError(reason instanceof Error ? reason.message : "无法初始化水榭场景"); setPhase("error"); });

    return () => {
      cancelled = true;
      window.clearTimeout(backlashTimerRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerlockchange", onLockChange);
      world.dispose();
      runtimeRef.current?.renderer.dispose();
      runtimeRef.current = undefined;
    };
  }, [changeMemory, chapter.id, chapter.memories, interact, locateObjective, requestPointerLock, save.completedChapters, save.settings.quality, save.settings.renderer, setPhase]);

  const objective = objectiveFor(checkpoint);
  const routeCount = memoryOrder.filter((candidate) => checkpoint.earnedFlags.includes(routeFlags[candidate])).length;
  const bodyCount = memoryOrder.filter((candidate) => checkpoint.earnedFlags.includes(bodyFlags[candidate])).length;
  const testSteps = [
    { label: "确认正门与窗封确实从内部锁死", done: checkpoint.earnedFlags.includes("pavilion.door.confirmed") },
    { label: "核对第一条入口证词及其时间", done: routeCount >= 1 },
    { label: "核对第二条入口并打开记忆裂隙", done: checkpoint.earnedFlags.includes("pavilion.routes.ready") },
    { label: "穿过裂隙进入水榭内部", done: checkpoint.earnedFlags.includes("pavilion.entered") },
    { label: "四份证词分别勘验同一个死亡现场", done: checkpoint.earnedFlags.includes("pavilion.body.all") },
    { label: "确认水榭由内部落锁", done: checkpoint.earnedFlags.includes("pavilion.evidence.inner-bolt") },
    { label: "确认水由排水槽逆灌", done: checkpoint.earnedFlags.includes("pavilion.evidence.reverse-water") },
    { label: "确认临时画门曾存在又消失", done: checkpoint.earnedFlags.includes("pavilion.evidence.vanished-exit") },
    { label: "排列唯一因果链并完成最终信任选择", done: checkpoint.earnedFlags.includes("pavilion.chapter.complete") },
  ];
  const activeStep = testSteps.findIndex((step) => !step.done);
  const chosenTruth = checkpoint.trustDecisions["pavilion-final-trust"] as MemoryId | undefined;

  return (
    <main className={`runtime runtime-${memory} runtime-sealed-pavilion pavilion-backlash-${bodyCount}`}>
      <canvas ref={canvasRef} className="runtime-canvas" tabIndex={0} onClick={() => { if (phase === "playing") requestPointerLock(); }} aria-label="第四章水榭密室三维场景" />
      <div className="vignette" aria-hidden="true" />
      {transitionMemory && <div className="memory-shift" role="status"><i /><strong>{memoryName[transitionMemory]}</strong><small>水榭入口与死亡现场正在重写</small></div>}
      {backlashMessage && <div className="cognitive-backlash" role="status"><span>认知反噬</span><strong>{backlashMessage}</strong></div>}
      <div className="runtime-topbar">
        <button type="button" className="text-button" onClick={onExit}>← 返回案卷</button>
        <div><span>CHAPTER 04</span><strong>水榭密室</strong></div>
        <div className="runtime-status"><i className="status-dot" /> {backend?.toUpperCase() ?? "LOADING"} · {checkpoint.earnedFlags.includes("pavilion.entered") ? "水榭内部" : "东院水岸"}</div>
      </div>
      <section className="objective-card" aria-live="polite">
        <span>CURRENT OBJECTIVE</span><strong>{objective.title}</strong><p>{objective.detail}</p>
        <div className="chapter-test-route"><b>第四章测试路线 · {testSteps.filter((step) => step.done).length}/{testSteps.length}</b><ol>{testSteps.map((step, index) => <li key={step.label} className={step.done ? "done" : index === activeStep ? "active" : ""}><i>{step.done ? "✓" : index + 1}</i>{step.label}</li>)}</ol><button type="button" className="qa-locate-button" onClick={locateObjective}>H · 定位当前测试点</button></div>
      </section>
      <section className="case-progress"><span>SEALED PAVILION</span><strong>{bodyCount} / 4 份死亡现场</strong><small>入口证词 {Math.min(routeCount, 2)} / 2 · 因果证据 {checkpoint.contradictions.length} / {chapter.contradictions.length}</small></section>
      <section className="memory-card"><span>ACTIVE TESTIMONY</span><strong>{memoryName[memory]}</strong><small>{memory === "wife" ? "后门开启；园主仍坐在椅上。" : memory === "gardener" ? "屋顶漏雨；泥痕穿过倒地尸体。" : memory === "accountant" ? "密道止于地板；屋内连尸体也被否认。" : "破窗只是掩护；湿颜料保留消失的画门。"}</small></section>
      {guideDistance !== undefined && phase === "playing" && <div className="objective-direction"><i style={{ transform: `rotate(${guideAngle}deg)` }}>↑</i><span>{Math.max(1, Math.round(guideDistance))} m</span></div>}
      {prompt && phase === "playing" && <button type="button" className="interaction-prompt" onClick={interact}>{prompt} · 点击也可触发</button>}
      {subtitle && phase === "playing" && <div className="bark-subtitle"><p><b>勘验记录</b>{subtitle}</p></div>}
      <div className="runtime-controls">WASD 移动 · {keyboardFallback && !hasPointerLock ? "方向键转向" : "鼠标观察"} · F 勘验 · Tab 切换证词 · H 定位测试点 · Shift 加速</div>
      {phase === "playing" && !hasPointerLock && !keyboardFallback && <button type="button" className="pointer-lock-callout" onClick={requestPointerLock}>开始控制<br /><small>点击后使用 WASD；内置浏览器可用方向键转向</small></button>}
      {activeDialogue && <DialogueRunner key={activeDialogue.id} sequence={activeDialogue} storyContent={pavilionStory} settings={save.settings} restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={checkpoint.seenDialogueLines} onCommand={applyDialogueCommand} onProgress={(inkStateJson) => persistCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))} onSeen={(lineId) => persistCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))} onComplete={() => completeDialogue(activeDialogue)} />}
      {phase === "verdict" && (
        <div className="runtime-modal-backdrop"><section className="runtime-modal pavilion-verdict" role="dialog" aria-modal="true"><p className="eyebrow">FINAL TRUST · BEFORE THE MIRROR</p><h1>终章前，暂时采用谁的真相？</h1><p>这不会改变已经确认的死亡因果，只决定镜中第五份证词首先从哪一层记忆里醒来。</p><div className="choice-stack">{memoryOrder.map((id) => <button key={id} type="button" onClick={() => chooseVerdict(id)}><strong>{memoryName[id]}</strong><small>{id === "wife" ? "保留死亡前最后一次完整现场" : id === "gardener" ? "保留搬动尸体与改水的物理痕迹" : id === "accountant" ? "从被否认的空白中寻找缺席者" : "沿消失的画门寻找第五个人"}</small></button>)}</div></section></div>
      )}
      {phase === "complete" && !activeDialogue && <PavilionModal eyebrow="CHAPTER 04 COMPLETE" title="密室只剩一条因果链"><p>暂时采用：{chosenTruth ? memoryName[chosenTruth] : "未记录"}。</p><blockquote>内锁、画门消失、逆水与溺亡的顺序已经写入勘验簿。终章“镜中我”已解锁。</blockquote><button type="button" className="primary-button" onClick={onExit}>返回章节总览</button></PavilionModal>}
      {phase === "error" && <PavilionModal eyebrow="可恢复错误" title="水榭场景未能启动"><p>{error}</p><button type="button" className="primary-button" onClick={onExit}>返回章节总览</button></PavilionModal>}
    </main>
  );
}

function PavilionModal({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop"><section className="runtime-modal" role="dialog" aria-modal="true"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</section></div>;
}
