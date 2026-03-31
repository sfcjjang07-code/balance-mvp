import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "gelato-cafe-vs-bingsu-house",
  title: "젤라토 카페 vs 빙수집",
  category: "음식",
  tags: ["여름", "디저트", "주말"],
  choices: [
    {
      label: "젤라토 카페",
    },
    {
      label: "빙수집",
    },
  ],
});

export default balanceGameEntry;
