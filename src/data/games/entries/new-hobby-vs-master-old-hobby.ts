import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "new-hobby-vs-master-old-hobby",
  title: "새 취미 넓게 배우기 vs 한 취미 깊게 파기",
  category: "취미",
  tags: ["취미", "성향", "성장"],
  choices: [
    {
      label: "새 취미 넓게 배우기",
    },
    {
      label: "한 취미 깊게 파기",
    },
  ],
});

export default balanceGameEntry;
