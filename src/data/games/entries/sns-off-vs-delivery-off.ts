import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "sns-off-vs-delivery-off",
  title: "한 달 SNS 끊기 vs 한 달 배달앱 끊기",
  category: "습관",
  tags: ["습관", "디지털", "절제"],
  choices: [
    {
      label: "SNS 끊기",
    },
    {
      label: "배달앱 끊기",
    },
  ],
});

export default balanceGameEntry;
