import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "planned-trip-vs-spontaneous-trip",
  title: "여행은 철저한 계획 vs 여행은 즉흥이 핵심",
  category: "여행",
  tags: ["여행", "성향", "계획"],
  choices: [
    {
      label: "철저한 계획 여행",
    },
    {
      label: "즉흥 여행",
    },
  ],
});

export default balanceGameEntry;
