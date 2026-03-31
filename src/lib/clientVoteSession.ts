import type { ChoiceId } from "@/data/games/types";
import { getKstDateKey } from "@/lib/kstDate";

const DAILY_VOTE_PREFIX = "balance-lab-daily-vote-v1";
export const DAILY_VOTE_UPDATED_EVENT = "balance-lab:daily-vote-updated";

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

function getDailyVoteKey(slug: string) {
  return `${DAILY_VOTE_PREFIX}:${getKstDateKey()}:${normalizeSlug(slug)}`;
}

function dispatchVoteUpdated(slug: string, choiceId: ChoiceId) {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(DAILY_VOTE_UPDATED_EVENT, {
      detail: {
        slug: normalizeSlug(slug),
        choiceId,
        date: getKstDateKey(),
      },
    }),
  );
}

export function getTodayVoteChoice(slug: string): ChoiceId | null {
  if (!canUseWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(getDailyVoteKey(slug));
  return raw === "a" || raw === "b" ? raw : null;
}

export function setTodayVoteChoice(slug: string, choiceId: ChoiceId) {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(getDailyVoteKey(slug), choiceId);
  dispatchVoteUpdated(slug, choiceId);
}

export function hasVotedToday(slug: string) {
  return getTodayVoteChoice(slug) !== null;
}

export function getTodayVotedSlugs() {
  if (!canUseWindow()) {
    return [] as string[];
  }

  const prefix = `${DAILY_VOTE_PREFIX}:${getKstDateKey()}:`;
  const slugs: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key || !key.startsWith(prefix)) {
      continue;
    }

    const value = window.localStorage.getItem(key);
    if (value !== "a" && value !== "b") {
      continue;
    }

    slugs.push(normalizeSlug(key.slice(prefix.length)));
  }

  return Array.from(new Set(slugs));
}
