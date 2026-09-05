export const choicePositionForNumberKey = (code: string, choiceCount: number): number | undefined => {
  const match = code.match(/^(?:Digit|Numpad)([1-9])$/);
  if (!match) return undefined;
  const position = Number(match[1]) - 1;
  return position < choiceCount ? position : undefined;
};

export const steppedChoicePosition = (current: number, choiceCount: number, delta: -1 | 1) => {
  if (choiceCount <= 0) return 0;
  return (current + delta + choiceCount) % choiceCount;
};
