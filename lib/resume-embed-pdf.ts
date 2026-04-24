import { normalizeResumeData } from "@/lib/resume-normalizer";
import { makeParsedField, ResumeImportReport, summarizeLowConfidence } from "@/lib/resume-confidence";
import { ResumeData } from "@/types/resume";

/** 每行前缀，与 PDF 文本流一同可被 pdf.js 抽取出 */
export const EMBED_LINE_PREFIX = "AIB1|";

const MARK_START = "%%AI_RESUME_V1%%";
const MARK_END = "%%/AI_RESUME_V1%%";

function toBase64Utf8Json(data: ResumeData) {
  const text = JSON.stringify(data);
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64Utf8Json(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/**
 * 将简历 JSON 编码为可写入 PDF 文本层的行（便于 pdf.js 原样抽回并拼接 base64）
 */
export function buildEmbeddedResumeTextLines(data: ResumeData) {
  const b64 = toBase64Utf8Json(data);
  /* 每行 AIB1| + base64 需在 A4 行宽内，避免 jspdf 重排为两段文本 */
  const chunk = 64;
  const lines: string[] = [MARK_START];
  for (let i = 0; i < b64.length; i += chunk) {
    lines.push(`${EMBED_LINE_PREFIX}${b64.slice(i, i + chunk)}`);
  }
  lines.push(MARK_END);
  return lines;
}

/**
 * 从整份 PDF 抽取的纯文本中尝试恢复简历（由本应用导出的「可回导」PDF）
 */
export function tryDecodeEmbeddedResumeText(fullText: string): ResumeData | null {
  if (!fullText.includes(MARK_START) || !fullText.includes(MARK_END)) {
    return null;
  }
  const between = fullText.split(MARK_START)[1];
  if (!between) return null;
  const core = between.split(MARK_END)[0];
  if (!core) return null;

  const b64 = core
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith(EMBED_LINE_PREFIX))
    .map((line) => line.slice(EMBED_LINE_PREFIX.length))
    .join("");

  if (b64.length < 8) return null;
  try {
    const json = fromBase64Utf8Json(b64);
    return normalizeResumeData(JSON.parse(json));
  } catch {
    return null;
  }
}

export function buildEmbeddedImportReport(data: ResumeData): ResumeImportReport {
  return {
    name: makeParsedField(data.basics.name, 1),
    phone: makeParsedField(data.basics.phone, 1),
    email: makeParsedField(data.basics.email, 1),
    educationCount: makeParsedField(data.education.length, 1),
    projectsCount: makeParsedField(data.projects.length, 1),
    experienceCount: makeParsedField(data.experience.length, 1),
    lowConfidenceFields: summarizeLowConfidence([
      { label: "姓名", confidence: 1, hasValue: Boolean(data.basics.name) },
      { label: "电话", confidence: 1, hasValue: Boolean(data.basics.phone) },
      { label: "邮箱", confidence: 1, hasValue: Boolean(data.basics.email) },
      { label: "教育经历", confidence: 1, hasValue: data.education.length > 0 },
      { label: "项目经历", confidence: 1, hasValue: data.projects.length > 0 },
      { label: "实习/工作经历", confidence: 1, hasValue: data.experience.length > 0 }
    ])
  };
}
