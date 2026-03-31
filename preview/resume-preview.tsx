"use client";

import { ForwardedRef, forwardRef } from "react";
import { useResumeStore } from "@/store/resume-store";
import { DarkProTemplate } from "@/templates/dark-pro-template";
import { MinimalTemplate } from "@/templates/minimal-template";
import { ModernBlueTemplate } from "@/templates/modern-blue-template";
import { Card } from "@/components/ui/card";

export const ResumePreview = forwardRef<HTMLDivElement, {}>(function ResumePreview(
  _props,
  ref: ForwardedRef<HTMLDivElement>
) {
  const resume = useResumeStore((state) => state.resume);

  return (
    <Card className="overflow-auto bg-muted/30 p-4">
      <div ref={ref} className="mx-auto w-[210mm] max-w-full origin-top scale-[0.8] lg:scale-[0.92]">
        {resume.meta.template === "minimal" && <MinimalTemplate data={resume} />}
        {resume.meta.template === "modernBlue" && <ModernBlueTemplate data={resume} />}
        {resume.meta.template === "darkPro" && <DarkProTemplate data={resume} />}
      </div>
    </Card>
  );
});
