import { defineBalanceGame } from "../defineBalanceGame";

export default defineBalanceGame({
  slug: "coffee-vs-tea",
  title: "커피 vs 차",
  category: "음식",
  tags: ["카페", "음료", "습관", "취향"],
  description: "집중의 커피냐, 안정의 차냐. 하루의 텐션을 정하는 두 갈래입니다.",
  seedVotes: { a: 28, b: 15 },
  choices: [
    {
      label: "커피",
      summary: "강한 한 잔으로 하루를 깨우는 선택.",
      colors: ["#603813", "#b29f94"],
    },
    {
      label: "차",
      summary: "부드럽고 차분하게 컨디션을 잡는 선택.",
      colors: ["#11998e", "#38ef7d"],
    },
  ],
});
