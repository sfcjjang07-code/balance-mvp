import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "sea-stay-vs-valley-stay",
  title: "바다 숙소 vs 계곡 숙소",
  category: "여행",
  tags: ["여행", "자연", "휴식"],
  choices: [
    {
      label: "바다 숙소",
    },
    {
      label: "계곡 숙소",
    },
  ],
});

export default balanceGameEntry;
