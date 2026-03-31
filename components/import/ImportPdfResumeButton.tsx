"use client";

import { FileUp, RefreshCw } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { extractTextFromPdf } from "@/lib/pdf-extract";
import { mergeResumeData, parseResumeTextToResumeData } from "@/lib/resume-parser";
import { useResumeStore } from "@/store/resume-store";
import { ResumeData } from "@/types/resume";
import { ImportConfirmDialog } from "@/components/import/ImportConfirmDialog";

export function ImportPdfResumeButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resume = useResumeStore((state) => state.resume);
  const importResume = useResumeStore((state) => state.importResume);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [candidate, setCandidate] = useState<ResumeData | null>(null);
  const [sourceName, setSourceName] = useState("");

  const handleFilePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setError("");
    setSuccess("");
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("请选择 .pdf 格式文件。");
      return;
    }

    try {
      setLoading(true);
      const text = await extractTextFromPdf(file);
      const parsed = parseResumeTextToResumeData(text);
      setCandidate(parsed);
      setSourceName(file.name);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "PDF 解析失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setCandidate(null);
    setSourceName("");
  };

  const confirmReplace = () => {
    if (!candidate) return;
    importResume(candidate);
    setSuccess("PDF 导入成功，已覆盖当前简历内容。");
    closeDialog();
  };

  const confirmMerge = () => {
    if (!candidate) return;
    importResume(mergeResumeData(resume, candidate));
    setSuccess("PDF 导入成功，已合并到当前简历。");
    closeDialog();
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          type="button"
          title="导入 PDF 简历并自动转为可编辑内容"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          {loading ? "PDF 解析中..." : "导入 PDF 简历"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,application/pdf"
          onChange={handleFilePick}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-emerald-600">{success}</p>}

      <ImportConfirmDialog
        open={Boolean(candidate)}
        parsedResume={candidate}
        sourceName={sourceName}
        onCancel={closeDialog}
        onConfirmMerge={confirmMerge}
        onConfirmReplace={confirmReplace}
      />
    </>
  );
}
