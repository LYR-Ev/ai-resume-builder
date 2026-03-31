"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/resume-store";

const summarySchema = z.object({
  summary: z.string().min(10, "建议至少 10 个字符").max(500, "建议控制在 500 字以内")
});

type SummaryFormData = z.infer<typeof summarySchema>;

export function SummaryEditor() {
  const summary = useResumeStore((state) => state.resume.summary);
  const setSummary = useResumeStore((state) => state.setSummary);

  const form = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    mode: "onBlur",
    defaultValues: { summary }
  });

  useEffect(() => {
    form.reset({ summary });
  }, [summary, form]);

  useEffect(() => {
    const sub = form.watch((values) => {
      setSummary(values.summary ?? "");
    });
    return () => sub.unsubscribe();
  }, [form, setSummary]);

  return (
    <div className="space-y-2">
      <Label>个人简介</Label>
      <Textarea rows={5} {...form.register("summary")} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{form.formState.errors.summary?.message ?? "建议突出你的核心优势和业务成果。"}</span>
        <span>{(form.watch("summary") || "").length}/500</span>
      </div>
    </div>
  );
}
