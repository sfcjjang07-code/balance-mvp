import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "call-first-vs-text-first",
  title: "중요한 얘기는 전화 vs 중요한 얘기는 문자",
  category: "소통",
  tags: ["소통", "연락", "일상"],
  choices: [
    {
      label: "중요한 얘기는 전화",
    },
    {
      label: "중요한 얘기는 문자",
    },
  ],
});

export default balanceGameEntry;
