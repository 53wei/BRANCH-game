import type { DialogueSequence } from "../types";

export const deletedPersonDialogueSequences: DialogueSequence[] = [
  { id: "deleted-wife-boxes", knotId: "deleted_wife_boxes", presentation: "stage", participants: ["zhaoying", "wife"], defaultRightSpeaker: "wife", completionFlag: "deleted-person.evidence.wife-boxes" },
  { id: "deleted-gardener-route", knotId: "deleted_gardener_route", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "deleted-person.evidence.gardener-route" },
  { id: "deleted-accountant-packet", knotId: "deleted_accountant_packet", presentation: "stage", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "deleted-person.evidence.accountant-packet" },
  { id: "deleted-painter-original", knotId: "deleted_painter_original", presentation: "stage", participants: ["zhaoying", "painter"], defaultRightSpeaker: "painter", completionFlag: "deleted-person.evidence.painter-original" },
  { id: "deleted-letter-reaction", knotId: "deleted_letter_reaction", presentation: "stage", participants: ["zhaoying"], defaultRightSpeaker: "wife", completionFlag: "deleted-person.letter-reaction-complete" },
  { id: "deleted-new-contradiction", knotId: "deleted_new_contradiction", presentation: "stage", participants: ["zhaoying", "steward", "wife"], defaultRightSpeaker: "steward", completionFlag: "deleted-person.new-contradiction-complete" },
];
