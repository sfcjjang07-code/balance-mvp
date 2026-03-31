import type { BalanceChoice, BalanceGame, BalanceGameInput, ChoiceId } from "./types";

const palettes: Array<[string, string]> = [
  ["#60a5fa", "#3b82f6"],
  ["#fbbf24", "#f59e0b"],
  ["#8b5cf6", "#6366f1"],
  ["#34d399", "#10b981"],
];

function buildChoice(
  choiceId: ChoiceId,
  index: number,
  label: string,
  input: BalanceGameInput["choices"][number],
): BalanceChoice {
  return {
    id: choiceId,
    label,
    colors: input.colors ?? palettes[index % palettes.length],
  };
}

export function defineBalanceGame(input: BalanceGameInput): BalanceGame {
  const [choiceA, choiceB] = input.choices;
  const normalizedChoices: [BalanceChoice, BalanceChoice] = [
    buildChoice("a", 0, choiceA.label, choiceA),
    buildChoice("b", 1, choiceB.label, choiceB),
  ];

  return {
    slug: input.slug,
    title: input.title,
    category: input.category,
    tags: input.tags,
    choices: normalizedChoices,
    searchIndex: [
      input.title,
      input.category,
      ...(input.tags ?? []),
      choiceA.label,
      choiceB.label,
    ]
      .join(" ")
      .toLowerCase(),
  };
}
