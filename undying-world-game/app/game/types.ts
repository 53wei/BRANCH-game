export type View = "intro" | "game" | "deduction" | "choice" | "ending";

export type Evidence = {
  id: string;
  code: string;
  title: string;
  kind: "记录" | "物证" | "证词";
  summary: string;
  detail: string;
};

export type Hotspot = {
  id: string;
  x: number;
  y: number;
  label: string;
  title: string;
  text: string;
  evidenceId?: string;
  requires?: string;
};

export type Room = {
  id: string;
  name: string;
  short: string;
  atmosphere: string;
  lockedUntil?: string;
  hotspots: Hotspot[];
};

export type ChapterDefinition = {
  id: string;
  number: string;
  title: string;
  objective: string;
  intro: string;
  inputFlag: string | null;
  outputFlag: string;
  initialRoomId: string;
  minimumEvidence: number;
  correctDeduction: string;
  question: string;
  deductionHelp: string;
  deductionOptions: { id: string; label: string }[];
  endingChoice?: {
    prompt: string;
    help: string;
    options: { id: string; label: string }[];
  };
  evidence: Evidence[];
  rooms: Room[];
  endingTitle: string;
  endingBody: string;
  endingQuote: string;
};

export type ChapterProgress = {
  roomId: string;
  foundEvidenceIds: string[];
  completed: boolean;
  decisionId?: string;
};

export type CampaignSave = {
  schemaVersion: 1;
  activeChapterId: string;
  flags: string[];
  chapters: Record<string, ChapterProgress>;
  updatedAt: string;
};
