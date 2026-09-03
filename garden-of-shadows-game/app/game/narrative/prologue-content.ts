import type { NarrativeNodeKind, NarrativeStoryLine } from "./content-schema";

export type PrologueStoryKind = Extract<NarrativeNodeKind, "spoken" | "inner" | "narration" | "action">;
export type PrologueStoryLine = NarrativeStoryLine<"赵映" | "老周"> & { kind: PrologueStoryKind };

/**
 * Source of truth: 工作区根目录《游园惊梦_完整剧情母剧本_V5.0.md》
 * 场景 0-1 ～ 0-6。
 *
 * Runtime 只负责表现，不在这里补“神秘感”台词或改写案件事实。
 */
export const PROLOGUE_GATE_LINES: readonly PrologueStoryLine[] = [
  { id: "gate-env", kind: "narration", text: "雨下得不算暴，但连续几天没有停。听雨轩外墙被水浸得发暗，门楣上的旧漆起了一层薄皮。门里有一盏灯，隔着门缝时亮时暗。" },
  { id: "gate-message", kind: "action", text: "赵映撑伞站在门前，没有马上敲门。她先抬头看了眼门匾，又低头看手机里沈夫人下午发来的那句话——“东西都收好了，你回来拿吧。园子过阵子也要封。”" },
  { id: "gate-inner-seven-years", kind: "inner", speaker: "赵映", text: "七年。她连一句“你还好吗”都没写。倒也像她。" },
  { id: "gate-door-sound", kind: "narration", text: "门内传来金属碰撞声，随后是门闩被慢慢抽开的声音。" },
  { id: "gate-steward-arrives", kind: "action", text: "门开了一条缝。老周提着灯，先看赵映的脸，再看她身后的行李。" },
  { id: "gate-steward-01", kind: "spoken", speaker: "老周", text: "你还真挑今天回来。白天雨小得多，偏偏晚上这一阵最密，路上没耽搁吧？" },
  { id: "gate-zhaoying-01", kind: "spoken", speaker: "赵映", text: "车晚了四十分钟。你要是嫌我来得不是时候，我现在掉头也来得及。" },
  { id: "gate-steward-02", kind: "spoken", speaker: "老周", text: "七年没见，第一句话还是这么不饶人。进来吧，鞋底先在门槛上蹭两下，里面刚拖过，别一脚把泥带进去。" },
  { id: "gate-action-shoes", kind: "action", text: "赵映低头照做。动作做完，她自己愣了一下。" },
  { id: "gate-inner-habit", kind: "inner", speaker: "赵映", text: "我怎么还记得他会说这一句。" },
  { id: "gate-zhaoying-02", kind: "spoken", speaker: "赵映", text: "沈姨呢？" },
  { id: "gate-steward-03", kind: "spoken", speaker: "老周", text: "等了你一下午，晚饭没怎么吃。十点多撑不住，回房躺下了。她说你要是到了，别先去叫她，让你吃点东西再说。" },
  { id: "gate-zhaoying-03", kind: "spoken", speaker: "赵映", text: "她以前也这样。什么都不问，先问人吃没吃。" },
  { id: "gate-steward-04", kind: "spoken", speaker: "老周", text: "人老了，能问的事情就剩这些。走吧，你以前那间……" },
  { id: "gate-action-pause", kind: "action", text: "老周说到一半停住，低头把灯芯拨亮了一点。" },
  { id: "gate-zhaoying-04", kind: "spoken", speaker: "赵映", text: "我以前那间怎么了？" },
  { id: "gate-steward-05", kind: "spoken", speaker: "老周", text: "没什么。先去前厅，夫人把你的箱子放那边了。" },
  { id: "gate-inner-correction", kind: "inner", speaker: "赵映", text: "他刚才不是忘词。他是在改口。" },
] as const;

export const PROLOGUE_FRONT_HALL_LINES: readonly PrologueStoryLine[] = [
  { id: "front-hall-env", kind: "narration", text: "前厅比赵映记忆里空。墙上挂着沈家的合影，画框是旧的，画布明显补过。桌上有保温壶、两只杯子、一碟已经凉掉的桂花糕。" },
  { id: "front-hall-steward-01", kind: "spoken", speaker: "老周", text: "先喝一口。夫人下午换了三次热水，最后还是凉了。" },
  { id: "front-hall-zhaoying-01", kind: "spoken", speaker: "赵映", text: "我以前不爱喝这个。" },
  { id: "front-hall-steward-02", kind: "spoken", speaker: "老周", text: "你以前什么都说不爱，最后吃得比谁都快。" },
  { id: "front-hall-cake", kind: "action", text: "赵映拿起一块桂花糕，只咬了一口。她看见墙上的合影。" },
  { id: "front-hall-inner-people", kind: "inner", speaker: "赵映", text: "沈伯、沈姨、钱先生……老周站得最边上。柳生也在。" },
  { id: "front-hall-inner-wrong", kind: "inner", speaker: "赵映", text: "不对。" },
  { id: "front-hall-step-closer", kind: "action", text: "她往前走两步。画面里沈夫人右侧有一块构图不自然的空处，衣袖与背景花木的颜色有轻微重叠。" },
  { id: "front-hall-zhaoying-02", kind: "spoken", speaker: "赵映", text: "这画什么时候补过？" },
  { id: "front-hall-steward-03", kind: "spoken", speaker: "老周", text: "记不清了。以前受过潮，柳先生来补过几次。" },
  { id: "front-hall-zhaoying-03", kind: "spoken", speaker: "赵映", text: "我是问，人动过没有。" },
  { id: "front-hall-steward-04", kind: "spoken", speaker: "老周", text: "……你刚回来，非得今晚就问这些？" },
  { id: "front-hall-zhaoying-04", kind: "spoken", speaker: "赵映", text: "我七年没回来，不就是为了今晚能问吗？" },
  { id: "front-hall-thermos", kind: "action", text: "老周没有接话，只把保温壶盖紧。" },
] as const;

export const PROLOGUE_DEPARTURE_RECORD_LINES: readonly PrologueStoryLine[] = [
  { id: "departure-box", kind: "action", text: "赵映打开沈夫人准备的旧箱子，最上面是一串钥匙、一只旧怀表和一沓用牛皮纸包起来的票据。" },
  { id: "departure-zhaoying-01", kind: "spoken", speaker: "赵映", text: "这些为什么还留着？" },
  { id: "departure-steward-01", kind: "spoken", speaker: "老周", text: "夫人留的。她这个人，嘴上说没用的东西就扔，真到收拾的时候一张车票都舍不得。" },
  { id: "departure-record", kind: "action", text: "赵映翻到一张七年前的离家登记。上面写着她在傍晚六点十分离开听雨轩。" },
  { id: "departure-zhaoying-02", kind: "spoken", speaker: "赵映", text: "六点十分。" },
  { id: "departure-steward-02", kind: "spoken", speaker: "老周", text: "怎么了？" },
  { id: "departure-zhaoying-03", kind: "spoken", speaker: "赵映", text: "没怎么。我一直记得差不多就是这个时间。" },
  { id: "departure-inner", kind: "inner", speaker: "赵映", text: "这张纸没有问题。我的记忆也没有问题。" },
  { id: "departure-indent", kind: "action", text: "她继续翻，在纸角看到非常浅的压痕，像原本在同一位置写过另一组数字又被处理掉。" },
  { id: "departure-zhaoying-04", kind: "spoken", speaker: "赵映", text: "钱先生还在？" },
  { id: "departure-steward-03", kind: "spoken", speaker: "老周", text: "在。他现在腿不好，住北楼那边。你明天再找他，晚上别折腾老人家。" },
  { id: "departure-zhaoying-05", kind: "spoken", speaker: "赵映", text: "你比他也年轻不了几岁。" },
  { id: "departure-steward-04", kind: "spoken", speaker: "老周", text: "所以我现在就已经嫌你折腾了。" },
  { id: "departure-smile", kind: "action", text: "两个人第一次都笑了一下，但笑意很快停住。" },
] as const;

export const PROLOGUE_BASELINE_LINES: readonly PrologueStoryLine[] = [
  { id: "baseline-env", kind: "narration", text: "从前厅去西院要经过一段窄回廊。雨声被屋檐削得很薄，只有檐角不断滴水。墙上排列着六扇漏窗。" },
  { id: "baseline-steward-01", kind: "spoken", speaker: "老周", text: "还认得这里吗？" },
  { id: "baseline-zhaoying-01", kind: "spoken", speaker: "赵映", text: "窗比以前少。" },
  { id: "baseline-steward-02", kind: "spoken", speaker: "老周", text: "你小时候每次都说少。自己数。" },
  { id: "baseline-count-action", kind: "action", text: "赵映一路数过去。" },
  { id: "baseline-zhaoying-02", kind: "spoken", speaker: "赵映", text: "一、二、三、四、五、六。真是六扇。" },
  { id: "baseline-steward-03", kind: "spoken", speaker: "老周", text: "你十岁的时候非说有七扇，为这个跟我吵了一下午。后来晚上做噩梦，说第七扇里有人看你。" },
  { id: "baseline-zhaoying-03", kind: "spoken", speaker: "赵映", text: "这种事你倒记得清楚。" },
  { id: "baseline-steward-04", kind: "spoken", speaker: "老周", text: "谁让你第二天把我灯笼藏进假山里，我找了两个时辰。" },
  { id: "baseline-inner", kind: "inner", speaker: "赵映", text: "这一段我记得。窗的位置，墙角的水缸，拐弯那盏灯。都对。" },
  { id: "baseline-lamp-action", kind: "action", text: "赵映走到转角。那里挂着一盏老式壁灯，灯罩有一道纵向裂纹。" },
  { id: "baseline-zhaoying-04", kind: "spoken", speaker: "赵映", text: "这盏还没换？" },
  { id: "baseline-steward-05", kind: "spoken", speaker: "老周", text: "换过两个新的，你沈姨嫌太亮，又让我把旧的挂回来。说晚上从屋里看，还是这一盏像家。" },
] as const;

export const PROLOGUE_WATER_PAVILION_LINES: readonly PrologueStoryLine[] = [
  { id: "water-env", kind: "narration", text: "远处水榭没有开灯。雨落在池面，屋檐的倒影被打得支离。通往水榭的木桥被一道旧锁链拦住。" },
  { id: "water-zhaoying-01", kind: "spoken", speaker: "赵映", text: "还锁着？" },
  { id: "water-steward-01", kind: "spoken", speaker: "老周", text: "夫人不让人过去。木板坏了几块，也没人愿意修。" },
  { id: "water-zhaoying-02", kind: "spoken", speaker: "赵映", text: "是因为沈伯死在那里？" },
  { id: "water-action-lantern", kind: "action", text: "老周把灯稍微往旁边移开。" },
  { id: "water-steward-02", kind: "spoken", speaker: "老周", text: "不是死在那里。是在台阶下面摔的，后来抬回屋里。" },
  { id: "water-zhaoying-03", kind: "spoken", speaker: "赵映", text: "我知道官方记录怎么写。我问你记得什么。" },
  { id: "water-steward-03", kind: "spoken", speaker: "老周", text: "我记得下雨，记得大家都乱，记得你那时候已经走了。" },
  { id: "water-zhaoying-04", kind: "spoken", speaker: "赵映", text: "这句话你说得很顺。" },
  { id: "water-steward-04", kind: "spoken", speaker: "老周", text: "因为我说了七年。" },
  { id: "water-pause", kind: "action", text: "停顿。" },
  { id: "water-zhaoying-05", kind: "spoken", speaker: "赵映", text: "那七年前，他为什么突然非要我走？" },
  { id: "water-steward-05", kind: "spoken", speaker: "老周", text: "这个你明天问夫人。" },
  { id: "water-zhaoying-06", kind: "spoken", speaker: "赵映", text: "为什么不能问你？" },
  { id: "water-steward-06", kind: "spoken", speaker: "老周", text: "因为我那时候也觉得他做得过分。我到今天都不觉得他所有事情是对的。" },
  { id: "water-inner", kind: "inner", speaker: "赵映", text: "这是今晚第一句不像背过的答案。" },
] as const;

export const PROLOGUE_ANOMALY_LINES: readonly PrologueStoryLine[] = [
  { id: "anomaly-return", kind: "action", text: "两人沿原路返回。赵映经过刚才的六扇漏窗，再走到转角灯。她下意识往右看。" },
  { id: "anomaly-wall", kind: "narration", text: "那里只有一整面湿墙。刚才远远能看见的月洞门不见了。" },
  { id: "anomaly-zhaoying-01", kind: "spoken", speaker: "赵映", text: "等等。" },
  { id: "anomaly-steward-01", kind: "spoken", speaker: "老周", text: "怎么了？" },
  { id: "anomaly-zhaoying-02", kind: "spoken", speaker: "赵映", text: "刚才这里有门。" },
  { id: "anomaly-steward-02", kind: "spoken", speaker: "老周", text: "这里？" },
  { id: "anomaly-action-wall", kind: "action", text: "老周走到墙边，用灯照了照。墙面完整，底部苔痕连续，没有新砌痕迹。" },
  { id: "anomaly-steward-03", kind: "spoken", speaker: "老周", text: "这里只有墙。你说的是再往前那个月洞门吧？" },
  { id: "anomaly-zhaoying-03", kind: "spoken", speaker: "赵映", text: "不是。我刚才站在转角，能直接从这里看见西边的小院。" },
  { id: "anomaly-steward-04", kind: "spoken", speaker: "老周", text: "那不可能。墙后是夹院，入口不在这一边。" },
  { id: "anomaly-inner-door", kind: "inner", speaker: "赵映", text: "我记得那道门。不是“好像”。我甚至记得门框左上角缺了一块砖。" },
  { id: "anomaly-zhaoying-04", kind: "spoken", speaker: "赵映", text: "老周，你刚才带我走这条路的时候，有没有经过门？" },
  { id: "anomaly-steward-05", kind: "spoken", speaker: "老周", text: "……我带你走的是我记得的路。" },
  { id: "anomaly-zhaoying-05", kind: "spoken", speaker: "赵映", text: "这算什么回答？" },
  { id: "anomaly-action-look", kind: "action", text: "老周抬眼看她，第一次没有避开视线。" },
  { id: "anomaly-steward-06", kind: "spoken", speaker: "老周", text: "意思是，你明天最好别只问我一个人。" },
] as const;

export const PROLOGUE_CANONICAL_SCENE_ORDER = [
  "gate",
  "front-hall",
  "departure-record",
  "baseline",
  "water",
  "anomaly",
] as const;

export type PrologueNarrativePhase = typeof PROLOGUE_CANONICAL_SCENE_ORDER[number];

export const PROLOGUE_STORY_BY_PHASE: Record<PrologueNarrativePhase, readonly PrologueStoryLine[]> = {
  gate: PROLOGUE_GATE_LINES,
  "front-hall": PROLOGUE_FRONT_HALL_LINES,
  "departure-record": PROLOGUE_DEPARTURE_RECORD_LINES,
  baseline: PROLOGUE_BASELINE_LINES,
  water: PROLOGUE_WATER_PAVILION_LINES,
  anomaly: PROLOGUE_ANOMALY_LINES,
};
