import { defineBalanceGame } from "../defineBalanceGame";

export default defineBalanceGame({
  slug: "call-vs-text",
  title: "전화가 편함 vs 문자메시지가 편함",
  category: "관계",
  tags: ["소통", "연애", "친구", "성향"],
  description: "빠르게 끝내는 통화와 편하게 남기는 문자. 당신은 어떤 방식이 더 편한가요?",
  seedVotes: { a: 11, b: 26 },
  choices: [
    {
      label: "전화가 편함",
      summary: "바로 말하고 바로 끝내는 시원한 커뮤니케이션.",
      colors: ["#43cea2", "#185a9d"],
    },
    {
      label: "문자가 편함",
      summary: "생각 정리 후 전달하는 편안한 소통 스타일.",
      colors: ["#7f00ff", "#e100ff"],
    },
  ],
});
