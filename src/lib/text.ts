// Joins the last two words with a non-breaking space so a heading never ends on a one-word line.
// `maxGlued` skips it when the two words together are longer: on a 360 px phone they would not fit on one line.
export function noOrphan(text: string, maxGlued = Infinity) {
  const trimmed = text.trimEnd();
  const i = trimmed.lastIndexOf(" ");
  if (i === -1 || trimmed.length - trimmed.lastIndexOf(" ", i - 1) - 1 > maxGlued) return text;
  return `${text.slice(0, i)} ${text.slice(i + 1)}`;
}
