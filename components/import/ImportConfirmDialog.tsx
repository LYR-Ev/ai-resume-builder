"use client";

import { ResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImportConfirmDialogProps {
  open: boolean;
  parsedResume: ResumeData | null;
  sourceName: string;
  onConfirmReplace: () => void;
  onConfirmMerge: () => void;
  onCancel: () => void;
}

export function ImportConfirmDialog({
  open,
  parsedResume,
  sourceName,
  onConfirmReplace,
  onConfirmMerge,
  onCancel
}: ImportConfirmDialogProps) {
  if (!open || !parsedResume) return null;

  const sections = [
    { label: "个人简介", value: parsedResume.summary ? "已识别" : "未识别" },
    { label: "教育经历", value: `${parsedResume.education.length} 条` },
    { label: "项目经历", value: `${parsedResume.projects.length} 条` },
    { label: "工作经历", value: `${parsedResume.experience.length} 条` },
    { label: "技能清单", value: `${parsedResume.skills.reduce((n, s) => n + s.items.length, 0)} 项` },
    { label: "获奖经历", value: `${parsedResume.awards.length} 条` },
    { label: "校园经历", value: `${parsedResume.activities.length} 条` },
    { label: "证书/语言成绩", value: `${parsedResume.certifications.length} 条` }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-xl space-y-4 p-5">
        <h3 className="text-lg font-semibold">导入确认</h3>
        <p className="text-sm text-muted-foreground">
          已完成对 <span className="font-medium text-foreground">{sourceName}</span> 的解析，检测到以下内容：
        </p>
        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <p>姓名：{parsedResume.basics.name || "未识别"}</p>
          <p>邮箱：{parsedResume.basics.email || "未识别"}</p>
          <p>电话：{parsedResume.basics.phone || "未识别"}</p>
          <p>求职意向：{parsedResume.basics.targetRole || "未识别"}</p>
          {sections.map((section) => (
            <p key={section.label}>
              {section.label}：{section.value}
            </p>
          ))}
        </div>
        <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
          支持电子版 PDF 简历导入。系统会自动提取内容并转换为可编辑草稿，扫描版或复杂排版 PDF 可能需要手动调整。
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            取消导入
          </Button>
          <Button variant="outline" onClick={onConfirmMerge}>
            合并到当前简历
          </Button>
          <Button onClick={onConfirmReplace}>覆盖当前简历</Button>
        </div>
      </Card>
    </div>
  );
}
