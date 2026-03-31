import type { BalanceGame } from "@/data/games/types";
import { readCustomGames } from "@/lib/customGames";
import { showGameSlug } from "@/lib/hiddenGames";

const PUBLISHED_GAMES_KEY = "balance-lab-published-games-v2-curated";
const PUBLISHED_GAMES_EVENT = "balance-lab-published-games-updated";

function canUseWindow() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseWindow()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function dispatchPublishedGamesUpdated() {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(PUBLISHED_GAMES_EVENT));
}

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

export function readPublishedGames() {
  return readJson<BalanceGame[]>(PUBLISHED_GAMES_KEY, []);
}

export function getPublishedGameBySlug(slug: string) {
  const normalizedTarget = normalizeSlug(slug);
  return readPublishedGames().find((game) => normalizeSlug(game.slug) === normalizedTarget) ?? null;
}

export function publishGame(game: BalanceGame) {
  const currentGames = readPublishedGames();
  const normalizedSlug = normalizeSlug(game.slug);
  const filteredGames = currentGames.filter((item) => normalizeSlug(item.slug) !== normalizedSlug);
  const nextGames = [game, ...filteredGames];

  showGameSlug(game.slug);
  writeJson(PUBLISHED_GAMES_KEY, nextGames);
  dispatchPublishedGamesUpdated();

  return game;
}

export function publishGames(games: BalanceGame[]) {
  if (games.length === 0) {
    return readPublishedGames();
  }

  const currentGames = readPublishedGames();
  const incomingSlugSet = new Set(games.map((game) => normalizeSlug(game.slug)));
  const filteredGames = currentGames.filter((game) => !incomingSlugSet.has(normalizeSlug(game.slug)));
  const nextGames = [...games, ...filteredGames];

  games.forEach((game) => showGameSlug(game.slug));
  writeJson(PUBLISHED_GAMES_KEY, nextGames);
  dispatchPublishedGamesUpdated();

  return nextGames;
}

export function unpublishGame(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const currentGames = readPublishedGames();
  const nextGames = currentGames.filter((game) => normalizeSlug(game.slug) !== normalizedSlug);

  if (nextGames.length === currentGames.length) {
    return currentGames;
  }

  writeJson(PUBLISHED_GAMES_KEY, nextGames);
  dispatchPublishedGamesUpdated();
  return nextGames;
}

export function syncCustomGamesIntoPublished() {
  const currentPublishedGames = readPublishedGames();
  const publishedSlugSet = new Set(currentPublishedGames.map((game) => normalizeSlug(game.slug)));
  const customGames = readCustomGames();
  const missingCustomGames = customGames.filter((game) => !publishedSlugSet.has(normalizeSlug(game.slug)));

  if (missingCustomGames.length === 0) {
    return currentPublishedGames;
  }

  const nextGames = [...missingCustomGames, ...currentPublishedGames];
  missingCustomGames.forEach((game) => showGameSlug(game.slug));
  writeJson(PUBLISHED_GAMES_KEY, nextGames);
  dispatchPublishedGamesUpdated();

  return nextGames;
}

export function subscribePublishedGames(listener: () => void) {
  if (!canUseWindow()) {
    return () => undefined;
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PUBLISHED_GAMES_KEY) {
      listener();
    }
  };

  window.addEventListener(PUBLISHED_GAMES_EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(PUBLISHED_GAMES_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
