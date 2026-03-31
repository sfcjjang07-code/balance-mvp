import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "dog-life-vs-cat-life",
  title: "강아지와 살기 vs 고양이와 살기",
  category: "반려",
  tags: ["반려", "동물", "일상"],
  choices: [
    {
      label: "강아지와 살기",
    },
    {
      label: "고양이와 살기",
    },
  ],
});

export default balanceGameEntry;
