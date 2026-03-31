import { defineBalanceGame } from "../defineBalanceGame";

export default defineBalanceGame({
  slug: "beach-vs-mountain",
  title: "바다 여행 vs 산 여행",
  category: "여행",
  tags: ["여행", "휴가", "힐링", "자연"],
  description: "파도 소리와 시원한 풍경, 둘 중 당신의 휴식 본능에 더 가까운 곳은 어디인가요?",
  seedVotes: { a: 19, b: 12 },
  choices: [
    {
      label: "바다 여행",
      summary: "탁 트인 시야와 청량한 분위기를 좋아하는 사람의 선택.",
      colors: ["#36d1dc", "#5b86e5"],
    },
    {
      label: "산 여행",
      summary: "맑은 공기와 고요한 풍경 속으로 들어가는 선택.",
      colors: ["#134e5e", "#71b280"],
    },
  ],
});
