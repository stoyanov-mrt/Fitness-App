/**
 * Minimal RFC 4180-ish CSV serializer: quotes a field only when it contains
 * a comma, quote, or newline, doubling any embedded quotes. Good enough for
 * a data-export feature — not a general-purpose CSV parser/writer.
 */
function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const headerLine = columns.map((c) => escapeCsvField(c.header)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvField(row[c.key])).join(","));
  return [headerLine, ...lines].join("\r\n");
}
