import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const releaseMode = process.argv.includes("--release");

const rules = [
  {
    id: "player.first-person-body",
    label: "赵映第一人称身体代理",
    file: "app/game/runtime/PlayerAvatar.ts",
    forbidden: [/BoxGeometry|SphereGeometry|CylinderGeometry|CapsuleGeometry/],
    required: [/Player_ZhaoYing_FirstPersonAnchor/, /children\)\.toHaveLength\(0\)|geometry-free|Geometry-free/i],
    expected: "正式第一人称不渲染程序化人体；需要可见人物时只能使用正式角色资产/CG",
  },
  {
    id: "npc.steward.world",
    label: "老周世界模型",
    file: "app/game/PrologueRuntime.tsx",
    forbidden: [/Prologue_Steward_Silhouette/, /new THREE\.(?:Cylinder|Sphere|Capsule)Geometry/],
    // A geometry-free anchor is safer than a fake person, but TASK-043 is not
    // releasable until a licensed formal character asset is actually attached.
    required: [/Prologue_Steward_FormalAssetAnchor/, /cloneFormalCharacterAsset\(|tyx-npc-steward/],
    expected: "正式可识别人形资产 + 基础待机/转身/提灯表演；缺资产时宁可阻止发布，不显示球柱人偶",
  },
  {
    id: "prologue.family-portrait.world",
    label: "前厅旧画像世界资产",
    file: "app/game/PrologueRuntime.tsx",
    forbidden: [/new THREE\.BoxGeometry\(1\.08, 0\.82, 0\.07\)/],
    required: [/cg-02-family-portrait-v1\.png/, /Prologue_FrontHallPortrait_Image/],
    expected: "世界内使用正式剧情画像；近景不得回退为灰色 Box 画布",
  },
  {
    id: "prologue.departure-record.world",
    label: "离家记录/旧箱世界资产",
    file: "app/game/PrologueRuntime.tsx",
    forbidden: [/new THREE\.BoxGeometry\(0\.48, 0\.045, 0\.52\)/, /lecternTop|ledgerBook/],
    required: [/cloneFormalAsset\("tyx-arch-pavilion-a", "IncenseBox_LP"\)/, /Prologue_DepartureRecord_FormalProp/],
    expected: "正式旧箱/文书阅读资产；实体来源可追溯到已批准第三方 GLB",
  },
  {
    id: "north-tower.runtime-evidence",
    label: "第二章正式调查视觉",
    file: "app/game/NorthTowerRuntime.tsx",
    forbidden: [/new THREE\.(?:Box|Cylinder|Capsule|Sphere)Geometry/],
    required: [/B_TeaTable_FormalAssetAnchor/, /cloneFormalAsset\([^\n]*(?:tea|cup|ceramic)|tyx-prop-tea-set|tyx-prop-teacup/i, /B_DepartureRecord_FormalAssetAnchor/, /cg-03-liusheng-fifth-figure-v1\.png/],
    expected: "正式 Runtime 不用 Box/Cylinder/Capsule 伪装茶具、文书、画稿或第五人；茶具必须真正绑定正式资产，只有交互 anchor 仍判 BLOCK",
  },
  {
    id: "north-tower.legacy-whitebox-isolated",
    label: "北楼旧白盒隔离",
    file: "app/game/NorthTowerRuntime.tsx",
    forbidden: [/from ["']\.\/runtime\/NorthTowerScene["']/],
    required: [/TingYuXuanScene\.create/],
    expected: "旧 NorthTowerScene 只能留作历史测试，不得进入正式章节 Runtime",
  },
  {
    id: "missing-room.child-room",
    label: "第三章普通儿童房",
    file: "app/game/MissingRoomRuntime.tsx",
    forbidden: [/const bed = new THREE\.Mesh\(new THREE\.BoxGeometry/, /const desk = new THREE\.Mesh\(new THREE\.BoxGeometry/, /MissingRoom_ChildBox"/],
    required: [/cloneFormalAsset\("tyx-arch-house-a"\)/, /cloneFormalAsset\("tyx-arch-pavilion-a", "IncenseBox_LP"\)/, /cg-04-child-room-v1\.png/],
    expected: "重构房间直接复用正式建筑/道具 GLB，并以 CG 承担生活化儿童房细节",
  },
  {
    id: "prologue.anomaly.no-fake-wall",
    label: "序章第一次空间异常",
    file: "app/game/PrologueRuntime.tsx",
    forbidden: [/new THREE\.BoxGeometry\(2\.8, 2\.9, 0\.16\)/],
    required: [/Prologue_FirstCognitiveAnomaly_StateAnchor/, /prologue\.anomaly/],
    expected: "异常由 Master 空间状态与剧情演出表现，不临时生成一块假墙",
  },
];

let blocking = 0;
console.log("Runtime key asset truth gate\n");
for (const rule of rules) {
  const path = resolve(root, rule.file);
  const source = readFileSync(path, "utf8");
  const forbiddenMatches = rule.forbidden.filter((pattern) => pattern.test(source));
  const missingRequired = rule.required.filter((pattern) => !pattern.test(source));
  const blocked = forbiddenMatches.length > 0 || missingRequired.length > 0;
  if (blocked) blocking += 1;
  console.log(`${blocked ? "BLOCK" : "PASS "}  ${rule.id}  ${rule.label}`);
  console.log(`      runtime: ${rule.file}`);
  console.log(`      target : ${rule.expected}`);
  if (forbiddenMatches.length > 0) console.log(`      forbidden matches: ${forbiddenMatches.length}`);
  if (missingRequired.length > 0) console.log(`      missing required : ${missingRequired.length}`);
}

console.log(`\n${blocking} release-blocking key asset group(s).`);
if (releaseMode && blocking > 0) {
  console.error("Release gate failed: formal gameplay still contains critical primitive/whitebox assets or required formal assets are missing.");
  process.exitCode = 1;
}
