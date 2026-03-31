"use client";

import { Download, FileUp, FileJson, FileText, RefreshCw, WandSparkles } from "lucide-react";
import { ChangeEvent, RefObject, useRef, useState } from "react";
import { ImportPdfResumeButton } from "@/components/import/ImportPdfResumeButton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { parseResumeJson, parseResumeMarkdown, parseResumeTxt } from "@/lib/resume-parser";
import { exportResumeJson, exportResumeMarkdown, exportResumePdf } from "@/lib/resume-export";
import { useResumeStore } from "@/store/resume-store";
import { ResumeTemplate } from "@/types/resume";

export function TopBar({ previewRef }: { previewRef: RefObject<HTMLDivElement> }) {
  const resume = useResumeStore((state) => state.resume);
  const setTemplate = useResumeStore((state) => state.setTemplate);
  const importResume = useResumeStore((state) => state.importResume);
  const resetResume = useResumeStore((state) => state.resetResume);
  const fillExample = useResumeStore((state) => state.fillExample);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const templateOptions: Array<{ label: string; value: ResumeTemplate }> = [
    { label: "简约白底", value: "minimal" },
    { label: "现代蓝色", value: "modernBlue" },
    { label: "深色高级感", value: "darkPro" }
  ];

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lower = file.name.toLowerCase();
    try {
      if (lower.endsWith(".json")) {
        importResume(parseResumeJson(text));
      } else if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
        importResume(parseResumeMarkdown(text));
      } else if (lower.endsWith(".txt")) {
        importResume(parseResumeTxt(text));
      } else {
        alert("仅支持 JSON / Markdown / TXT 文件。");
      }
    } catch (error) {
      console.error(error);
      alert("导入失败：文件格式或内容可能不正确。");
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmitResume = async () => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("resume", JSON.stringify(resume));

      if (resume.basics.photoDataUrl) {
        const photoBlob = await fetch(resume.basics.photoDataUrl).then((response) => response.blob());
        const fallbackName = photoBlob.type === "image/png" ? "resume-photo.png" : "resume-photo.jpg";
        formData.append("photo", photoBlob, resume.basics.photoFileName || fallbackName);
      }

      const response = await fetch("/api/submit-resume", {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "提交失败，请稍后重试。");
      }

      alert(result?.savedPhotoPath ? `提交成功，照片已保存到 ${result.savedPhotoPath}` : "提交成功。");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 mb-4 border-b bg-background/90 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2 px-4 pb-2 pt-4">
        <h1 className="mr-2 text-lg font-semibold">AI Resume Builder</h1>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <FileUp className="h-4 w-4" />
          导入简历
        </Button>
        <ImportPdfResumeButton />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".json,.md,.markdown,.txt"
          onChange={handleFileImport}
        />

        <Button variant="outline" onClick={() => exportResumeJson(resume)}>
          <FileJson className="h-4 w-4" />
          下载 JSON
        </Button>
        <Button variant="outline" onClick={() => exportResumeMarkdown(resume)}>
          <FileText className="h-4 w-4" />
          下载 Markdown
        </Button>
        <Button
          onClick={() => {
            if (!previewRef.current) return;
            exportResumePdf(previewRef.current, resume);
          }}
        >
          <Download className="h-4 w-4" />
          下载 PDF
        </Button>
        <Button onClick={handleSubmitResume} disabled={submitting}>
          <FileUp className="h-4 w-4" />
          {submitting ? "提交中..." : "提交到后端"}
        </Button>

        <select
          className="h-9 rounded-lg border bg-background px-3 text-sm"
          value={resume.meta.template}
          onChange={(e) => setTemplate(e.target.value as ResumeTemplate)}
        >
          {templateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Button variant="secondary" onClick={fillExample}>
          <WandSparkles className="h-4 w-4" />
          一键填充示例简历
        </Button>
        <Button variant="ghost" onClick={resetResume}>
          <RefreshCw className="h-4 w-4" />
          重置默认简历
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
      <p className="px-4 pb-3 text-xs text-muted-foreground">
        支持电子版 PDF 简历导入，系统会自动提取内容并转换为可编辑草稿；扫描版或复杂排版 PDF 可能需要手动调整。
      </p>
    </header>
  );
}
