import { Compiler } from "inkjs/full";

const cache = new Map<string, string>();

/**
 * Compile authored Ink source into the JSON string consumed by inkjs Story.
 * Runtime callers pass a stable cache key so the same source is compiled once.
 */
export function compileInkSource(cacheKey: string, source: string): string {
  const normalized = source.replace(/^\uFEFF/, "");
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const compiled = new Compiler(normalized).Compile().ToJson() ?? "";
  cache.set(cacheKey, compiled);
  return compiled;
}
