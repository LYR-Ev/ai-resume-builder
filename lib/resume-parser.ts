import { v4 as uuid } from "uuid";
import { cleanResumeText } from "@/lib/resume-cleaner";
import { makeParsedField, ResumeImportReport, summarizeLowConfidence } from "@/lib/resume-confidence";
import { normalizeResumeData } from "@/lib/resume-normalizer";
import { ResumeSectionBlock, splitResumeIntoSections } from "@/lib/resume-section-splitter";
import { ResumeData } from "@/types/resume";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+?86[-\s]?)?(1[3-9]\d{9})/;
const URL_RE = /https?:\/\/[^\s)]+/gi;
const DATE_RANGE_RE = /(\d{4}\.\d{2}|\d{4})\s*[-~至—]\s*(\d{4}\.\d{2}|\d{4}|至今|present)/i;

export interface ParsedResumeDraft {
  resume: ResumeData;
  report: ResumeImportReport;
}

function splitByBullets(lines: string[]) {
  return lines
    .join("\n")
    .split(/\n(?=[-*•]|\d+\.)/)
    .map((chunk) => chunk.replace(/^[-*•]|\d+\./, "").trim())
    .filter(Boolean);
}

function splitItemBlocks(lines: string[]) {
  const blocks: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    const isBoundary = DATE_RANGE_RE.test(line) || /^[-*•]\s*/.test(line);
    if (isBoundary && current.length) {
      blocks.push(current.join(" "));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length) blocks.push(current.join(" "));
  return blocks.filter(Boolean);
}

function parseBasicsSection(sectionText: string, topText: string) {
  const text = `${topText}\n${sectionText}`.trim();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const email = text.match(EMAIL_RE)?.[0] ?? "";
  const phone = text.match(PHONE_RE)?.[0] ?? "";
  const urls = text.match(URL_RE) ?? [];
  const github = urls.find((url) => /github\.com/i.test(url)) ?? "";
  const website = urls.find((url) => !/github\.com/i.test(url)) ?? "";
  const location = lines.find((line) => /(所在地|城市|现居|location)/i.test(line))?.split(/[:：]/).slice(1).join(":").trim() ?? "";
  const targetRole = lines
    .find((line) => /(求职意向|目标岗位|应聘岗位|objective|target role)/i.test(line))
    ?.split(/[:：]/)
    .slice(1)
    .join(":")
    .trim() ?? "";
  const name =
    lines.find(
      (line) =>
        line.length >= 2 &&
        line.length <= 18 &&
        !/@|github|https?:\/\/|电话|邮箱|求职|目标岗位|location|所在地|城市/i.test(line)
    ) ?? "";

  return {
    basics: {
      name,
      phone,
      email,
      targetRole,
      location,
      github,
      website,
      photoDataUrl: "",
      photoFileName: "",
      photoMimeType: ""
    },
    confidence: {
      name: makeParsedField(name, name ? 0.55 : 0.2),
      phone: makeParsedField(phone, phone ? 0.95 : 0.2),
      email: makeParsedField(email, email ? 0.98 : 0.2)
    }
  };
}

function parseEducationSection(blocks: ResumeSectionBlock[]) {
  const items = blocks.flatMap((block) =>
    splitItemBlocks(block.lines).map((text) => {
      const dateRange = text.match(DATE_RANGE_RE);
      const major = text.match(/(专业|major)[:：]?\s*([^\s,;]+)/i)?.[2] ?? "";
      const degree = text.match(/(本科|硕士|博士|大专|学士|master|phd|bachelor)/i)?.[0] ?? "";
      const gpa = text.match(/(gpa|绩点|排名)[:：]?\s*([^\s,;]+)/i)?.[0] ?? "";
      return {
        id: uuid(),
        title: text.slice(0, 24),
        degree,
        major,
        startDate: dateRange?.[1] ?? "",
        endDate: dateRange?.[2] ?? "",
        description: [text, gpa].filter(Boolean).join(" | ")
      };
    })
  );
  return items;
}

function parseProjectsSection(blocks: ResumeSectionBlock[]) {
  return blocks.flatMap((block) =>
    splitItemBlocks(block.lines).map((text) => {
      const dateRange = text.match(DATE_RANGE_RE);
      const role = text.match(/(角色|岗位|职责|role)[:：]?\s*([^\s,;]+)/i)?.[2] ?? "";
      const bullets = splitByBullets([text]);
      return {
        id: uuid(),
        title: text.split(/[|｜-]/)[0].slice(0, 30),
        role,
        startDate: dateRange?.[1] ?? "",
        endDate: dateRange?.[2] ?? "",
        description: text,
        technologies: [],
        highlights: bullets.length ? bullets : [text]
      };
    })
  );
}

function parseExperienceSection(blocks: ResumeSectionBlock[]) {
  return blocks.flatMap((block) =>
    splitItemBlocks(block.lines).map((text) => {
      const dateRange = text.match(DATE_RANGE_RE);
      const role = text.match(/(岗位|职位|role|title)[:：]?\s*([^\s,;]+)/i)?.[2] ?? "";
      const company = text.match(/(公司|单位|organization|company)[:：]?\s*([^\s,;]+)/i)?.[2] ?? "";
      const bullets = splitByBullets([text]);
      return {
        id: uuid(),
        title: company || text.split(/[|｜-]/)[0].slice(0, 30),
        role,
        startDate: dateRange?.[1] ?? "",
        endDate: dateRange?.[2] ?? "",
        description: text,
        achievements: bullets.length ? bullets : [text]
      };
    })
  );
}

function parseSkillsSection(blocks: ResumeSectionBlock[]) {
  const raw = blocks.map((block) => block.rawText).join("\n");
  const parts = raw
    .split(/[,\n、;；|/]/g)
    .map((item) => item.trim())
    .filter(Boolean);
  return [{ id: uuid(), category: "技能", items: Array.from(new Set(parts)) }];
}

function parseSimpleListSection(blocks: ResumeSectionBlock[]) {
  return blocks.flatMap((block) =>
    splitByBullets(block.lines).map((line) => ({
      id: uuid(),
      title: line,
      description: block.rawText
    }))
  );
}

function pushRawSectionFallback(partial: Partial<ResumeData>, title: string, rawText: string) {
  if (!rawText.trim()) return;
  partial.customSections?.push({
    id: uuid(),
    title,
    items: [{ id: uuid(), title, subtitle: "", date: "", description: rawText }]
  });
}

function createImportReport(
  basicsConfidence: { name: { confidence: number; value: string }; phone: { confidence: number; value: string }; email: { confidence: number; value: string } },
  partial: Partial<ResumeData>
): ResumeImportReport {
  const educationCount = partial.education?.length ?? 0;
  const projectsCount = partial.projects?.length ?? 0;
  const experienceCount = partial.experience?.length ?? 0;
  const report: ResumeImportReport = {
    name: basicsConfidence.name,
    phone: basicsConfidence.phone,
    email: basicsConfidence.email,
    educationCount: makeParsedField(educationCount, educationCount > 0 ? 0.8 : 0.3),
    projectsCount: makeParsedField(projectsCount, projectsCount > 0 ? 0.75 : 0.3),
    experienceCount: makeParsedField(experienceCount, experienceCount > 0 ? 0.75 : 0.3),
    lowConfidenceFields: []
  };
  report.lowConfidenceFields = summarizeLowConfidence([
    { label: "姓名", confidence: report.name.confidence, hasValue: Boolean(report.name.value) },
    { label: "电话", confidence: report.phone.confidence, hasValue: Boolean(report.phone.value) },
    { label: "邮箱", confidence: report.email.confidence, hasValue: Boolean(report.email.value) },
    { label: "教育经历", confidence: report.educationCount.confidence, hasValue: report.educationCount.value > 0 },
    { label: "项目经历", confidence: report.projectsCount.confidence, hasValue: report.projectsCount.value > 0 },
    { label: "实习/工作经历", confidence: report.experienceCount.confidence, hasValue: report.experienceCount.value > 0 }
  ]);
  return report;
}

export function parseResumeTextToResumeDraft(text: string): ParsedResumeDraft {
  const cleanedText = cleanResumeText(text);
  const parserInput = cleanedText || text.trim();
  if (!parserInput) {
    throw new Error("PDF 文本为空或不可识别，请尝试可复制文本的电子版简历。");
  }

  const sections = splitResumeIntoSections(parserInput);
  const topText = parserInput.split("\n").slice(0, 12).join("\n");
  const basicsBlocks = sections.byKey.basics.map((block) => block.rawText).join("\n");
  const basicsParsed = parseBasicsSection(basicsBlocks, topText);

  const partial: Partial<ResumeData> = {
    basics: basicsParsed.basics,
    summary: sections.byKey.summary.map((block) => block.rawText).join("\n").trim(),
    education: parseEducationSection(sections.byKey.education),
    projects: parseProjectsSection(sections.byKey.projects),
    experience: parseExperienceSection(sections.byKey.experience),
    skills: parseSkillsSection(sections.byKey.skills),
    awards: parseSimpleListSection(sections.byKey.awards),
    activities: parseSimpleListSection(sections.byKey.activities),
    certifications: parseSimpleListSection(sections.byKey.certifications),
    customSections: []
  };

  if (!partial.summary) {
    const possibleSummary = parserInput
      .split("\n")
      .find((line) => /(年经验|负责|擅长|熟悉|主导|沟通|协作)/.test(line) && line.length > 12);
    partial.summary = possibleSummary ?? "";
  }

  for (const unknownBlock of sections.byKey.unknown) {
    pushRawSectionFallback(partial, unknownBlock.title || "未分类内容", unknownBlock.rawText);
  }
  if (sections.byKey.education.length && !partial.education?.length) {
    pushRawSectionFallback(partial, "教育经历(原始文本)", sections.byKey.education.map((block) => block.rawText).join("\n"));
  }
  if (sections.byKey.projects.length && !partial.projects?.length) {
    pushRawSectionFallback(partial, "项目经历(原始文本)", sections.byKey.projects.map((block) => block.rawText).join("\n"));
  }
  if (sections.byKey.experience.length && !partial.experience?.length) {
    pushRawSectionFallback(partial, "实习/工作经历(原始文本)", sections.byKey.experience.map((block) => block.rawText).join("\n"));
  }

  const resume = normalizeResumeData(partial);
  const report = createImportReport(basicsParsed.confidence, partial);
  return { resume, report };
}

export function parseResumeTextToResumeData(text: string): ResumeData {
  return parseResumeTextToResumeDraft(text).resume;
}

export function parseResumeJson(text: string): ResumeData {
  const raw = JSON.parse(text) as Partial<ResumeData>;
  return normalizeResumeData(raw);
}

export function mergeResumeData(current: ResumeData, incoming: ResumeData): ResumeData {
  const pick = (a: string, b: string) => (a && a.trim().length ? a : b);
  return normalizeResumeData({
    meta: {
      template: current.meta.template,
      updatedAt: new Date().toISOString()
    },
    basics: {
      name: pick(current.basics.name, incoming.basics.name),
      phone: pick(current.basics.phone, incoming.basics.phone),
      email: pick(current.basics.email, incoming.basics.email),
      targetRole: pick(current.basics.targetRole, incoming.basics.targetRole),
      location: pick(current.basics.location, incoming.basics.location),
      github: pick(current.basics.github, incoming.basics.github),
      website: pick(current.basics.website, incoming.basics.website),
      photoDataUrl: pick(current.basics.photoDataUrl, incoming.basics.photoDataUrl),
      photoFileName: pick(current.basics.photoFileName, incoming.basics.photoFileName),
      photoMimeType: pick(current.basics.photoMimeType, incoming.basics.photoMimeType)
    },
    summary:
      current.summary && incoming.summary && current.summary !== incoming.summary
        ? `${current.summary}\n${incoming.summary}`
        : current.summary || incoming.summary,
    education: [...(current.education ?? []), ...(incoming.education ?? [])],
    projects: [...(current.projects ?? []), ...(incoming.projects ?? [])],
    experience: [...(current.experience ?? []), ...(incoming.experience ?? [])],
    skills: [...(current.skills ?? []), ...(incoming.skills ?? [])],
    awards: [...(current.awards ?? []), ...(incoming.awards ?? [])],
    activities: [...(current.activities ?? []), ...(incoming.activities ?? [])],
    certifications: [...(current.certifications ?? []), ...(incoming.certifications ?? [])],
    customSections: [...(current.customSections ?? []), ...(incoming.customSections ?? [])]
  });
}

/**
 * 简易 Markdown 解析器：
 * - 使用二级标题识别模块
 * - 每个模块内按列表或段落抽取内容
 */
export function parseResumeMarkdown(text: string): ResumeData {
  if (!text.trim()) return normalizeResumeData({});
  return parseResumeTextToResumeData(text.replace(/^##\s*/gm, ""));
}

export function parseResumeTxt(text: string): ResumeData {
  return parseResumeTextToResumeData(text);
}
