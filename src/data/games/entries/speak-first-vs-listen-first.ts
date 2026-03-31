import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "speak-first-vs-listen-first",
  title: "먼저 말하기 vs 끝까지 듣기",
  category: "소통",
  tags: ["소통", "성향", "관계"],
  choices: [
    {
      label: "먼저 말하기",
    },
    {
      label: "끝까지 듣기",
    },
  ],
});

export default balanceGameEntry;
