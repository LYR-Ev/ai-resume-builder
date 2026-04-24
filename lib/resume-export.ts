import { buildVectorResumePdfBlob } from "@/lib/resume-pdf-vector";
import { todayString } from "@/lib/utils";
import { ResumeData } from "@/types/resume";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function baseFilename(data: ResumeData) {
  const name = data.basics.name || "未命名";
  return `Resume_${name}_${todayString()}`;
}

export function exportResumeJson(data: ResumeData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8"
  });
  downloadBlob(blob, `${baseFilename(data)}.json`);
}

function markdownList(items: string[]) {
  if (!items.length) return "- 暂无\n";
  return items.map((item) => `- ${item}`).join("\n");
}

export function resumeToMarkdown(data: ResumeData): string {
  const sections: string[] = [];
  sections.push("# 简历");
  sections.push("## 基本信息");
  sections.push(`- 姓名: ${data.basics.name}`);
  sections.push(`- 电话: ${data.basics.phone}`);
  sections.push(`- 邮箱: ${data.basics.email}`);
  sections.push(`- 求职意向: ${data.basics.targetRole}`);
  sections.push(`- 所在地: ${data.basics.location}`);
  sections.push(`- GitHub: ${data.basics.github}`);
  sections.push(`- 个人网站: ${data.basics.website}`);
  sections.push("");

  sections.push("## 个人简介");
  sections.push(data.summary || "暂无");
  sections.push("");

  sections.push("## 教育经历");
  sections.push(markdownList(data.education.map((item) => item.title)));
  sections.push("");

  sections.push("## 项目经历");
  sections.push(markdownList(data.projects.map((item) => item.title)));
  sections.push("");

  sections.push("## 实习/工作经历");
  sections.push(markdownList(data.experience.map((item) => item.title)));
  sections.push("");

  sections.push("## 技能清单");
  sections.push(markdownList(data.skills.flatMap((item) => item.items)));
  sections.push("");

  sections.push("## 获奖经历");
  sections.push(markdownList(data.awards.map((item) => item.title)));
  sections.push("");

  sections.push("## 校园/社团经历");
  sections.push(markdownList(data.activities.map((item) => item.title)));
  sections.push("");

  sections.push("## 证书/语言成绩");
  sections.push(markdownList(data.certifications.map((item) => item.title)));
  sections.push("");

  for (const section of data.customSections) {
    sections.push(`## ${section.title}`);
    sections.push(markdownList(section.items.map((item) => item.description || item.title)));
    sections.push("");
  }

  return sections.join("\n");
}

export function exportResumeMarkdown(data: ResumeData) {
  const markdown = resumeToMarkdown(data);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `${baseFilename(data)}.md`);
}

/**
 * 导出为矢量文字 PDF，并在文尾嵌入可回导的简历 JSON 数据区（AIB1 / 标记行）。
 * 不依赖整页截图为位图，便于检索与“导入 PDF 简历”无损回传。
 */
export async function exportResumePdf(data: ResumeData) {
  const blob = await buildVectorResumePdfBlob(data);
  const filename = `${baseFilename(data)}.pdf`;
  downloadBlob(blob, filename);
}
