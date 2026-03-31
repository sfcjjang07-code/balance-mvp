import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ChoiceId } from "@/data/games/types";
import type { TopicStatBucket, TopicStatsMap, VoteResponse } from "@/lib/db/types";

type FileTopicBucket = {
  views: number;
  votes: number;
  choiceA: number;
  choiceB: number;
  updatedAt: number;
};

type FileTopicStore = Record<string, FileTopicBucket>;

const TOPIC_STATS_FILE_PATH = path.join(process.cwd(), "data", "runtime", "topic-stats.json");

function toFiniteNumber(value: unknown) {
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

function normalizeBucket(value: unknown): FileTopicBucket {
  if (!value || typeof value !== "object") {
    return { views: 0, votes: 0, choiceA: 0, choiceB: 0, updatedAt: 0 };
  }

  const row = value as Record<string, unknown>;
  return {
    views: toFiniteNumber(row.views),
    votes: toFiniteNumber(row.votes),
    choiceA: toFiniteNumber(row.choiceA),
    choiceB: toFiniteNumber(row.choiceB),
    updatedAt: toFiniteNumber(row.updatedAt),
  };
}

async function ensureDirectory() {
  await mkdir(path.dirname(TOPIC_STATS_FILE_PATH), { recursive: true });
}

async function readStore(): Promise<FileTopicStore> {
  try {
    const raw = await readFile(TOPIC_STATS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([slug, bucket]) => [normalizeSlug(slug), normalizeBucket(bucket)]),
    );
  } catch {
    return {};
  }
}

async function writeStore(store: FileTopicStore) {
  await ensureDirectory();
  await writeFile(TOPIC_STATS_FILE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function buildVoteResponse(bucket: FileTopicBucket): VoteResponse {
  const counts = { a: bucket.choiceA, b: bucket.choiceB };
  const total = bucket.choiceA + bucket.choiceB;
  const percentages = {
    a: total === 0 ? 0 : Math.round((bucket.choiceA / total) * 100),
    b: total === 0 ? 0 : Math.round((bucket.choiceB / total) * 100),
  };

  return { counts, total, percentages };
}

function toMapBucket(bucket: FileTopicBucket): TopicStatBucket {
  return {
    views: bucket.views,
    votes: bucket.votes,
    updatedAt: bucket.updatedAt,
  };
}

let writeQueue: Promise<FileTopicStore> = Promise.resolve({});

export async function getFileTopicStatsMap(): Promise<TopicStatsMap> {
  const store = await readStore();
  return Object.fromEntries(Object.entries(store).map(([slug, bucket]) => [slug, toMapBucket(bucket)]));
}

export async function getFileVoteResponse(slug: string): Promise<VoteResponse> {
  const store = await readStore();
  const bucket = store[normalizeSlug(slug)] ?? { views: 0, votes: 0, choiceA: 0, choiceB: 0, updatedAt: 0 };
  return buildVoteResponse(bucket);
}

export async function recordFileTopicView(slug: string) {
  const normalizedSlug = normalizeSlug(slug);

  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    const bucket = store[normalizedSlug] ?? { views: 0, votes: 0, choiceA: 0, choiceB: 0, updatedAt: 0 };
    store[normalizedSlug] = { ...bucket, views: bucket.views + 1, updatedAt: Date.now() };
    await writeStore(store);
    return store;
  });

  const updatedStore = await writeQueue;
  return toMapBucket(updatedStore[normalizedSlug]);
}

export async function recordFileTopicVote(slug: string, choiceId: ChoiceId) {
  const normalizedSlug = normalizeSlug(slug);

  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    const bucket = store[normalizedSlug] ?? { views: 0, votes: 0, choiceA: 0, choiceB: 0, updatedAt: 0 };
    store[normalizedSlug] = {
      ...bucket,
      votes: bucket.votes + 1,
      choiceA: bucket.choiceA + (choiceId === "a" ? 1 : 0),
      choiceB: bucket.choiceB + (choiceId === "b" ? 1 : 0),
      updatedAt: Date.now(),
    };
    await writeStore(store);
    return store;
  });

  const updatedStore = await writeQueue;
  return buildVoteResponse(updatedStore[normalizedSlug]);
}
