export type ResumeSectionKey =
  | "basics"
  | "summary"
  | "education"
  | "projects"
  | "experience"
  | "skills"
  | "awards"
  | "activities"
  | "certifications"
  | "unknown";

export const SECTION_TITLE_MAP: Record<Exclude<ResumeSectionKey, "unknown">, string[]> = {
  basics: ["基本信息", "个人信息", "个人资料", "profile", "about me", "contact"],
  summary: ["个人简介", "自我评价", "个人总结", "summary", "profile summary"],
  education: ["教育经历", "教育背景", "education", "academic background"],
  projects: ["项目经历", "项目经验", "projects", "project experience"],
  experience: ["实习经历", "工作经历", "实习经验", "experience", "employment", "work experience"],
  skills: ["技能", "专业技能", "skills", "technical skills"],
  awards: ["获奖经历", "荣誉奖项", "awards", "honors"],
  activities: ["校园经历", "社团经历", "活动经历", "activities", "leadership"],
  certifications: ["证书", "语言成绩", "certifications", "languages", "certificates"]
};

export interface ResumeSectionBlock {
  key: ResumeSectionKey;
  title: string;
  rawText: string;
  lines: string[];
}

export interface ParsedSections {
  ordered: ResumeSectionBlock[];
  byKey: Record<ResumeSectionKey, ResumeSectionBlock[]>;
}

function normalizeTitle(text: string) {
  return text.toLowerCase().replace(/[:：\s\-_/|()[\].]/g, "");
}

function matchSectionTitle(line: string): ResumeSectionKey | null {
  const normalized = normalizeTitle(line);
  if (!normalized || line.length > 40) return null;

  for (const [key, aliases] of Object.entries(SECTION_TITLE_MAP) as Array<[Exclude<ResumeSectionKey, "unknown">, string[]]>) {
    const hit = aliases.some((alias) => normalized.includes(normalizeTitle(alias)));
    if (hit) return key;
  }
  return null;
}

function emptySectionMap(): Record<ResumeSectionKey, ResumeSectionBlock[]> {
  return {
    basics: [],
    summary: [],
    education: [],
    projects: [],
    experience: [],
    skills: [],
    awards: [],
    activities: [],
    certifications: [],
    unknown: []
  };
}

export function splitResumeIntoSections(text: string): ParsedSections {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const ordered: ResumeSectionBlock[] = [];
  const byKey = emptySectionMap();

  let current: ResumeSectionBlock = { key: "basics", title: "基本信息", rawText: "", lines: [] };
  for (const line of lines) {
    const matchedKey = matchSectionTitle(line);
    const isHeader = Boolean(matchedKey);

    if (isHeader) {
      if (current.lines.length) {
        current.rawText = current.lines.join("\n");
        ordered.push(current);
        byKey[current.key].push(current);
      }
      current = { key: matchedKey ?? "unknown", title: line, rawText: "", lines: [] };
      continue;
    }

    current.lines.push(line);
  }

  if (current.lines.length) {
    current.rawText = current.lines.join("\n");
    ordered.push(current);
    byKey[current.key].push(current);
  }

  return { ordered, byKey };
}
