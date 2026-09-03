"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SemanticMorphSpec } from "./dialogue";

interface SemanticMorphTextProps {
  text: string;
  visibleLength?: number;
  spec?: SemanticMorphSpec;
  lineKey: string;
  disabled?: boolean;
  onSettled?: () => void;
}

export const morphLogText = (text: string, spec?: SemanticMorphSpec) => {
  if (!spec || spec.logMode === "stable") return text;
  if (spec.logMode === "none") return "";
  const final = spec.sequence.at(-1);
  return final ? text.replace(spec.source, final) : text;
};

export function SemanticMorphText(props: SemanticMorphTextProps) {
  return <SemanticMorphRun key={props.lineKey} {...props} />;
}

function SemanticMorphRun({ text, visibleLength = text.length, spec, disabled = false, onSettled }: SemanticMorphTextProps) {
  const boundedLength = Math.max(0, Math.min(visibleLength, text.length));
  const shown = text.slice(0, boundedLength);
  const sourceIndex = spec ? text.indexOf(spec.source) : -1;
  const lineFullyVisible = boundedLength >= text.length;
  const sourceFullyVisible = Boolean(spec && sourceIndex >= 0 && lineFullyVisible);
  const [stage, setStage] = useState(-1);
  const [shifting, setShifting] = useState(false);
  const settledRef = useRef(false);
  const onSettledRef = useRef(onSettled);

  useEffect(() => { onSettledRef.current = onSettled; }, [onSettled]);

  const settleOnce = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    onSettledRef.current?.();
  }, []);

  // No valid morph (or an explicitly skipped/previously-read morph) must never
  // block dialogue progression.
  useEffect(() => {
    if (!lineFullyVisible) return;
    if (!spec || disabled || sourceIndex < 0) settleOnce();
  }, [disabled, lineFullyVisible, settleOnce, sourceIndex, spec]);

  // Wait after the complete line has been read before the first ink rewrite.
  useEffect(() => {
    if (!spec || disabled || !sourceFullyVisible || sourceIndex < 0 || stage !== -1 || shifting) return;
    const timer = window.setTimeout(() => setShifting(true), spec.delayMs);
    return () => window.clearTimeout(timer);
  }, [disabled, sourceFullyVisible, sourceIndex, spec, stage, shifting]);

  // The actual visual disturbance is intentionally short. Text replacement
  // happens at its end, so layout never exposes two different word widths at once.
  useEffect(() => {
    if (!spec || !shifting) return;
    const timer = window.setTimeout(() => {
      setStage((current) => Math.min(current + 1, spec.sequence.length - 1));
      setShifting(false);
    }, 190);
    return () => window.clearTimeout(timer);
  }, [shifting, spec]);

  // Hold the current rewritten form, then either rewrite again or settle.
  useEffect(() => {
    if (!spec || disabled || shifting || stage < 0) return;
    if (stage >= spec.sequence.length - 1) {
      const timer = window.setTimeout(settleOnce, 230);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setShifting(true), spec.holdMs);
    return () => window.clearTimeout(timer);
  }, [disabled, settleOnce, shifting, spec, stage]);

  const rendered = useMemo(() => {
    if (!spec || sourceIndex < 0 || boundedLength <= sourceIndex) return <>{shown}</>;
    const before = text.slice(0, Math.min(sourceIndex, boundedLength));
    const sourceVisibleChars = Math.max(0, Math.min(spec.source.length, boundedLength - sourceIndex));
    const sourceShown = spec.source.slice(0, sourceVisibleChars);
    const afterStart = sourceIndex + spec.source.length;
    const after = boundedLength > afterStart ? text.slice(afterStart, boundedLength) : "";
    const current = stage >= 0 ? spec.sequence[Math.min(stage, spec.sequence.length - 1)] : sourceShown;
    const widthText = [spec.source, ...spec.sequence].reduce((longest, candidate) => candidate.length > longest.length ? candidate : longest, spec.source);
    return <>{before}<span className={`semantic-morph semantic-morph-${spec.shake}${shifting ? " is-shifting" : ""}`} data-source={spec.source}><span className="semantic-morph-sizer" aria-hidden="true">{widthText}</span><span className="semantic-morph-value">{current}</span></span>{after}</>;
  }, [boundedLength, shown, sourceIndex, spec, stage, shifting, text]);

  return <>{rendered}</>;
}
