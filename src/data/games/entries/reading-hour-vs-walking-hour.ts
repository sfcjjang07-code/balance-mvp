import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "reading-hour-vs-walking-hour",
  title: "퇴근 후 독서 1시간 vs 산책 1시간",
  category: "휴식",
  tags: ["휴식", "루틴", "회복"],
  choices: [
    {
      label: "독서 1시간",
    },
    {
      label: "산책 1시간",
    },
  ],
});

export default balanceGameEntry;
