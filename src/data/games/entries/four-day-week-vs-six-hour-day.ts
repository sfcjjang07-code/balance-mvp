import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "four-day-week-vs-six-hour-day",
  title: "주 4일 근무 vs 하루 6시간 근무",
  category: "직장",
  tags: ["직장", "제도", "시간"],
  choices: [
    {
      label: "주 4일 근무",
    },
    {
      label: "하루 6시간 근무",
    },
  ],
});

export default balanceGameEntry;
