import { defineBalanceGame } from "../defineBalanceGame";

export default defineBalanceGame({
  slug: "plan-vs-spontaneous",
  title: "계획형 vs 즉흥형",
  category: "성격",
  tags: ["성격", "MBTI감성", "성향", "취향"],
  description: "미리 짜는 안정감과 그때그때 움직이는 자유로움 중 어떤 쪽이 더 나와 닮았을까요?",
  seedVotes: { a: 25, b: 20 },
  choices: [
    {
      label: "계획형",
      summary: "준비된 흐름에서 편안함을 느끼는 타입.",
      colors: ["#1d4350", "#a43931"],
    },
    {
      label: "즉흥형",
      summary: "상황을 즐기며 즉시 반응하는 타입.",
      colors: ["#f953c6", "#b91d73"],
    },
  ],
});
