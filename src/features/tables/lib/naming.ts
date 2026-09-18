// ============================================================
// Naming Helpers — client-side suggestions for zones/tables
// ============================================================

/**
 * Suggest the next zone `code`: the smallest positive integer not already used
 * as a numeric zone code. Reuses gaps left by deleted zones (e.g. zones with
 * codes "1" and "3" suggest "2"). Non-numeric codes ("T", "VIP") are ignored.
 */
export function suggestNextZoneCode(zones: { code?: string | null }[]): string {
  const used = new Set<number>();
  for (const zone of zones) {
    if (!zone.code || !/^\d+$/.test(zone.code)) continue;
    used.add(parseInt(zone.code, 10));
  }

  let next = 1;
  while (used.has(next)) next += 1;
  return String(next);
}
