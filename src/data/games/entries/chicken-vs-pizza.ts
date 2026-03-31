import { defineBalanceGame } from "../defineBalanceGame";

export default defineBalanceGame({
  slug: "chicken-vs-pizza",
  title: "치킨 vs 피자",
  category: "음식",
  tags: ["야식", "배달", "음식", "친구랑하기좋은"],
  description: "밤 늦게 딱 하나만 시킬 수 있을 때 가장 자주 붙는 대표 밸런스게임입니다.",
  seedVotes: { a: 18, b: 13 },
  choices: [
    {
      label: "치킨",
      summary: "겉바속촉의 정석. 실패 확률이 낮은 야식 왕도.",
      colors: ["#ff9966", "#ff5e62"],
    },
    {
      label: "피자",
      summary: "도우와 토핑의 만족감. 함께 먹을수록 강한 선택.",
      colors: ["#f6d365", "#fda085"],
    },
  ],
});
