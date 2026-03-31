import type { BalanceGame } from "@/data/games/types";

export function mergeGamesBySlug(...gameLists: BalanceGame[][]) {
  const seen = new Set<string>();
  const merged: BalanceGame[] = [];

  for (const list of gameLists) {
    for (const game of list) {
      if (seen.has(game.slug)) {
        continue;
      }

      seen.add(game.slug);
      merged.push(game);
    }
  }

  return merged;
}
