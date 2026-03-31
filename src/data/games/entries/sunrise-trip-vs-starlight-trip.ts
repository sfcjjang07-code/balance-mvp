import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "sunrise-trip-vs-starlight-trip",
  title: "일출 여행 vs 별 보기 여행",
  category: "여행",
  tags: ["풍경", "여행", "감성"],
  choices: [
    {
      label: "일출 여행",
    },
    {
      label: "별 보기 여행",
    },
  ],
});

export default balanceGameEntry;
