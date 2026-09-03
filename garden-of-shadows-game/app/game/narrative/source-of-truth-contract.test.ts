import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

type LockedSource = {
  role: string;
  path: string;
  title: string;
  sha256: string;
  priority: number;
};

const manifestPath = join(process.cwd(), "docs", "restructure", "SOURCE_VERSIONS.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { sources: LockedSource[] };
const sha256 = (content: Buffer) => createHash("sha256").update(content).digest("hex");

describe("TASK-002 source-of-truth lock", () => {
  it("keeps exactly three ordered authoritative sources", () => {
    expect(manifest.sources.map((source) => source.role)).toEqual(["narrative-master", "restructure-spec", "task-plan"]);
    expect(manifest.sources.map((source) => source.priority)).toEqual([1, 2, 3]);
  });

  it("fails if an authoritative source silently changes", () => {
    for (const source of manifest.sources) {
      const absolute = resolve(dirname(manifestPath), source.path);
      expect(sha256(readFileSync(absolute)), source.title).toBe(source.sha256);
    }
  });

  it("keeps the strict execution protocol in project docs", () => {
    const protocol = readFileSync(join(process.cwd(), "docs", "restructure", "EXECUTION_PROTOCOL.md"), "utf8");
    expect(protocol).toContain("禁止跳 TASK、跳执行步骤、跳剧情场景、跳母文档问题");
    expect(protocol).toContain("禁止 UI/Runtime 现场拼接新的主线剧情含义");
    expect(protocol).toContain("VERIFY-DEFERRED");
  });
});
