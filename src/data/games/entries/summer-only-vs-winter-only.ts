import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "summer-only-vs-winter-only",
  title: "평생 여름만 살기 vs 평생 겨울만 살기",
  category: "라이프",
  tags: ["계절", "취향", "가정"],
  choices: [
    {
      label: "평생 여름만 살기",
    },
    {
      label: "평생 겨울만 살기",
    },
  ],
});

export default balanceGameEntry;
