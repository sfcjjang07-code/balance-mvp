import { defineBalanceGame } from "../defineBalanceGame";

export default defineBalanceGame({
  slug: "city-vs-nature",
  title: "도시 라이프 vs 자연 라이프",
  category: "여행",
  tags: ["여행", "휴식", "감성", "라이프스타일"],
  description: "불빛 가득한 도시와 한적한 자연. 마음이 끌리는 공간을 골라보세요.",
  seedVotes: { a: 14, b: 17 },
  choices: [
    {
      label: "도시 라이프",
      summary: "속도감, 자극, 인프라. 다이내믹한 일상을 원하는 선택.",
      colors: ["#0f2027", "#2c5364"],
    },
    {
      label: "자연 라이프",
      summary: "여유, 공기, 풍경. 느리지만 깊은 만족을 주는 선택.",
      colors: ["#56ab2f", "#a8e063"],
    },
  ],
});
