import GameDetailClient from "@/components/GameDetailClient";
import { getGameBySlug } from "@/data/games/index";

function decodeRouteSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeRouteSlug(slug);
  const resolvedGame = getGameBySlug(decodedSlug) ?? null;

  return <GameDetailClient slug={decodedSlug} initialGame={resolvedGame} />;
}
