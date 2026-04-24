"use client";

import { useResumeStore } from "@/store/resume-store";
import { Card } from "@/components/ui/card";
import { DarkProTemplate } from "@/templates/dark-pro-template";
import { MinimalTemplate } from "@/templates/minimal-template";
import { ModernBlueTemplate } from "@/templates/modern-blue-template";

export function ResumePreview() {
  const resume = useResumeStore((state) => state.resume);

  return (
    <Card className="overflow-hidden bg-card p-2 shadow-sm ring-1 ring-border/50 sm:p-4">
      <p className="mb-2 text-center text-xs text-muted-foreground sm:mb-3">实时预览</p>
      <div className="mx-auto w-[210mm] max-w-full origin-top scale-[0.72] sm:scale-75 lg:scale-[0.9] print:scale-100">
        {resume.meta.template === "minimal" && <MinimalTemplate data={resume} />}
        {resume.meta.template === "modernBlue" && <ModernBlueTemplate data={resume} />}
        {resume.meta.template === "darkPro" && <DarkProTemplate data={resume} />}
      </div>
    </Card>
  );
}
