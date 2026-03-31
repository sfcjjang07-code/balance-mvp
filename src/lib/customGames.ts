import { defineBalanceGame } from "@/data/games/defineBalanceGame";
import type { BalanceChoiceInput, BalanceGame, BalanceGameInput, ChoiceId } from "@/data/games/types";

const CUSTOM_GAMES_KEY = "balance-lab-custom-games-v2-curated";
const CUSTOM_GAMES_EVENT = "balance-lab-custom-games-updated";
const CUSTOM_VOTES_KEY = "balance-lab-custom-votes-v2-curated";

const HANGUL_CHO = [
  "g",
  "kk",
  "n",
  "d",
  "tt",
  "r",
  "m",
  "b",
  "pp",
  "s",
  "ss",
  "",
  "j",
  "jj",
  "ch",
  "k",
  "t",
  "p",
  "h",
] as const;

const HANGUL_JUNG = [
  "a",
  "ae",
  "ya",
  "yae",
  "eo",
  "e",
  "yeo",
  "ye",
  "o",
  "wa",
  "wae",
  "oe",
  "yo",
  "u",
  "wo",
  "we",
  "wi",
  "yu",
  "eu",
  "ui",
  "i",
] as const;

const HANGUL_JONG = [
  "",
  "k",
  "k",
  "ks",
  "n",
  "nj",
  "nh",
  "t",
  "l",
  "lk",
  "lm",
  "lb",
  "ls",
  "lt",
  "lp",
  "lh",
  "m",
  "p",
  "ps",
  "t",
  "t",
  "ng",
  "t",
  "t",
  "k",
  "t",
  "p",
  "h",
] as const;

export type CustomGameDraft = {
  slug?: string;
  title: string;
  category: string;
  tags: string;
  choiceA: {
    label: string;
  };
  choiceB: {
    label: string;
  };
};

type CustomVoteState = {
  counts: Record<string, number>;
  total: number;
};

type JsonObject = Record<string, unknown>;

export type JsonImportResult = {
  games: BalanceGame[];
  warnings: string[];
  totalRecords: number;
};

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

function dispatchCustomGamesUpdated() {
  if (!canUseWindow()) {
    return;
  }

  window.dispatchEvent(new CustomEvent(CUSTOM_GAMES_EVENT));
}

function normalizeTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function romanizeHangulSyllable(char: string) {
  const code = char.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) {
    return char;
  }

  const offset = code - 0xac00;
  const cho = Math.floor(offset / 588);
  const jung = Math.floor((offset % 588) / 28);
  const jong = offset % 28;

  return `${HANGUL_CHO[cho]}${HANGUL_JUNG[jung]}${HANGUL_JONG[jong]}`;
}

function romanizeKoreanText(value: string) {
  return Array.from(value)
    .map((char) => romanizeHangulSyllable(char))
    .join("");
}

export function createSlugFromText(value: string) {
  const romanized = romanizeKoreanText(value);
  const slug = romanized
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `topic-${Date.now()}`;
}

function ensureUniqueSlug(preferredSlug: string, existingGames: BalanceGame[]) {
  const normalized = createSlugFromText(preferredSlug);
  const existingSlugs = new Set(existingGames.map((game) => game.slug));

  if (!existingSlugs.has(normalized)) {
    return normalized;
  }

  let index = 2;
  let nextSlug = `${normalized}-${index}`;

  while (existingSlugs.has(nextSlug)) {
    index += 1;
    nextSlug = `${normalized}-${index}`;
  }

  return nextSlug;
}

export function readCustomGames() {
  return readJson<BalanceGame[]>(CUSTOM_GAMES_KEY, []);
}

function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeSlugForMatch(value: string) {
  return decodeSlug(value).trim();
}

export function getCustomGameBySlug(slug: string) {
  const normalizedTarget = normalizeSlugForMatch(slug);
  return readCustomGames().find((game) => normalizeSlugForMatch(game.slug) === normalizedTarget) ?? null;
}

function hasRequiredDraftFields(draft: CustomGameDraft) {
  return Boolean(
    draft.title.trim() && draft.category.trim() && draft.choiceA.label.trim() && draft.choiceB.label.trim(),
  );
}

function normalizeDraftToGameInput(draft: CustomGameDraft, existingGames: BalanceGame[]): BalanceGameInput {
  const title = draft.title.trim();

  return {
    slug: ensureUniqueSlug(draft.slug?.trim() || title, existingGames),
    title,
    category: draft.category.trim(),
    tags: normalizeTags(draft.tags),
    choices: [
      { label: draft.choiceA.label.trim() },
      { label: draft.choiceB.label.trim() },
    ],
  };
}

export function createPreviewGameFromDraft(draft: CustomGameDraft, existingGames: BalanceGame[]) {
  if (!hasRequiredDraftFields(draft)) {
    return null;
  }

  return defineBalanceGame(normalizeDraftToGameInput(draft, existingGames));
}

export function saveCustomGame(draft: CustomGameDraft, existingGames: BalanceGame[]) {
  const currentGames = readCustomGames();
  const fullExistingGames = [...existingGames, ...currentGames];
  const nextGame = defineBalanceGame(normalizeDraftToGameInput(draft, fullExistingGames));
  const nextGames = [nextGame, ...currentGames];

  writeJson(CUSTOM_GAMES_KEY, nextGames);
  dispatchCustomGamesUpdated();

  return nextGame;
}

export function deleteCustomGame(slug: string) {
  const currentGames = readCustomGames();
  const nextGames = currentGames.filter((game) => game.slug !== slug);
  const voteBuckets = readJson<Record<string, CustomVoteState>>(CUSTOM_VOTES_KEY, {});

  delete voteBuckets[slug];

  writeJson(CUSTOM_GAMES_KEY, nextGames);
  writeJson(CUSTOM_VOTES_KEY, voteBuckets);
  dispatchCustomGamesUpdated();
}

export function subscribeCustomGames(listener: () => void) {
  if (!canUseWindow()) {
    return () => undefined;
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CUSTOM_GAMES_KEY) {
      listener();
    }
  };

  window.addEventListener(CUSTOM_GAMES_EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CUSTOM_GAMES_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

function ensureCustomVoteState(slug: string) {
  const allVotes = readJson<Record<string, CustomVoteState>>(CUSTOM_VOTES_KEY, {});
  const currentState = allVotes[slug];
  if (currentState) {
    return currentState;
  }

  const initialState: CustomVoteState = { counts: { a: 0, b: 0 }, total: 0 };
  allVotes[slug] = initialState;
  writeJson(CUSTOM_VOTES_KEY, allVotes);
  return initialState;
}

function buildPercentages(counts: Record<string, number>, total: number) {
  return Object.fromEntries(
    Object.entries(counts).map(([choiceId, count]) => [
      choiceId,
      total === 0 ? 0 : Math.round((count / total) * 100),
    ]),
  );
}

export function getCustomVoteResponse(slug: string) {
  const state = ensureCustomVoteState(slug);

  return {
    counts: state.counts,
    total: state.total,
    percentages: buildPercentages(state.counts, state.total),
  };
}

export function addCustomVote(slug: string, choiceId: ChoiceId) {
  const allVotes = readJson<Record<string, CustomVoteState>>(CUSTOM_VOTES_KEY, {});
  const state = allVotes[slug] ?? ensureCustomVoteState(slug);

  if (!(choiceId in state.counts)) {
    state.counts[choiceId] = 0;
  }

  state.counts[choiceId] += 1;
  state.total += 1;
  allVotes[slug] = state;

  writeJson(CUSTOM_VOTES_KEY, allVotes);

  return {
    counts: state.counts,
    total: state.total,
    percentages: buildPercentages(state.counts, state.total),
  };
}

function toSerializableGameInput(game: BalanceGame): BalanceGameInput {
  return {
    slug: game.slug,
    title: game.title,
    category: game.category,
    tags: [...game.tags],
    choices: [
      { label: game.choices[0].label },
      { label: game.choices[1].label },
    ],
  };
}

export function createEntryJsonSnippet(game: BalanceGame) {
  return JSON.stringify(toSerializableGameInput(game), null, 2);
}

function escapeForTemplate(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function createEntryFileSnippet(game: BalanceGame) {
  return `import { defineBalanceGame } from "@/data/games/defineBalanceGame";

const balanceGameEntry = defineBalanceGame({
  slug: "${escapeForTemplate(game.slug)}",
  title: "${escapeForTemplate(game.title)}",
  category: "${escapeForTemplate(game.category)}",
  tags: [${game.tags.map((tag) => `"${escapeForTemplate(tag)}"`).join(", ")}],
  choices: [
    { label: "${escapeForTemplate(game.choices[0].label)}" },
    { label: "${escapeForTemplate(game.choices[1].label)}" },
  ],
});

export default balanceGameEntry;
`;
}

function simpleHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

export function createSafeEntryFileName(slug: string) {
  const decodedSlug = decodeSlug(slug);
  const normalized = decodedSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (normalized.length >= 3) {
    return normalized;
  }

  return `game-${simpleHash(decodedSlug)}`;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPlainString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toTagList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => toPlainString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getFirstString(record: JsonObject, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getChoiceInputFromRecord(record: JsonObject, side: "a" | "b"): BalanceChoiceInput {
  const upperSide = side === "a" ? "A" : "B";
  const nestedKeys = side === "a" ? ["choiceA", "a", "left"] : ["choiceB", "b", "right"];

  for (const nestedKey of nestedKeys) {
    const nestedValue = record[nestedKey];
    if (isJsonObject(nestedValue)) {
      return { label: getFirstString(nestedValue, ["label", "title", "name"]) };
    }
  }

  return {
    label: getFirstString(record, [
      `choice${upperSide}_label`,
      `choice${upperSide}Label`,
      `choice_${side}_label`,
      `${side}Label`,
      `${side}_label`,
      side === "a" ? "leftLabel" : "rightLabel",
    ]),
  };
}

function normalizeRecordToGameInput(record: JsonObject): BalanceGameInput | null {
  const directChoices = Array.isArray(record.choices) ? record.choices : null;

  const choiceA =
    directChoices?.[0] && isJsonObject(directChoices[0])
      ? { label: getFirstString(directChoices[0], ["label", "title", "name"]) }
      : getChoiceInputFromRecord(record, "a");
  const choiceB =
    directChoices?.[1] && isJsonObject(directChoices[1])
      ? { label: getFirstString(directChoices[1], ["label", "title", "name"]) }
      : getChoiceInputFromRecord(record, "b");

  const title = getFirstString(record, ["title", "subject", "topic", "name"]);
  const category = getFirstString(record, ["category", "genre"]);

  if (!title || !category || !choiceA.label || !choiceB.label) {
    return null;
  }

  return {
    slug: getFirstString(record, ["slug", "id"]),
    title,
    category,
    tags: toTagList(record.tags),
    choices: [choiceA, choiceB],
  };
}

function extractImportRecords(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isJsonObject(value)) {
    return [];
  }

  for (const key of ["games", "entries", "items", "topics", "data"]) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested;
    }
  }

  return [value];
}

function ensureImportSlug(preferredSlug: string, lockedSlugs: Set<string>, replaceableSlugs: Set<string>) {
  const normalized = createSlugFromText(preferredSlug);

  if (!lockedSlugs.has(normalized) || replaceableSlugs.has(normalized)) {
    return normalized;
  }

  let index = 2;
  let nextSlug = `${normalized}-${index}`;

  while (lockedSlugs.has(nextSlug) && !replaceableSlugs.has(nextSlug)) {
    index += 1;
    nextSlug = `${normalized}-${index}`;
  }

  return nextSlug;
}

export function importGamesFromJsonValue(
  value: unknown,
  options: {
    sourceLabel?: string;
    baseGames: BalanceGame[];
    savedGames: BalanceGame[];
    publishedGames: BalanceGame[];
  },
): JsonImportResult {
  const records = extractImportRecords(value);
  const warnings: string[] = [];
  const resultMap = new Map<string, BalanceGame>();
  const lockedBaseSlugs = new Set(options.baseGames.map((game) => normalizeSlugForMatch(game.slug)));
  const replaceableSlugs = new Set(
    [...options.savedGames, ...options.publishedGames].map((game) => normalizeSlugForMatch(game.slug)),
  );

  for (const [index, record] of records.entries()) {
    if (!isJsonObject(record)) {
      warnings.push(`${options.sourceLabel ?? "JSON"} ${index + 1}번 항목은 객체 형태가 아니어서 건너뛰었습니다.`);
      continue;
    }

    const input = normalizeRecordToGameInput(record);
    if (!input) {
      warnings.push(
        `${options.sourceLabel ?? "JSON"} ${index + 1}번 항목은 필수값(title/category/A/B label)이 부족해서 건너뛰었습니다.`,
      );
      continue;
    }

    const preferredSlug = input.slug?.trim() || input.title;
    const batchLockedSlugs = new Set([...lockedBaseSlugs, ...resultMap.keys()]);
    const finalSlug = ensureImportSlug(preferredSlug, batchLockedSlugs, replaceableSlugs);

    if (lockedBaseSlugs.has(createSlugFromText(preferredSlug)) && finalSlug !== createSlugFromText(preferredSlug)) {
      warnings.push(`${input.title} 항목은 기존 기본 주제 slug와 겹쳐서 ${finalSlug} 로 자동 조정했습니다.`);
    }

    if (resultMap.has(finalSlug)) {
      warnings.push(`${input.title} 항목은 같은 JSON 안의 동일 slug 항목을 덮어쓰고 마지막 값으로 반영했습니다.`);
    }

    resultMap.set(
      finalSlug,
      defineBalanceGame({
        ...input,
        slug: finalSlug,
      }),
    );
  }

  return {
    games: [...resultMap.values()],
    warnings,
    totalRecords: records.length,
  };
}

export function upsertCustomGames(games: BalanceGame[]) {
  if (games.length === 0) {
    return readCustomGames();
  }

  const currentGames = readCustomGames();
  const incomingSlugSet = new Set(games.map((game) => normalizeSlugForMatch(game.slug)));
  const filteredGames = currentGames.filter((game) => !incomingSlugSet.has(normalizeSlugForMatch(game.slug)));
  const nextGames = [...games, ...filteredGames];

  writeJson(CUSTOM_GAMES_KEY, nextGames);
  dispatchCustomGamesUpdated();

  return nextGames;
}

function createEntryIdentifier(fileName: string) {
  const normalized = fileName
    .split("-")
    .filter(Boolean)
    .map((segment, index) =>
      index === 0
        ? segment.replace(/^[^a-zA-Z]+/, "") || "entry"
        : segment.charAt(0).toUpperCase() + segment.slice(1),
    )
    .join("");

  const safeIdentifier = normalized.replace(/[^a-zA-Z0-9]/g, "");
  const startsWithNumber = /^\d/.test(safeIdentifier);
  const baseName = safeIdentifier || "generatedEntry";

  return `${startsWithNumber ? "game" : ""}${baseName}Entry`;
}

export function createIndexSnippet(games: BalanceGame[]) {
  const usedIdentifiers = new Set<string>();
  const lines = games.map((game) => {
    const fileName = createSafeEntryFileName(game.slug);
    let identifier = createEntryIdentifier(fileName);

    if (usedIdentifiers.has(identifier)) {
      let index = 2;
      while (usedIdentifiers.has(`${identifier}${index}`)) {
        index += 1;
      }
      identifier = `${identifier}${index}`;
    }

    usedIdentifiers.add(identifier);

    return {
      fileName,
      identifier,
      title: game.title,
    };
  });

  const importLines = lines
    .map(({ fileName, identifier, title }) => `import ${identifier} from "./entries/${fileName}"; // ${title}`)
    .join("\n");

  const gameArrayLines = lines.map(({ identifier }) => `  ${identifier},`).join("\n");

  return [
    "// 1) 아래 import 문을 src/data/games/index.ts 상단 import 영역에 추가",
    importLines || "// 추가할 커스텀 주제가 아직 없습니다.",
    "",
    "// 2) 아래 항목들을 games 배열 안에 원하는 위치에 추가",
    gameArrayLines || "// 추가할 커스텀 주제가 아직 없습니다.",
  ].join("\n");
}
