import type { BalanceGame, ChoiceId } from "@/data/games/types";

import type { TopicStatBucket, TopicStatsMap } from "@/lib/db/types";

const TOPIC_STATS_UPDATED_EVENT = "balance-lab-topic-stats-updated";
const TOPIC_STATS_STORAGE_KEY = "balance-lab-topic-stats-cache-v1";

let topicStatsCache: TopicStatsMap = {};
let hasHydratedFromStorage = false;

function canUseWindow() {
  return typeof window !== "undefined";
}

function toSafeNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function sanitizeBucket(value: unknown): TopicStatBucket {
  if (!value || typeof value !== "object") {
    return { views: 0, votes: 0, updatedAt: 0 };
  }

  const record = value as Record<string, unknown>;
  return {
    views: toSafeNumber(record.views),
    votes: toSafeNumber(record.votes),
    updatedAt: toSafeNumber(record.updatedAt),
  };
}

function mergeBucket(base: TopicStatBucket | undefined, incoming: TopicStatBucket | undefined): TopicStatBucket {
  const left = sanitizeBucket(base);
  const right = sanitizeBucket(incoming);

  return {
    views: Math.max(left.views, right.views),
    votes: Math.max(left.votes, right.votes),
    updatedAt: Math.max(left.updatedAt, right.updatedAt),
  };
}

function mergeTopicStatsMaps(base: TopicStatsMap, incoming: TopicStatsMap) {
  const keys = new Set([...Object.keys(base), ...Object.keys(incoming)]);
  const nextMap: TopicStatsMap = {};

  keys.forEach((rawKey) => {
    const key = normalizeSlug(rawKey);
    nextMap[key] = mergeBucket(base[key], incoming[key]);
  });

  return nextMap;
}

function readTopicStatsStorage(): TopicStatsMap {
  if (!canUseWindow()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(TOPIC_STATS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([slug, bucket]) => [normalizeSlug(slug), sanitizeBucket(bucket)]),
    );
  } catch {
    return {};
  }
}

function writeTopicStatsStorage(nextMap: TopicStatsMap) {
  if (!canUseWindow()) {
    return;
  }

  try {
    window.localStorage.setItem(TOPIC_STATS_STORAGE_KEY, JSON.stringify(nextMap));
  } catch {
    // ignore storage write errors
  }
}

function hydrateTopicStatsCache() {
  if (!canUseWindow() || hasHydratedFromStorage) {
    return;
  }

  hasHydratedFromStorage = true;
  topicStatsCache = mergeTopicStatsMaps(topicStatsCache, readTopicStatsStorage());
}

function dispatchTopicStatsUpdated(detail: TopicStatsMap) {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(TOPIC_STATS_UPDATED_EVENT, { detail }));
}

function setTopicStatsCache(nextMap: TopicStatsMap) {
  topicStatsCache = nextMap;
  writeTopicStatsStorage(topicStatsCache);
  dispatchTopicStatsUpdated(topicStatsCache);
}

function setTopicStatBucket(slug: string, bucket: TopicStatBucket) {
  hydrateTopicStatsCache();
  const normalizedSlug = normalizeSlug(slug);

  setTopicStatsCache({
    ...topicStatsCache,
    [normalizedSlug]: mergeBucket(topicStatsCache[normalizedSlug], bucket),
  });
}

export type { TopicStatsMap };
export const TOPIC_STATS_EVENT = TOPIC_STATS_UPDATED_EVENT;

export function getTopicStatsMap(): TopicStatsMap {
  hydrateTopicStatsCache();
  return topicStatsCache;
}

export async function refreshTopicStatsMap() {
  hydrateTopicStatsCache();

  if (!canUseWindow()) {
    return topicStatsCache;
  }

  try {
    const response = await fetch("/api/topic-stats", {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("topic-stats-request-failed");
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const serverMap = Object.fromEntries(
      Object.entries(payload).map(([slug, bucket]) => [normalizeSlug(slug), sanitizeBucket(bucket)]),
    );

    const nextMap = mergeTopicStatsMaps(topicStatsCache, serverMap);
    setTopicStatsCache(nextMap);
    return nextMap;
  } catch {
    return topicStatsCache;
  }
}

async function trackTopicMetric(slug: string, action: "view") {
  if (!canUseWindow()) {
    return null;
  }

  hydrateTopicStatsCache();
  const normalizedSlug = normalizeSlug(slug);
  const current = sanitizeBucket(topicStatsCache[normalizedSlug]);
  setTopicStatBucket(normalizedSlug, {
    ...current,
    views: current.views + 1,
    updatedAt: Date.now(),
  });

  try {
    const response = await fetch("/api/topic-stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ slug: normalizedSlug, action }),
    });

    if (!response.ok) {
      throw new Error("topic-stats-track-failed");
    }

    const payload = (await response.json()) as { slug: string; bucket: TopicStatBucket };
    const nextBucket = sanitizeBucket(payload.bucket);
    setTopicStatBucket(normalizeSlug(payload.slug), nextBucket);
    return nextBucket;
  } catch {
    return topicStatsCache[normalizedSlug] ?? null;
  }
}

export async function recordTopicView(slug: string) {
  return trackTopicMetric(slug, "view");
}

export async function recordTopicVote(slug: string, _choiceId?: ChoiceId) {
  hydrateTopicStatsCache();
  const normalizedSlug = normalizeSlug(slug);
  const current = sanitizeBucket(topicStatsCache[normalizedSlug]);
  setTopicStatBucket(normalizedSlug, {
    ...current,
    votes: current.votes + 1,
    updatedAt: Date.now(),
  });

  return refreshTopicStatsMap();
}

export function subscribeTopicStats(listener: (nextMap: TopicStatsMap) => void) {
  if (!canUseWindow()) {
    return () => undefined;
  }

  hydrateTopicStatsCache();

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<TopicStatsMap>;
    listener(customEvent.detail ?? topicStatsCache);
  };

  window.addEventListener(TOPIC_STATS_UPDATED_EVENT, handleCustomEvent as EventListener);

  return () => {
    window.removeEventListener(TOPIC_STATS_UPDATED_EVENT, handleCustomEvent as EventListener);
  };
}

export function getTopGameByMetric(
  games: BalanceGame[],
  statsMap: TopicStatsMap,
  metric: "views" | "votes",
): { game: BalanceGame; count: number } | null {
  let winner: BalanceGame | null = null;
  let topCount = 0;

  for (const game of games) {
    const bucket = statsMap[normalizeSlug(game.slug)];
    const count = metric === "views" ? bucket?.views ?? 0 : bucket?.votes ?? 0;

    if (count > topCount) {
      winner = game;
      topCount = count;
      continue;
    }

    if (count === topCount && count > 0 && winner) {
      if (game.title.localeCompare(winner.title, "ko") < 0) {
        winner = game;
      }
    }
  }

  if (!winner || topCount <= 0) {
    return null;
  }

  return { game: winner, count: topCount };
}
