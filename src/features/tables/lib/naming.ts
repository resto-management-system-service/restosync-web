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

/**
 * Parse a zone name into its `{text} {number}` parts. A trailing
 * whitespace + integer is treated as the category number; names that don't
 * match (e.g. "VIP", "Piso", "Terraza Sur") are a single category with no
 * number.
 */
function parseZoneName(name: string): { text: string; number: number | null } {
  const match = name.trim().match(/^(.*?)\s+(\d+)$/);
  if (match) {
    return { text: match[1].trim(), number: parseInt(match[2], 10) };
  }
  return { text: name.trim(), number: null };
}

/**
 * Compute the final zone name for a category, appending the next sequential
 * number for that category (case-insensitive text match). Used to preview and
 * auto-number new zones like "Piso 3" when "Piso 1"/"Piso 2" already exist,
 * or "Terraza 1" for a never-used name. Returns the empty string for blank
 * input.
 */
export function computeNextZoneName(existingZoneNames: string[], typedText: string): string {
  const typed = typedText.trim();
  if (!typed) return '';

  const typedKey = typed.toLowerCase();
  let max = 0;
  for (const name of existingZoneNames) {
    const parsed = parseZoneName(name);
    if (parsed.text.toLowerCase() === typedKey && parsed.number !== null) {
      max = Math.max(max, parsed.number);
    }
  }

  return `${typed} ${max + 1}`;
}
