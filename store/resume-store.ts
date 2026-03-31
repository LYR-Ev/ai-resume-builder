"use client";

import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { blankResumeData } from "@/data/blank-resume";
import { defaultResumeData } from "@/data/default-resume";
import { normalizeResumeData } from "@/lib/resume-normalizer";
import { ResumeData, ResumeTemplate } from "@/types/resume";

type ListSectionKey =
  | "education"
  | "projects"
  | "experience"
  | "skills"
  | "awards"
  | "activities"
  | "certifications";

interface ResumeState {
  resume: ResumeData;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setTemplate: (template: ResumeTemplate) => void;
  patchBasics: (payload: Partial<ResumeData["basics"]>) => void;
  setSummary: (summary: string) => void;
  updateListItem: (section: ListSectionKey, id: string, payload: Record<string, unknown>) => void;
  addListItem: (section: ListSectionKey) => void;
  removeListItem: (section: ListSectionKey, id: string) => void;
  moveListItem: (section: ListSectionKey, id: string, direction: "up" | "down") => void;
  addCustomSection: () => void;
  removeCustomSection: (sectionId: string) => void;
  updateCustomSectionTitle: (sectionId: string, title: string) => void;
  addCustomItem: (sectionId: string) => void;
  removeCustomItem: (sectionId: string, itemId: string) => void;
  updateCustomItem: (
    sectionId: string,
    itemId: string,
    payload: Partial<{
      title: string;
      subtitle: string;
      date: string;
      description: string;
    }>
  ) => void;
  importResume: (data: Partial<ResumeData>) => void;
  resetResume: () => void;
  fillExample: () => void;
}

const emptyItemFactory: Record<ListSectionKey, () => Record<string, unknown>> = {
  education: () => ({ id: uuid(), title: "", degree: "", major: "", startDate: "", endDate: "", description: "" }),
  projects: () => ({
    id: uuid(),
    title: "",
    role: "",
    organization: "",
    startDate: "",
    endDate: "",
    description: "",
    technologies: [],
    highlights: []
  }),
  experience: () => ({
    id: uuid(),
    title: "",
    role: "",
    organization: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    achievements: []
  }),
  skills: () => ({ id: uuid(), category: "技能组", items: [] }),
  awards: () => ({ id: uuid(), title: "", issuer: "", date: "", description: "" }),
  activities: () => ({ id: uuid(), title: "", role: "", date: "", description: "" }),
  certifications: () => ({ id: uuid(), title: "", issuer: "", score: "", date: "", description: "" })
};

function moveById<T extends { id: string }>(list: T[], id: string, direction: "up" | "down") {
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return list;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= list.length) return list;
  const next = [...list];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resume: defaultResumeData,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setTemplate: (template) =>
        set((state) => ({
          resume: {
            ...state.resume,
            meta: { ...state.resume.meta, template, updatedAt: new Date().toISOString() }
          }
        })),
      patchBasics: (payload) =>
        set((state) => {
          const currentBasics = state.resume.basics;
          const hasChange = Object.entries(payload).some(
            ([key, value]) => currentBasics[key as keyof typeof currentBasics] !== value
          );

          if (!hasChange) {
            return state;
          }

          return {
            resume: {
              ...state.resume,
              basics: { ...currentBasics, ...payload },
              meta: { ...state.resume.meta, updatedAt: new Date().toISOString() }
            }
          };
        }),
      setSummary: (summary) =>
        set((state) => ({
          resume: {
            ...state.resume,
            summary,
            meta: { ...state.resume.meta, updatedAt: new Date().toISOString() }
          }
        })),
      updateListItem: (section, id, payload) =>
        set((state) => ({
          resume: {
            ...state.resume,
            [section]: state.resume[section].map((item: any) => (item.id === id ? { ...item, ...payload } : item))
          } as ResumeData
        })),
      addListItem: (section) =>
        set((state) => ({
          resume: {
            ...state.resume,
            [section]: [...state.resume[section], emptyItemFactory[section]()]
          } as ResumeData
        })),
      removeListItem: (section, id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            [section]: state.resume[section].filter((item: any) => item.id !== id)
          } as ResumeData
        })),
      moveListItem: (section, id, direction) =>
        set((state) => ({
          resume: {
            ...state.resume,
            [section]: moveById(state.resume[section] as any[], id, direction)
          } as ResumeData
        })),
      addCustomSection: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: [
              ...state.resume.customSections,
              {
                id: uuid(),
                title: "自定义模块",
                items: [{ id: uuid(), title: "", subtitle: "", date: "", description: "" }]
              }
            ]
          }
        })),
      removeCustomSection: (sectionId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.filter((section) => section.id !== sectionId)
          }
        })),
      updateCustomSectionTitle: (sectionId, title) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.map((section) =>
              section.id === sectionId ? { ...section, title } : section
            )
          }
        })),
      addCustomItem: (sectionId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    items: [...section.items, { id: uuid(), title: "", subtitle: "", date: "", description: "" }]
                  }
                : section
            )
          }
        })),
      removeCustomItem: (sectionId, itemId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.map((section) =>
              section.id === sectionId
                ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
                : section
            )
          }
        })),
      updateCustomItem: (sectionId, itemId, payload) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    items: section.items.map((item) => (item.id === itemId ? { ...item, ...payload } : item))
                  }
                : section
            )
          }
        })),
      importResume: (data) =>
        set(() => ({
          resume: normalizeResumeData(data)
        })),
      resetResume: () =>
        set(() => ({
          resume: normalizeResumeData(blankResumeData)
        })),
      fillExample: () =>
        set(() => ({
          resume: normalizeResumeData(defaultResumeData)
        }))
    }),
    {
      name: "resume-builder-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ resume: state.resume }),
      onRehydrateStorage: () => (state) => {
        if (state?.resume) {
          state.importResume(state.resume);
        }
        state?.setHydrated(true);
      }
    }
  )
);
