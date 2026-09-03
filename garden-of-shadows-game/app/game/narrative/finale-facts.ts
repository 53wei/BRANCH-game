export const FINAL_FACTS = [
  { id: "grew-up-here", label: "赵映在沈家长大，是旧日合影与儿童房中的第五个人。" },
  { id: "left-and-returned", label: "她七年前离园，并在案发当晚由西侧路线折返。" },
  { id: "argument", label: "她与沈老爷在水榭发生争执。" },
  { id: "no-push", label: "两人没有身体接触；沈老爷在湿木阶自行失足，跌倒后仍有意识。" },
  { id: "protective-order", label: "沈老爷要求众人维持“今晚，赵映没有回来”的说法，以保护她离开。" },
  { id: "four-erased", label: "四个人分别删除生活、空间、文字与图像痕迹。" },
  { id: "delay-contributed", label: "掩盖行动延误救治，并共同增加了沈老爷死亡的可能。" },
] as const;

export const FINAL_FACT_IDS = FINAL_FACTS.map((fact) => fact.id);
