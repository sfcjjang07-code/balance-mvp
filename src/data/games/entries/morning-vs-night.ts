import { defineBalanceGame } from "../defineBalanceGame";

export default defineBalanceGame({
  slug: "morning-vs-night",
  title: "아침형 인간 vs 올빼미형 인간",
  category: "라이프",
  tags: ["생활", "수면", "루틴", "성향"],
  description: "생산성, 집중력, 생활 리듬까지. 당신의 진짜 운영체제를 고르는 선택입니다.",
  seedVotes: { a: 21, b: 24 },
  choices: [
    {
      label: "아침형 인간",
      summary: "해 뜨기 전에 움직이는 타입. 일찍 시작하는 리듬이 강점.",
      colors: ["#f6d365", "#fda085"],
    },
    {
      label: "올빼미형 인간",
      summary: "밤이 되어야 엔진이 붙는 타입. 고요한 시간에 몰입하는 스타일.",
      colors: ["#667eea", "#764ba2"],
    },
  ],
});
