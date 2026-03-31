import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "don-vs-ujeong",
  title: "돈 vs 우정",
  category: "돈",
  tags: ["돈"],
  description: "돈 vs 우정. 둘 중 하나만 고를 수 있다면 당신의 선택은 무엇인가요?",
  choices: [
    {
      label: "돈",
      image: "",
      emoji: "",
      summary: "돈 쪽이 더 끌린다면 이 선택으로 바로 결정해보세요.",
    },
    {
      label: "우정",
      image: "",
      emoji: "",
      summary: "우정 쪽이 더 끌린다면 이 선택으로 바로 결정해보세요.",
    },
  ],
});

export default balanceGameEntry;
