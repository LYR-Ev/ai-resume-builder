import { v4 as uuid } from "uuid";
import { normalizeResumeData } from "@/lib/resume-normalizer";
import { ResumeData } from "@/types/resume";

function parseLinesToBullets(lines: string[]) {
  return lines
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

export function parseResumeJson(text: string): ResumeData {
  const raw = JSON.parse(text) as Partial<ResumeData>;
  return normalizeResumeData(raw);
}

function sanitizeText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractHeaderBasics(lines: string[]) {
  const joined = lines.join("\n");
  const email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0] ?? "";
  const phone =
    joined.match(/(?:\+?86[-\s]?)?(1[3-9]\d{9})/)?.[0] ??
    joined.match(/\b\d{3,4}[-\s]?\d{7,8}\b/)?.[0] ??
    "";
  const github = joined.match(/https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_.-]+/i)?.[0] ?? "";
  const urls = joined.match(/https?:\/\/[^\s)]+/gi) ?? [];
  const website = urls.find((url) => !/github\.com/i.test(url)) ?? "";
  const targetRoleLine =
    lines.find((line) => /(求职意向|应聘岗位|目标岗位|target role|objective)/i.test(line)) ?? "";
  const locationLine = lines.find((line) => /(所在地|城市|现居|location)/i.test(line)) ?? "";

  const cleanLine = (line: string) => line.replace(/^[-*]\s*/, "").replace(/[|]/g, " ").trim();
  const nameCandidate = lines
    .map(cleanLine)
    .find(
      (line) =>
        line.length >= 2 &&
        line.length <= 24 &&
        !/@|https?:\/\/|github|电话|手机|email|邮箱|求职意向|目标岗位|所在地|location/i.test(line)
    );

  const targetRole = targetRoleLine.split(/[:：]/).slice(1).join(":").trim();
  const location = locationLine.split(/[:：]/).slice(1).join(":").trim();

  return {
    name: nameCandidate ?? "",
    email,
    phone,
    github,
    website,
    targetRole,
    location
  };
}

function sectionKeyByTitle(title: string):
  | "summary"
  | "education"
  | "projects"
  | "experience"
  | "skills"
  | "awards"
  | "activities"
  | "certifications"
  | "unknown"
  | null {
  const t = title.trim().toLowerCase();
  if (!t) return null;
  if (/(个人简介|个人总结|summary|profile|about)/i.test(t)) return "summary";
  if (/(教育经历|教育背景|education)/i.test(t)) return "education";
  if (/(项目经历|项目经验|projects?)/i.test(t)) return "projects";
  if (/(实习经历|工作经历|职业经历|experience|employment)/i.test(t)) return "experience";
  if (/(技能清单|专业技能|技能|skills?)/i.test(t)) return "skills";
  if (/(获奖经历|获奖|awards?|honors?)/i.test(t)) return "awards";
  if (/(校园经历|社团经历|活动经历|activities|leadership)/i.test(t)) return "activities";
  if (/(证书|语言成绩|certifications?|languages?)/i.test(t)) return "certifications";
  if (/^[\u4e00-\u9fa5a-zA-Z ]{2,20}$/.test(t)) return "unknown";
  return null;
}

function splitSections(text: string) {
  const lines = sanitizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections: Array<{ title: string; key: ReturnType<typeof sectionKeyByTitle>; lines: string[] }> = [];
  let current = { title: "未分类内容", key: "unknown" as ReturnType<typeof sectionKeyByTitle>, lines: [] as string[] };

  for (const line of lines) {
    const key = sectionKeyByTitle(line);
    const isLikelyHeader = Boolean(key) && line.length <= 28;
    if (isLikelyHeader) {
      if (current.lines.length) sections.push(current);
      current = { title: line, key, lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  if (current.lines.length) sections.push(current);
  return sections;
}

function toListItems(lines: string[]) {
  return lines
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .map((line) => ({ id: uuid(), title: line, description: "" }));
}

export function parseResumeTextToResumeData(text: string): ResumeData {
  const normalizedText = sanitizeText(text);
  const allLines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const basicsFromHeader = extractHeaderBasics(allLines.slice(0, 24));
  const sections = splitSections(normalizedText);

  const partial: Partial<ResumeData> = {
    basics: {
      name: basicsFromHeader.name,
      phone: basicsFromHeader.phone,
      email: basicsFromHeader.email,
      targetRole: basicsFromHeader.targetRole,
      location: basicsFromHeader.location,
      github: basicsFromHeader.github,
      website: basicsFromHeader.website,
      photoDataUrl: "",
      photoFileName: "",
      photoMimeType: ""
    },
    summary: "",
    education: [],
    projects: [],
    experience: [],
    skills: [],
    awards: [],
    activities: [],
    certifications: [],
    customSections: []
  };

  for (const section of sections) {
    const lines = section.lines.map((line) => line.trim()).filter(Boolean);
    if (!lines.length) continue;

    if (section.key === "summary") {
      partial.summary = lines.join(" ");
      continue;
    }

    if (section.key === "education") {
      partial.education = toListItems(lines).map((item) => ({ ...item, startDate: "", endDate: "" }));
      continue;
    }

    if (section.key === "projects") {
      partial.projects = toListItems(lines).map((item) => ({
        ...item,
        technologies: [],
        highlights: []
      }));
      continue;
    }

    if (section.key === "experience") {
      partial.experience = toListItems(lines).map((item) => ({
        ...item,
        achievements: []
      }));
      continue;
    }

    if (section.key === "skills") {
      const items = lines
        .flatMap((line) => line.split(/[、,，|/]/g))
        .map((item) => item.trim())
        .filter(Boolean);
      partial.skills = [{ id: uuid(), category: "技能", items }];
      continue;
    }

    if (section.key === "awards") {
      partial.awards = toListItems(lines);
      continue;
    }

    if (section.key === "activities") {
      partial.activities = toListItems(lines);
      continue;
    }

    if (section.key === "certifications") {
      partial.certifications = toListItems(lines);
      continue;
    }

    // 兜底保留原始文本，避免信息丢失
    partial.customSections?.push({
      id: uuid(),
      title: section.title || "导入内容",
      items: [
        {
          id: uuid(),
          title: section.title || "导入内容",
          subtitle: "",
          date: "",
          description: lines.join("\n")
        }
      ]
    });
  }

  if (!partial.summary) {
    const summaryLine =
      allLines.find((line) => /(年经验|擅长|负责|熟悉|主导)/.test(line) && line.length > 10) ?? "";
    partial.summary = summaryLine;
  }

  return normalizeResumeData(partial);
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
  const sections = text.split(/\n##\s+/).map((item, index) => {
    if (index === 0 && item.startsWith("## ")) {
      return item.replace(/^##\s+/, "");
    }
    return item;
  });

  const partial: Partial<ResumeData> = {
    basics: {
      name: "",
      phone: "",
      email: "",
      targetRole: "",
      location: "",
      github: "",
      website: "",
      photoDataUrl: "",
      photoFileName: "",
      photoMimeType: ""
    },
    education: [],
    projects: [],
    experience: [],
    skills: [],
    awards: [],
    activities: [],
    certifications: [],
    customSections: []
  };

  for (const block of sections) {
    const [headerLine, ...rest] = block.split("\n");
    const header = (headerLine || "").trim().toLowerCase();
    const content = rest.join("\n").trim();
    const lines = content.split("\n").map((line) => line.trim());

    if (!header) continue;

    if (header.includes("基本信息")) {
      for (const line of lines) {
        const [k, ...vParts] = line.replace(/^[-*]\s*/, "").split(":");
        const value = vParts.join(":").trim();
        const key = k?.trim();
        if (!key || !value) continue;
        if (key.includes("姓名")) partial.basics!.name = value;
        if (key.includes("电话")) partial.basics!.phone = value;
        if (key.includes("邮箱")) partial.basics!.email = value;
        if (key.includes("意向")) partial.basics!.targetRole = value;
        if (key.includes("所在地")) partial.basics!.location = value;
        if (key.toLowerCase().includes("github")) partial.basics!.github = value;
        if (key.includes("网站")) partial.basics!.website = value;
      }
    } else if (header.includes("个人简介")) {
      partial.summary = lines.join(" ").trim();
    } else if (header.includes("教育")) {
      const bullets = parseLinesToBullets(lines);
      partial.education = bullets.map((it) => ({
        id: uuid(),
        title: it,
        description: ""
      }));
    } else if (header.includes("项目")) {
      const bullets = parseLinesToBullets(lines);
      partial.projects = bullets.map((it) => ({
        id: uuid(),
        title: it,
        description: "",
        technologies: [],
        highlights: []
      }));
    } else if (header.includes("实习") || header.includes("工作") || header.includes("经历")) {
      const bullets = parseLinesToBullets(lines);
      partial.experience = bullets.map((it) => ({
        id: uuid(),
        title: it,
        description: "",
        achievements: []
      }));
    } else if (header.includes("技能")) {
      partial.skills = [
        {
          id: uuid(),
          category: "技能",
          items: parseLinesToBullets(lines)
        }
      ];
    } else if (header.includes("获奖")) {
      partial.awards = parseLinesToBullets(lines).map((it) => ({
        id: uuid(),
        title: it
      }));
    } else if (header.includes("校园") || header.includes("社团")) {
      partial.activities = parseLinesToBullets(lines).map((it) => ({
        id: uuid(),
        title: it
      }));
    } else if (header.includes("证书") || header.includes("语言")) {
      partial.certifications = parseLinesToBullets(lines).map((it) => ({
        id: uuid(),
        title: it
      }));
    } else if (content) {
      partial.customSections!.push({
        id: uuid(),
        title: headerLine.trim(),
        items: [
          {
            id: uuid(),
            title: headerLine.trim(),
            subtitle: "",
            date: "",
            description: content
          }
        ]
      });
    }
  }

  return normalizeResumeData(partial);
}

export function parseResumeTxt(text: string): ResumeData {
  return parseResumeTextToResumeData(text);
}
