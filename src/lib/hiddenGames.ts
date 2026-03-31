const HIDDEN_GAMES_KEY = "balance-lab-hidden-games-v1";
const HIDDEN_GAMES_EVENT = "balance-lab-hidden-games-updated";

function canUseWindow() {
  return typeof window !== "undefined";
}

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
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

function dispatchHiddenGamesUpdated() {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(HIDDEN_GAMES_EVENT));
}

export function readHiddenGameSlugs() {
  return readJson<string[]>(HIDDEN_GAMES_KEY, []).map(normalizeSlug);
}

export function isGameHidden(slug: string) {
  return readHiddenGameSlugs().includes(normalizeSlug(slug));
}

export function hideGameSlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const currentHidden = readHiddenGameSlugs();

  if (currentHidden.includes(normalizedSlug)) {
    return currentHidden;
  }

  const nextHidden = [normalizedSlug, ...currentHidden];
  writeJson(HIDDEN_GAMES_KEY, nextHidden);
  dispatchHiddenGamesUpdated();
  return nextHidden;
}

export function showGameSlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const currentHidden = readHiddenGameSlugs();
  const nextHidden = currentHidden.filter((item) => item !== normalizedSlug);

  if (nextHidden.length === currentHidden.length) {
    return currentHidden;
  }

  writeJson(HIDDEN_GAMES_KEY, nextHidden);
  dispatchHiddenGamesUpdated();
  return nextHidden;
}

export function filterVisibleGames<T extends { slug: string }>(games: T[]) {
  const hiddenSlugSet = new Set(readHiddenGameSlugs());
  return games.filter((game) => !hiddenSlugSet.has(normalizeSlug(game.slug)));
}

export function subscribeHiddenGames(listener: () => void) {
  if (!canUseWindow()) {
    return () => undefined;
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HIDDEN_GAMES_KEY) {
      listener();
    }
  };

  window.addEventListener(HIDDEN_GAMES_EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(HIDDEN_GAMES_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
