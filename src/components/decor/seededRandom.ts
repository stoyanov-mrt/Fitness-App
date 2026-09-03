// Deterministic PRNG (mulberry32) so decorative dot fields render the same
// pattern every time instead of reshuffling on each re-render/screen visit.
export function seededRandom(seed: number) {
  let state = seed | 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
