import type { DocumentDefinition } from "../ui/DocumentViewer";

/**
 * Document copy is restricted to facts already established by the narrative source.
 * Background rows deliberately avoid inventing names/times that would become new canon.
 */
export const PROLOGUE_DEPARTURE_DOCUMENT: DocumentDefinition = {
  id: "prologue-departure-record",
  kind: "record",
  title: "七年前的离家登记",
  subtitle: "从沈夫人收好的旧箱中取出",
  owner: "听雨轩旧档",
  date: "七年前 · 雨夜",
  pages: [
    {
      id: "record-front",
      heading: "离家登记",
      subheading: "纸边被潮气洇软，墨色已经褪淡",
      rows: [
        { id: "column-head", left: "姓名", text: "离园记事", right: "时刻" },
        { id: "background-before", left: "上一行", text: "字迹受潮，姓名与时刻已经难以辨认。", right: "—" },
        { id: "zhaoying", left: "赵映", text: "傍晚离开听雨轩。", right: "六点十分", emphasis: true, annotation: "纸角有非常浅的压痕，像同一位置曾写过另一组数字后又被处理。" },
        { id: "background-after", left: "下一行", text: "墨迹被水晕开，只剩零散笔画。", right: "—" },
      ],
      footer: "纸面所记与赵映此时的记忆一致；压痕的原数字和留下它的人，此时都还无法确认。",
    },
    {
      id: "box-context",
      heading: "旧箱内物件",
      subheading: "钥匙、怀表和票据平码在登记表下面",
      rows: [
        { id: "keys", left: "物件", text: "一串旧钥匙。", right: "保留" },
        { id: "watch", left: "物件", text: "一只旧怀表。", right: "保留" },
        { id: "tickets", left: "物件", text: "一沓用牛皮纸包起来的旧票据。", right: "保留" },
      ],
      footer: "沈夫人把这些东西留了七年，一件也没有扔。",
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
      id: "record-flat-light",
      heading: "离园记录",
      subheading: "平放在桌面时，三份时间彼此吻合",
      rows: [
        { id: "departure", left: "离园登记", text: "赵映于六点十分离开听雨轩。", right: "18:10", emphasis: true },
        { id: "ticket", left: "车票底联", text: "六点四十五分上车。", right: "18:45" },
        { id: "town", left: "镇口抄记", text: "车在七点前离开镇口。", right: "七点前" },
      ],
      footer: "钱先生：六点十分离园，六点四十五分上车，车在七点前离开镇口。三份记录互相对得上。",
    },
    {
      id: "record-raking-light",
      heading: "离园记录",
      subheading: "把时间栏侧过灯光后，纸面纤维显出逆毛",
      rows: [
        { id: "departure", left: "离园登记", text: "赵映于六点十分离开听雨轩。", right: "18:10", emphasis: true, abraded: true, annotation: "现有墨迹下面有轻微刮擦；刮纸留下的逆毛在侧光下可见。" },
        { id: "ticket", left: "车票底联", text: "六点四十五分上车。", right: "18:45" },
        { id: "town", left: "镇口抄记", text: "车在七点前离开镇口。", right: "七点前" },
      ],
      footer: "这里只能确认离园时间被改过；原来写的几点、由谁改动，纸面没有直接给出答案。",
    },
  ],
};

export const CASE_FILE_DOCUMENTS: Readonly<Partial<Record<string, DocumentDefinition>>> = {
  "prologue-departure-record": PROLOGUE_DEPARTURE_DOCUMENT,
  "north-departure-record": NORTH_DEPARTURE_DOCUMENT,
  "deleted-unsent-letter": DELETED_PERSON_UNSENT_LETTER,
};
