/**
 * Normalize list fields that can come from CMS as either string[] or { key: string }[].
 * Netlify/Decap CMS list widget with one text field saves as array of objects.
 */

export function normalizeParagraphs(
  value: unknown
): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) =>
    typeof item === 'string' ? item : (item && (item as { paragraph?: string; p?: string }).paragraph) || (item as { p?: string }).p || ''
  );
}

export function normalizeLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) =>
    typeof item === 'string' ? item : (item && (item as { line?: string }).line) || ''
  );
}
