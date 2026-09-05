export const GUIDANCE_TIMING_SECONDS = {
  distance: 20,
  spokenHint: 45,
  worldMarker: 90,
} as const;

export const GUIDANCE_PROXIMITY_METERS = {
  quiet: 3.2,
  directionOnly: 8,
} as const;

export const CONTROL_GUIDE_GROUPS = [
  {
    id: "movement",
    title: "移动与观察",
    bindings: [
      { keys: "W / A / S / D", action: "移动" },
      { keys: "鼠标", action: "观察" },
      { keys: "Shift", action: "快走" },
      { keys: "Space", action: "小跳（仅地面）" },
    ],
  },
  {
    id: "investigation",
    title: "调查与认知",
    bindings: [
      { keys: "F", action: "调查 / 交互" },
      { keys: "Tab", action: "切换证词 / 认知" },
      { keys: "M", action: "地图" },
    ],
  },
  {
    id: "system",
    title: "剧情与菜单",
    bindings: [
      { keys: "H", action: "帮助" },
      { keys: "Esc", action: "暂停 / 设置 / 退出" },
      { keys: "Enter / 空格 / 左键", action: "推进对白" },
    ],
  },
] as const;

export const INVESTIGATION_PRINCIPLES = [
  "先记住空间，再调查痕迹。",
  "两个人的证词可以互相矛盾，但不代表其中一个人在撒谎。",
  "卡住时先看任务、地图和证词记录。",
] as const;

export const CORE_PLAY_RULE = "先记住空间，再比较证词。不要急着判断谁在撒谎。";

export const guidanceLevelForElapsed = (elapsedSeconds: number) => elapsedSeconds >= GUIDANCE_TIMING_SECONDS.worldMarker
  ? 3
  : elapsedSeconds >= GUIDANCE_TIMING_SECONDS.spokenHint
    ? 2
    : elapsedSeconds >= GUIDANCE_TIMING_SECONDS.distance
      ? 1
      : 0;

export const guidanceLevelForProximity = (level: number, targetDistance?: number) => {
  const clampedLevel = Math.max(0, Math.min(3, level));
  if (targetDistance === undefined || !Number.isFinite(targetDistance)) return clampedLevel;
  if (targetDistance <= GUIDANCE_PROXIMITY_METERS.quiet) return 0;
  if (targetDistance <= GUIDANCE_PROXIMITY_METERS.directionOnly) return Math.min(1, clampedLevel);
  return clampedLevel;
};
