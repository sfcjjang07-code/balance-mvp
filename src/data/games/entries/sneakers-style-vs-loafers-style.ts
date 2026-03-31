import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "sneakers-style-vs-loafers-style",
  title: "운동화 위주 스타일 vs 로퍼 위주 스타일",
  category: "패션",
  tags: ["패션", "스타일", "일상"],
  choices: [
    {
      label: "운동화 위주 스타일",
    },
    {
      label: "로퍼 위주 스타일",
    },
  ],
});

export default balanceGameEntry;
