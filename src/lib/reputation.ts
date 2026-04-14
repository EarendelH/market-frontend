/** Backend stores reputation as 0–100; display as 0–5.0 for UI copy like「信誉分 4.6」 */
export function reputationToFiveScale(score: number | null | undefined): string {
  const n = Number(score);
  if (Number.isNaN(n)) return "—";
  return (Math.min(100, Math.max(0, n)) / 20).toFixed(1);
}
