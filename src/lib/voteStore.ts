type VoteCounts = Record<string, number>;

type StoredVoteState = {
  counts: VoteCounts;
  total: number;
};

const voteStore = new Map<string, StoredVoteState>();

function ensureGame(slug: string): StoredVoteState {
  const stored = voteStore.get(slug);
  if (stored) return stored;
  const initialState: StoredVoteState = { counts: { a: 0, b: 0 }, total: 0 };
  voteStore.set(slug, initialState);
  return initialState;
}

export function getVoteState(slug: string) {
  return ensureGame(slug);
}

export function addVote(slug: string, choiceId: string) {
  const state = ensureGame(slug);
  if (!(choiceId in state.counts)) state.counts[choiceId] = 0;
  state.counts[choiceId] += 1;
  state.total += 1;
  return state;
}
