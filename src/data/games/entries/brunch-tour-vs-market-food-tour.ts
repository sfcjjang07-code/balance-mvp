import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "brunch-tour-vs-market-food-tour",
  title: "브런치 카페 투어 vs 시장 맛집 투어",
  category: "나들이",
  tags: ["음식", "주말", "탐방"],
  choices: [
    {
      label: "브런치 카페 투어",
    },
    {
      label: "시장 맛집 투어",
    },
  ],
});

export default balanceGameEntry;
