import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const templateGame = defineBalanceGame({
  slug: "sample-topic",
  title: "민트초코 vs 바닐라",
  category: "음식",
  tags: ["디저트", "취향", "간식"],
  choices: [
    { label: "민트초코" },
    { label: "바닐라" },
  ],
});

export default templateGame;
