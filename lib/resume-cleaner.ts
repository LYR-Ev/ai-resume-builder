const TIME_RANGE_PATTERNS: Array<[RegExp, string]> = [
  [/(\d{4})[./年\-](\d{1,2})\s*[~\-—至]+\s*(\d{4})[./年\-](\d{1,2})/g, "$1.$2-$3.$4"],
  [/(\d{4})\s*[~\-—至]+\s*(\d{4})/g, "$1.01-$2.12"],
  [/(\d{4})[./年](\d{1,2})/g, "$1.$2"]
];

function normalizePunctuation(text: string) {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[：]/g, ":")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .replace(/[，]/g, ",")
    .replace(/[；]/g, ";")
    .replace(/[。]/g, ".");
}

function normalizeTime(text: string) {
  return TIME_RANGE_PATTERNS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text)
    .replace(/(\d{4})\.(\d)(?!\d)/g, "$1.0$2")
    .replace(/(\d{4})\.(\d{2})-(\d{4})\.(\d)(?!\d)/g, "$1.$2-$3.0$4");
}

function mergeBrokenLines(lines: string[]) {
  const merged: string[] = [];
  for (const line of lines) {
    const current = line.trim();
    if (!current) continue;
    const prev = merged[merged.length - 1];
    const shouldMerge =
      Boolean(prev) &&
      prev.length <= 20 &&
      !/[。.;:!)]$/.test(prev) &&
      !/^[\-\d•*]/.test(current) &&
      !/^[A-Z\u4e00-\u9fa5]{2,20}$/.test(current);

    if (shouldMerge) {
      merged[merged.length - 1] = `${prev} ${current}`;
    } else {
      merged.push(current);
    }
  }
  return merged;
}

export function cleanResumeText(text: string): string {
  if (!text || !text.trim()) return "";

  const normalized = normalizeTime(normalizePunctuation(text))
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = normalized
    .split("\n")
    .map((line) => line.replace(/\s{2,}/g, " ").trim());

  return mergeBrokenLines(lines).join("\n").trim();
}
