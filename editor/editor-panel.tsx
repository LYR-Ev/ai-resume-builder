"use client";

import { useMemo, useState } from "react";
import { BasicInfoEditor } from "@/editor/basic-info-editor";
import { CustomSectionsEditor } from "@/editor/custom-sections-editor";
import { ListSectionEditor } from "@/editor/list-section-editor";
import { SectionCard } from "@/editor/section-card";
import { SkillsEditor } from "@/editor/skills-editor";
import { SummaryEditor } from "@/editor/summary-editor";

const sections = [
  "basics",
  "summary",
  "education",
  "projects",
  "experience",
  "skills",
  "awards",
  "activities",
  "certifications",
  "custom"
] as const;

export function EditorPanel() {
  const initial = useMemo(
    () =>
      sections.reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as Record<(typeof sections)[number], boolean>),
    []
  );
  const [collapsed, setCollapsed] = useState(initial);

  return (
    <div className="space-y-4">
      <SectionCard
        title="基本信息"
        collapsed={collapsed.basics}
        onToggle={() => setCollapsed((prev) => ({ ...prev, basics: !prev.basics }))}
      >
        <BasicInfoEditor />
      </SectionCard>

      <SectionCard
        title="个人简介"
        collapsed={collapsed.summary}
        onToggle={() => setCollapsed((prev) => ({ ...prev, summary: !prev.summary }))}
      >
        <SummaryEditor />
      </SectionCard>

      <SectionCard
        title="教育经历"
        collapsed={collapsed.education}
        onToggle={() => setCollapsed((prev) => ({ ...prev, education: !prev.education }))}
      >
        <ListSectionEditor
          title="教育经历"
          section="education"
          fields={[
            { key: "title", label: "学校" },
            { key: "degree", label: "学历" },
            { key: "major", label: "专业" },
            { key: "startDate", label: "开始时间" },
            { key: "endDate", label: "结束时间" },
            { key: "description", label: "描述", type: "textarea" }
          ]}
        />
      </SectionCard>

      <SectionCard
        title="项目经历"
        collapsed={collapsed.projects}
        onToggle={() => setCollapsed((prev) => ({ ...prev, projects: !prev.projects }))}
      >
        <ListSectionEditor
          title="项目经历"
          section="projects"
          fields={[
            { key: "title", label: "项目名称" },
            { key: "role", label: "角色" },
            { key: "organization", label: "所属组织" },
            { key: "startDate", label: "开始时间" },
            { key: "endDate", label: "结束时间" },
            { key: "technologies", label: "技术栈（逗号分隔）" },
            { key: "description", label: "项目描述", type: "textarea", ai: true },
            { key: "highlights", label: "成果亮点（逗号或换行分隔）", type: "bullet", ai: true }
          ]}
        />
      </SectionCard>

      <SectionCard
        title="实习/工作经历"
        collapsed={collapsed.experience}
        onToggle={() => setCollapsed((prev) => ({ ...prev, experience: !prev.experience }))}
      >
        <ListSectionEditor
          title="工作经历"
          section="experience"
          fields={[
            { key: "title", label: "公司/组织" },
            { key: "role", label: "岗位" },
            { key: "location", label: "地点" },
            { key: "startDate", label: "开始时间" },
            { key: "endDate", label: "结束时间" },
            { key: "description", label: "工作描述", type: "textarea", ai: true },
            { key: "achievements", label: "成果（逗号或换行分隔）", type: "bullet", ai: true }
          ]}
        />
      </SectionCard>

      <SectionCard
        title="技能清单"
        collapsed={collapsed.skills}
        onToggle={() => setCollapsed((prev) => ({ ...prev, skills: !prev.skills }))}
      >
        <SkillsEditor />
      </SectionCard>

      <SectionCard
        title="获奖经历"
        collapsed={collapsed.awards}
        onToggle={() => setCollapsed((prev) => ({ ...prev, awards: !prev.awards }))}
      >
        <ListSectionEditor
          title="获奖经历"
          section="awards"
          fields={[
            { key: "title", label: "奖项名称" },
            { key: "issuer", label: "颁发单位" },
            { key: "date", label: "时间" },
            { key: "description", label: "说明", type: "textarea" }
          ]}
        />
      </SectionCard>

      <SectionCard
        title="校园/社团经历"
        collapsed={collapsed.activities}
        onToggle={() => setCollapsed((prev) => ({ ...prev, activities: !prev.activities }))}
      >
        <ListSectionEditor
          title="校园经历"
          section="activities"
          fields={[
            { key: "title", label: "组织名称" },
            { key: "role", label: "角色" },
            { key: "date", label: "时间" },
            { key: "description", label: "说明", type: "textarea" }
          ]}
        />
      </SectionCard>

      <SectionCard
        title="证书/语言成绩"
        collapsed={collapsed.certifications}
        onToggle={() => setCollapsed((prev) => ({ ...prev, certifications: !prev.certifications }))}
      >
        <ListSectionEditor
          title="证书"
          section="certifications"
          fields={[
            { key: "title", label: "证书名称" },
            { key: "issuer", label: "颁发机构" },
            { key: "score", label: "成绩/等级" },
            { key: "date", label: "时间" },
            { key: "description", label: "说明", type: "textarea" }
          ]}
        />
      </SectionCard>

      <SectionCard
        title="自定义模块"
        collapsed={collapsed.custom}
        onToggle={() => setCollapsed((prev) => ({ ...prev, custom: !prev.custom }))}
      >
        <CustomSectionsEditor />
      </SectionCard>
    </div>
  );
}
