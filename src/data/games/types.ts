export type ChoiceId = "a" | "b";

export type BalanceChoice = {
  id: ChoiceId;
  label: string;
  colors: [string, string];
};

export type BalanceGame = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  choices: [BalanceChoice, BalanceChoice];
  searchIndex: string;
};

export type BalanceChoiceInput = {
  label: string;
  colors?: [string, string];
};

export type BalanceGameInput = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  choices: [BalanceChoiceInput, BalanceChoiceInput];
};
