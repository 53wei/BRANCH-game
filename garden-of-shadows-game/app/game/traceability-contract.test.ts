import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const mother = readFileSync(join(process.cwd(), "..", "游园惊梦_整体重构执行母文档_V1.0.md"), "utf8");
const matrix = readFileSync(join(process.cwd(), "docs", "restructure", "traceability.md"), "utf8");

const problemIds = [...mother.matchAll(/^\|\s*((?:NAR|UI|DOC|TASK|INV|MAP|NAV|LVL|ART|ENV|PHY|CAM|ONB|AUDIO|CG|DEV|QA)-\d+)\s*\|/gm)]
  .map((match) => match[1]);

const rowFor = (id: string) => matrix.split(/\r?\n/).find((line) => line.startsWith(`| ${id} |`));

describe("TASK-003 problem traceability", () => {
  it("imports every problem id from the mother document exactly once", () => {
    expect(problemIds.length).toBeGreaterThan(0);
    expect(new Set(problemIds).size).toBe(problemIds.length);
    for (const id of problemIds) {
      expect(rowFor(id), `missing traceability row for ${id}`).toBeTruthy();
      expect(matrix.match(new RegExp(`^\\| ${id.replace("-", "\\-")} \\|`, "gm"))?.length ?? 0).toBe(1);
    }
  });

  it("assigns at least one task and a concrete close condition to every problem", () => {
    for (const id of problemIds) {
      const row = rowFor(id)!;
      const cells = row.split("|").map((cell) => cell.trim()).filter(Boolean);
      const responsibleTasks = cells[3] ?? "";
      const closeCondition = cells[6] ?? "";
      expect(responsibleTasks, `${id} has no task owner`).toMatch(/\d{3}/);
      expect(closeCondition.length, `${id} has no close condition`).toBeGreaterThan(8);
    }
  });

  it("never treats AUDIT/PARTIAL/VERIFY as a fixed problem", () => {
    const problemRows = matrix.split(/\r?\n/).filter((line) => /^\| (?:NAR|UI|DOC|TASK|INV|MAP|NAV|LVL|ART|ENV|PHY|CAM|ONB|AUDIO|CG|DEV|QA)-\d+ \|/.test(line));
    for (const row of problemRows) {
      expect(row).not.toContain("| FIXED |");
    }
  });
});
