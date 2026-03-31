import { defineBalanceGame } from "../defineBalanceGame";

export default defineBalanceGame({
  slug: "movie-vs-series",
  title: "영화 몰아보기 vs 드라마 정주행",
  category: "콘텐츠",
  tags: ["영화", "드라마", "OTT", "취향"],
  description: "짧고 강한 몰입의 영화와 오래 빠져드는 드라마 중 하나만 고른다면?",
  seedVotes: { a: 17, b: 23 },
  choices: [
    {
      label: "영화 몰아보기",
      summary: "짧고 굵은 몰입을 선호하는 사람의 선택.",
      colors: ["#232526", "#414345"],
    },
    {
      label: "드라마 정주행",
      summary: "캐릭터와 서사에 오래 머무는 걸 좋아하는 선택.",
      colors: ["#4e54c8", "#8f94fb"],
    },
  ],
});
