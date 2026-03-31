import { v4 as uuid } from "uuid";
import { defaultResumeData } from "@/data/default-resume";
import {
  ActivityItem,
  AwardItem,
  CertificationItem,
  CustomSection,
  CustomSectionItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  ResumeTemplate,
  SkillCategory
} from "@/types/resume";

function withId<T extends { id?: string }>(item: T): T & { id: string } {
  return { ...item, id: item.id && item.id.length ? item.id : uuid() };
}

function ensureEducation(list: unknown): EducationItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => withId(item as EducationItem));
}

function ensureProjects(list: unknown): ProjectItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const normalized = withId(item as ProjectItem);
    return {
      ...normalized,
      technologies: Array.isArray(normalized.technologies) ? normalized.technologies : [],
      highlights: Array.isArray(normalized.highlights) ? normalized.highlights : []
    };
  });
}

function ensureExperience(list: unknown): ExperienceItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const normalized = withId(item as ExperienceItem);
    return {
      ...normalized,
      achievements: Array.isArray(normalized.achievements) ? normalized.achievements : []
    };
  });
}

function ensureAwards(list: unknown): AwardItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => withId(item as AwardItem));
}

function ensureActivities(list: unknown): ActivityItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => withId(item as ActivityItem));
}

function ensureCertifications(list: unknown): CertificationItem[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => withId(item as CertificationItem));
}

function ensureSkills(list: unknown): SkillCategory[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const normalized = withId(item as SkillCategory);
    return {
      ...normalized,
      category: normalized.category ?? "技能组",
      items: Array.isArray(normalized.items) ? normalized.items.filter(Boolean) : []
    };
  });
}

function ensureCustomSections(list: unknown): CustomSection[] {
  if (!Array.isArray(list)) return [];
  return list.map((section) => {
    const normalized = withId(section as CustomSection);
    const items = Array.isArray(normalized.items)
      ? normalized.items.map((it) => withId(it as CustomSectionItem))
      : [];
    return { ...normalized, title: normalized.title ?? "自定义模块", items };
  });
}

export function normalizeResumeData(input: Partial<ResumeData> | null | undefined): ResumeData {
  const fallback = defaultResumeData;
  const template = (input?.meta?.template ?? fallback.meta.template) as ResumeTemplate;

  return {
    meta: {
      template: template ?? "minimal",
      updatedAt: new Date().toISOString()
    },
    basics: {
      ...fallback.basics,
      ...(input?.basics ?? {})
    },
    summary: input?.summary ?? fallback.summary,
    education: ensureEducation(input?.education),
    projects: ensureProjects(input?.projects),
    experience: ensureExperience(input?.experience),
    skills: ensureSkills(input?.skills),
    awards: ensureAwards(input?.awards),
    activities: ensureActivities(input?.activities),
    certifications: ensureCertifications(input?.certifications),
    customSections: ensureCustomSections(input?.customSections)
  };
}
