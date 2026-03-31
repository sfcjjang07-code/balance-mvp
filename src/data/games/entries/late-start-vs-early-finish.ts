import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "late-start-vs-early-finish",
  title: "출근 1시간 늦추기 vs 퇴근 1시간 당기기",
  category: "직장",
  tags: ["직장", "시간", "일상"],
  choices: [
    {
      label: "출근 1시간 늦추기",
    },
    {
      label: "퇴근 1시간 당기기",
    },
  ],
});

export default balanceGameEntry;
