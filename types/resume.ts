export type ResumeTemplate = "minimal" | "modernBlue" | "darkPro";

export interface BasicInfo {
  name: string;
  phone: string;
  email: string;
  targetRole: string;
  location: string;
  github: string;
  website: string;
  photoDataUrl: string;
  photoFileName: string;
  photoMimeType: string;
}

export interface ResumeItemBase {
  id: string;
  title: string;
  organization?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  description?: string;
}

export interface EducationItem extends ResumeItemBase {
  degree?: string;
  major?: string;
}

export interface ProjectItem extends ResumeItemBase {
  role?: string;
  technologies: string[];
  highlights: string[];
}

export interface ExperienceItem extends ResumeItemBase {
  role?: string;
  achievements: string[];
}

export interface SkillCategory {
  id: string;
  category: string;
  items: string[];
}

export interface AwardItem extends ResumeItemBase {
  issuer?: string;
}

export interface ActivityItem extends ResumeItemBase {
  role?: string;
}

export interface CertificationItem extends ResumeItemBase {
  score?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface ResumeData {
  meta: {
    template: ResumeTemplate;
    updatedAt: string;
  };
  basics: BasicInfo;
  summary: string;
  education: EducationItem[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  skills: SkillCategory[];
  awards: AwardItem[];
  activities: ActivityItem[];
  certifications: CertificationItem[];
  customSections: CustomSection[];
}
