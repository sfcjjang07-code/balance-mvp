import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "picnic-date-vs-museum-date",
  title: "피크닉 데이트 vs 미술관 데이트",
  category: "데이트",
  tags: ["데이트", "주말", "나들이"],
  choices: [
    {
      label: "피크닉 데이트",
    },
    {
      label: "미술관 데이트",
    },
  ],
});

export default balanceGameEntry;
