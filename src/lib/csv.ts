// Excel and LibreOffice run a cell that starts with = + - @ (or a tab / carriage return before one) as a formula.
// A leading apostrophe makes it plain text; it is how Excel itself marks a typed-in text value.
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\n;\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** UTF-8 with a BOM so Excel reads the diacritics; ";" for Romanian Excel, which opens comma files as one column. */
export function csvResponse(columns: string[], rows: unknown[][], filename: string, separator: "," | ";") {
  const body = "﻿" + [columns.join(separator), ...rows.map((row) => row.map(csvCell).join(separator))].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
