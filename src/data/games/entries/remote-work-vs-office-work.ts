import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "remote-work-vs-office-work",
  title: "완전 재택근무 vs 사무실 출근",
  category: "직장",
  tags: ["직장", "근무방식", "루틴"],
  choices: [
    {
      label: "완전 재택근무",
    },
    {
      label: "사무실 출근",
    },
  ],
});

export default balanceGameEntry;
