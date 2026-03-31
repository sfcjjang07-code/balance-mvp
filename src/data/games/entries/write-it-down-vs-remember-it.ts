import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "write-it-down-vs-remember-it",
  title: "기록해두기 vs 기억에 맡기기",
  category: "습관",
  tags: ["기록", "습관", "생산성"],
  choices: [
    {
      label: "기록해두기",
    },
    {
      label: "기억에 맡기기",
    },
  ],
});

export default balanceGameEntry;
