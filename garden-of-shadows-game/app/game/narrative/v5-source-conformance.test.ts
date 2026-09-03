import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (relative: string) => readFileSync(join(process.cwd(), relative), "utf8");

describe("V5 narrative source conformance", () => {
  it("keeps chapter one on the mother-script beats and removes the retired chase branch", () => {
    const ink = read("app/game/narrative/west-onboarding.ink");

    const requiredV5Lines = [
      "昨晚几点睡的？你这件外套还是湿的，老周没有给你找烘衣架？",
      "你小时候嫌正门绕，每次从厨房拿完东西都从这边钻。",
      "雨水顺着墙脚往前流，到这里突然断了。",
      "你们两个现在站在同一个地方，一个说我面前是墙，一个说我面前是路。",
      "我刚才已经走过这里。",
      "……这不应该成立。",
      "赵映，我可以为了让你安心编一个名字。可那样只会让你又多一个假的答案。",
      "如果这个人就是七年前那晚的第五个人，沈伯的死也许从一开始就漏了一个人。",
    ];
    requiredV5Lines.forEach((line) => expect(ink).toContain(line));

    expect(ink).not.toContain("=== chase_intro ===");
    expect(ink).not.toContain("没有脸的人");
    expect(ink).not.toContain("顾蘅秋");
    expect(ink).not.toContain("周守圃");
    expect(ink).not.toContain("先把你记得的西院重新走一遍");
  });

  it("requires explicit narrative semantics for chapter-one authored lines", () => {
    const ink = read("app/game/narrative/west-onboarding.ink");
    const authoredLines = ink
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//") && !line.startsWith("===") && line !== "-> END");

    expect(authoredLines.length).toBeGreaterThan(40);
    authoredLines.forEach((line) => expect(line).toMatch(/# kind:(spoken|inner|narration|action|choice|cg|interaction)\b/));
  });
});
