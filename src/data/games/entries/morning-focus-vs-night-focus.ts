import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "morning-focus-vs-night-focus",
  title: "집중은 아침형 vs 집중은 밤형",
  category: "자기관리",
  tags: ["집중", "루틴", "자기관리"],
  choices: [
    {
      label: "아침형 집중",
    },
    {
      label: "밤형 집중",
    },
  ],
});

export default balanceGameEntry;
