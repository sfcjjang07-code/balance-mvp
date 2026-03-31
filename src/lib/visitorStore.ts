import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getKstDateKey } from "@/lib/kstDate";

type VisitorStore = {
  total: number;
  dailyCounts: Record<string, number>;
};

function toFiniteNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeDailyCounts(value: unknown) {
  if (!value || typeof value !== "object") {
    return {} as Record<string, number>;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, count]) => [key, toFiniteNumber(count)]),
  );
}

const VISITOR_FILE_PATH = path.join(process.cwd(), "data", "runtime", "visitor-stats.json");

const defaultStore: VisitorStore = {
  total: 0,
  dailyCounts: {},
};

let writeQueue: Promise<VisitorStore> = Promise.resolve(defaultStore);

async function ensureDirectory() {
  await mkdir(path.dirname(VISITOR_FILE_PATH), { recursive: true });
}

async function readStore() {
  try {
    const raw = await readFile(VISITOR_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as VisitorStore;

    return {
      total: toFiniteNumber(parsed.total),
      dailyCounts: normalizeDailyCounts(parsed.dailyCounts),
    };
  } catch {
    return { ...defaultStore, dailyCounts: {} };
  }
}

async function writeStore(store: VisitorStore) {
  await ensureDirectory();
  await writeFile(VISITOR_FILE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function toStats(store: VisitorStore) {
  const todayKey = getKstDateKey();

  return {
    today: toFiniteNumber(store.dailyCounts[todayKey]),
    total: toFiniteNumber(store.total),
    date: todayKey,
    mode: "file" as const,
  };
}

export async function getVisitorStats() {
  const store = await readStore();
  return toStats(store);
}

export async function registerVisitor() {
  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    const todayKey = getKstDateKey();

    store.total += 1;
    store.dailyCounts[todayKey] = (store.dailyCounts[todayKey] ?? 0) + 1;

    await writeStore(store);
    return store;
  });

  const updatedStore = await writeQueue;
  return toStats(updatedStore);
}
