import type { DocumentDefinition } from "../ui/DocumentViewer";

/**
 * Document copy is restricted to facts already established by the narrative source.
 * Background rows deliberately avoid inventing names/times that would become new canon.
 */
export const PROLOGUE_DEPARTURE_DOCUMENT: DocumentDefinition = {
  id: "prologue-departure-record",
  kind: "record",
  title: "七年前的离家登记",
  subtitle: "旧箱内保存的原始纸面之一",
  owner: "听雨轩旧档",
  date: "七年前 · 雨夜",
  pages: [
    {
      id: "record-front",
      heading: "离家登记",
      subheading: "按原纸面逐行查看；未辨认内容不补写",
      rows: [
        { id: "background-before", left: "同页旧记录", text: "字迹已褪，不作为本次调查信息。", right: "—" },
        { id: "zhaoying", left: "赵映", text: "傍晚六点十分离开听雨轩。", right: "18:10", emphasis: true, annotation: "纸角在同一数字位置留有非常浅的二次压痕；现阶段无法可靠读出原数字。" },
        { id: "background-after", left: "同页旧记录", text: "雨夜登记继续，内容与当前问题无直接关联。", right: "—" },
      ],
      footer: "可确认事实：现有文字与赵映记忆一致；纸面同时保留过另一组数字被处理后的压痕。两件事可以同时成立。",
    },
    {
      id: "box-context",
      heading: "旧箱内物件",
      subheading: "与登记表放在同一层",
      rows: [
        { id: "keys", left: "物件", text: "一串旧钥匙。", right: "保留" },
        { id: "watch", left: "物件", text: "一只旧怀表。", right: "保留" },
        { id: "tickets", left: "物件", text: "一沓用牛皮纸包起来的旧票据。", right: "保留" },
      ],
      footer: "老周确认这些东西由沈夫人保存。它们说明旧物被长期留下，但本页不把“为什么留下”写成结论。",
    },
  ],
};

export const DELETED_PERSON_UNSENT_LETTER: DocumentDefinition = {
  id: "deleted-person-unsent-letter",
  kind: "letter",
  title: "未寄出的信",
  subtitle: "事故当天白天 · 旧书桌夹层",
  owner: "沈老爷",
  date: "事故当天白天",
  pages: [
    {
      id: "letter-page-1",
      heading: "阿映：",
      rows: [
        { id: "p1", text: "你一定觉得我急着赶你走，是因为你不是沈家的人。恰恰相反，是因为你在这里待得太久，久到这园子里每个人记得你的方式都开始比你自己更牢。" },
        { id: "p2", text: "这几年我越来越分不清，是我们在改园子，还是园子在顺着我们共同记住的样子改自己。我没有证据，也知道这话听起来像疯话。" },
        { id: "p3", text: "所以我不求你信。" },
      ],
    },
    {
      id: "letter-page-2",
      rows: [
        { id: "p4", text: "我只希望你先离开这里，去一个没有人替你决定“你应该是什么样”的地方。" },
        { id: "p5", text: "我不是要你消失。", emphasis: true },
        { id: "p6", text: "我是要你走得出去。", emphasis: true },
      ],
      footer: "信没有封口，也没有交给赵映。",
    },
  ],
};

export const FINALE_DOCUMENTARY_ADDENDUM: DocumentDefinition = {
  id: "finale-departure-addendum",
  kind: "record",
  title: "离家记录 · 补充说明",
  subtitle: "不修改原件，只补记后来确认的事实",
  owner: "钱先生",
  date: "七年后 · 清晨",
  pages: [
    {
      id: "addendum",
      heading: "补充说明",
      rows: [
        { id: "original-kept", left: "原件", text: "七年前离家记录保持原样，不销毁、不覆盖。", right: "保留" },
        { id: "return-fact", left: "补记", text: "赵映于案发当晚傍晚离园，后在事故发生前折返听雨轩。", right: "新增", emphasis: true },
        { id: "responsibility", left: "说明人", text: "原记录未完整反映当晚经过；本说明用于承认并保留这一错误。", right: "钱先生" },
      ],
      footer: "文字可以留下错误，也可以把错误本身记录下来。",
    },
  ],
};

export const NORTH_DEPARTURE_DOCUMENT: DocumentDefinition = {
  id: "north-departure-record",
  kind: "ledger",
  title: "离园记录 · 复核页",
  subtitle: "钱先生认知中的纸面先后关系",
  owner: "北楼账房",
  date: "案发当晚记录 · 事后有修改",
  pages: [
    {
      id: "ink-order",
      heading: "离园记录",
      subheading: "先看纸面，不先解释身份",
      rows: [
        { id: "original", left: "原字", text: "原始登记墨迹已经完全干透。", right: "先写" },
        { id: "addition", left: "时间栏", text: "现有时间旁存在后来补过的一笔。", right: "后补", emphasis: true, annotation: "补笔墨色与落笔状态和原字不同。" },
        { id: "indent", left: "纸背", text: "原先数字留下的压痕仍可见，但不足以可靠还原完整数字。", right: "压痕" },
      ],
      footer: "钱先生：账目能改，落笔的先后不能改。",
    },
    {
      id: "observation-limit",
      heading: "本页可记录到哪里",
      subheading: "事实与身份判断分开",
      rows: [
        { id: "fact-1", left: "事实 01", text: "这张离园记录在原字干透后被再次落笔。", right: "可确认" },
        { id: "fact-2", left: "事实 02", text: "纸背保留原先数字的压痕。", right: "可确认" },
        { id: "limit", left: "暂不确认", text: "单凭这张纸不能确认是谁要求修改，也不能单独确认第五个人身份。", right: "待核对" },
      ],
      footer: "赵映只把“修改发生过”记入案卷；身份答案需要与生活痕迹、图像证据交叉验证。",
    },
  ],
};
