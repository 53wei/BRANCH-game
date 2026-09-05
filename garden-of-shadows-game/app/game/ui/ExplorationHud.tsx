import type { ReactNode } from "react";

export interface ExplorationObjective {
  label: string;
  title: string;
  detail?: string;
}

interface ExplorationHudProps {
  objective?: ExplorationObjective;
  prompt?: string;
  subtitle?: ReactNode;
  map?: ReactNode;
  direction?: ReactNode;
}

export function ExplorationHud({ objective, prompt, subtitle, map, direction }: ExplorationHudProps) {
  return (
    <>
      {objective && (
        <aside className="objective-card exploration-objective" aria-live="polite">
          <span>{objective.label}</span>
          <strong>{objective.title}</strong>
          {objective.detail && <p>{objective.detail}</p>}
        </aside>
      )}
      {map}
      <div className="runtime-reticle" aria-hidden="true" />
      {direction}
      {prompt && (
        <div className="interaction-prompt">
          <kbd>F</kbd>
          <span>{prompt}</span>
        </div>
      )}
      {subtitle && <div className="bark-subtitle">{subtitle}</div>}
    </>
  );
}
