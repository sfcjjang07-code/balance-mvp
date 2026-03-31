import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "wood-tone-room-vs-white-room",
  title: "우드톤 방 vs 화이트톤 방",
  category: "공간",
  tags: ["인테리어", "공간", "취향"],
  choices: [
    {
      label: "우드톤 방",
    },
    {
      label: "화이트톤 방",
    },
  ],
});

export default balanceGameEntry;
