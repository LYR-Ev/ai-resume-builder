import { ResumeData } from "@/types/resume";

export const blankResumeData: ResumeData = {
  meta: {
    template: "minimal",
    updatedAt: new Date().toISOString()
  },
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
