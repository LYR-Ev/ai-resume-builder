"use client";

import { Download, FileJson, FileText, FileUp, RefreshCw, UploadCloud, WandSparkles } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { ImportPdfResumeButton } from "@/components/import/ImportPdfResumeButton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { parseResumeJson, parseResumeMarkdown, parseResumeTxt } from "@/lib/resume-parser";
import { exportResumeJson, exportResumeMarkdown, exportResumePdf } from "@/lib/resume-export";
import { useResumeStore } from "@/store/resume-store";
import { ResumeTemplate } from "@/types/resume";
import { format } from "date-fns";

export function TopBar() {
  const resume = useResumeStore((state) => state.resume);
  const setTemplate = useResumeStore((state) => state.setTemplate);
  const importResume = useResumeStore((state) => state.importResume);
  const resetResume = useResumeStore((state) => state.resetResume);
  const fillExample = useResumeStore((state) => state.fillExample);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const templateOptions: Array<{ label: string; value: ResumeTemplate }> = [
    { label: "简约白底", value: "minimal" },
    { label: "现代蓝色", value: "modernBlue" },
    { label: "深色高级感", value: "darkPro" }
  ];

  const showNotice = (type: "ok" | "err", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 4200);
  };

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lower = file.name.toLowerCase();
    try {
      if (lower.endsWith(".json")) {
        importResume(parseResumeJson(text));
        showNotice("ok", "JSON 已导入。");
      } else if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
        importResume(parseResumeMarkdown(text));
        showNotice("ok", "Markdown 已导入。");
      } else if (lower.endsWith(".txt")) {
        importResume(parseResumeTxt(text));
        showNotice("ok", "文本已导入。");
      } else {
        showNotice("err", "仅支持 JSON / Markdown / TXT 文件。");
      }
    } catch (error) {
      console.error(error);
      showNotice("err", "导入失败：文件格式或内容可能不正确。");
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

      const msg = result?.savedPhotoPath
        ? `提交成功，照片已保存到 ${result.savedPhotoPath}`
        : "已提交到后端，服务器已接收。";
      showNotice("ok", msg);
    } catch (error) {
      console.error(error);
      showNotice("err", error instanceof Error ? error.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setPdfBusy(true);
      await exportResumePdf(resume);
      showNotice("ok", "已保存矢量 PDF（内嵌可回导数据，可用「导入 PDF 简历」还原）。");
    } catch (e) {
      console.error(e);
      showNotice("err", e instanceof Error ? e.message : "PDF 导出失败。");
    } finally {
      setPdfBusy(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm("确定要清空为空白简历吗？当前未保存的修改会随本地数据一起被覆盖。")) {
      return;
    }
    resetResume();
    showNotice("ok", "已恢复为空白模板。");
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 px-4 pb-1 pt-4">
        <h1 className="mr-1 min-w-0 text-lg font-semibold">AI Resume Builder</h1>
        {notice && (
          <span
            className={
              `max-w-md truncate text-xs ` +
              (notice.type === "ok" ? "text-emerald-600 dark:text-emerald-500" : "text-red-500")
            }
            role="status"
          >
            {notice.text}
          </span>
        )}

        <div className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-1 sm:ml-0 sm:gap-2">
          <div className="hidden items-center gap-1 pr-1 text-xs text-muted-foreground sm:flex">
            <span className="whitespace-nowrap">
              更新{" "}
              {resume.meta.updatedAt
                ? (() => {
                    try {
                      return format(new Date(resume.meta.updatedAt), "MM-dd HH:mm");
                    } catch {
                      return "—";
                    }
                  })()
                : "—"}
            </span>
            <span className="text-muted-foreground/70">·</span>
            <span className="whitespace-nowrap">本地自动保存</span>
          </div>
          <div className="hidden h-6 w-px self-stretch bg-border sm:block" role="separator" />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">导入</span>
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <FileUp className="h-4 w-4" />
          文件
        </Button>
        <ImportPdfResumeButton />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".json,.md,.markdown,.txt"
          onChange={handleFileImport}
        />

        <div className="h-6 w-px self-stretch bg-border" role="separator" />

        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">导出</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            exportResumeJson(resume);
            showNotice("ok", "JSON 已下载。");
          }}
        >
          <FileJson className="h-4 w-4" />
          JSON
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            exportResumeMarkdown(resume);
            showNotice("ok", "Markdown 已下载。");
          }}
        >
          <FileText className="h-4 w-4" />
          MD
        </Button>
        <Button
          size="sm"
          onClick={handleDownloadPdf}
          disabled={pdfBusy}
          title="导出为矢量文字 PDF，文末内嵌 AIB1 可回导数据，可用「导入 PDF 简历」无损还原。首次导出需下载中文字体。"
        >
          {pdfBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {pdfBusy ? "生成中…" : "PDF 矢量+可回导"}
        </Button>

        <Button size="sm" onClick={handleSubmitResume} disabled={submitting}>
          <UploadCloud className="h-4 w-4" />
          {submitting ? "提交中…" : "提交后端"}
        </Button>

        <div className="h-6 w-px self-stretch bg-border" role="separator" />

        <select
          className="h-8 min-w-[7rem] rounded-md border border-input bg-background px-2 text-sm shadow-sm"
          value={resume.meta.template}
          onChange={(e) => setTemplate(e.target.value as ResumeTemplate)}
        >
          {templateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              模板：{option.label}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            fillExample();
            showNotice("ok", "已填入示例简历。");
          }}
        >
          <WandSparkles className="h-4 w-4" />
          填充示例
        </Button>
        <Button size="sm" variant="ghost" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
          清空简历
        </Button>
      </div>
      <p className="px-4 pb-3 text-xs text-muted-foreground">
        导出 PDF 为可检索文字（矢量），与网上常见「简历截图式 PDF」不同；文尾附带本编辑器专用数据，便于再次「导入 PDF
        简历」完整还原。其它来源 PDF 仍走文本智能解析。提交后端需本地运行 <code className="rounded bg-muted px-0.5">next dev</code>{" "}
        以访问 <code className="rounded bg-muted px-0.5">/api/submit-resume</code>。
      </p>
    </header>
  );
}
