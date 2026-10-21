import type { Question } from '../types/quiz';

export const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];

type OptionExplanationField = `${OptionKey} explanation`;

const OPTION_EXPLANATION_FIELDS: Record<OptionKey, OptionExplanationField> = {
  A: 'A explanation',
  B: 'B explanation',
  C: 'C explanation',
  D: 'D explanation',
};

export const getOptionExplanation = (question: Question, option: OptionKey): string => {
  return question[OPTION_EXPLANATION_FIELDS[option]]?.trim() ?? '';
};

export const getAllOptionExplanations = (question: Question): string[] => {
  return OPTION_KEYS.map((option) => getOptionExplanation(question, option));
};
