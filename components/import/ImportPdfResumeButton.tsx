"use client";

import { FileUp, RefreshCw } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { extractPdfText, PdfExtractResult } from "@/lib/pdf-extract";
import { buildEmbeddedImportReport, tryDecodeEmbeddedResumeText } from "@/lib/resume-embed-pdf";
import { ResumeImportReport } from "@/lib/resume-confidence";
import { mergeResumeData, parseResumeTextToResumeDraft } from "@/lib/resume-parser";
import { useResumeStore } from "@/store/resume-store";
import { ResumeData } from "@/types/resume";

export function ImportPdfResumeButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resume = useResumeStore((state) => state.resume);
  const importResume = useResumeStore((state) => state.importResume);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [candidate, setCandidate] = useState<ResumeData | null>(null);
  const [report, setReport] = useState<ResumeImportReport | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [poorExtractResult, setPoorExtractResult] = useState<PdfExtractResult | null>(null);

  const tryEmbedded = (fileName: string, combinedText: string) => {
    const embedded = tryDecodeEmbeddedResumeText(combinedText);
    if (!embedded) return false;
    setCandidate(embedded);
    setReport(buildEmbeddedImportReport(embedded));
    setSourceName(fileName);
    return true;
  };

  const applyHeuristicDraft = (extractResult: PdfExtractResult, fileName: string) => {
    const textForParse = extractResult.cleanedText || extractResult.rawText;
    const draft = parseResumeTextToResumeDraft(textForParse);
    setCandidate(draft.resume);
    setReport(draft.report);
    setSourceName(fileName);
  };

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
      const extractResult = await extractPdfText(file);
      const combined = `${extractResult.rawText}\n${extractResult.cleanedText}`;

      if (tryEmbedded(file.name, combined)) {
        return;
      }

      if (extractResult.quality === "empty") {
        throw new Error("未能从 PDF 中提取到可用文字，该文件可能是扫描版图片或受保护 PDF。");
      }
      if (extractResult.quality === "poor") {
        setPoorExtractResult(extractResult);
        setSourceName(file.name);
        return;
      }
      applyHeuristicDraft(extractResult, file.name);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "PDF 解析失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    setCandidate(null);
    setReport(null);
    setSourceName("");
  };

  const confirmReplace = () => {
    if (!candidate) return;
    importResume({
      ...candidate,
      meta: { ...candidate.meta, updatedAt: new Date().toISOString() }
    });
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

      {candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xl space-y-4 p-5">
            <h3 className="text-lg font-semibold">导入确认</h3>
            <p className="text-sm text-muted-foreground">
              已完成对 <span className="font-medium text-foreground">{sourceName}</span> 的解析，检测到以下内容：
            </p>
            {report && !report.lowConfidenceFields.length && report.name.confidence >= 0.99 && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
                识别为带内嵌数据的本应用导出 PDF，可完整还原简历结构与内容（含照片等字段）。
              </p>
            )}
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>姓名：{candidate.basics.name || "未识别"}{report ? ` (${Math.round(report.name.confidence * 100)}%)` : ""}</p>
              <p>邮箱：{candidate.basics.email || "未识别"}{report ? ` (${Math.round(report.email.confidence * 100)}%)` : ""}</p>
              <p>电话：{candidate.basics.phone || "未识别"}{report ? ` (${Math.round(report.phone.confidence * 100)}%)` : ""}</p>
              <p>求职意向：{candidate.basics.targetRole || "未识别"}</p>
              <p>教育经历：{candidate.education.length} 条</p>
              <p>项目经历：{candidate.projects.length} 条</p>
              <p>工作经历：{candidate.experience.length} 条</p>
              <p>技能清单：{candidate.skills.reduce((n, s) => n + s.items.length, 0)} 项</p>
            </div>
            {!!report?.lowConfidenceFields.length && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                低置信度字段：{report.lowConfidenceFields.join("、")}。建议导入后重点核对。
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={closeDialog}>
                取消导入
              </Button>
              <Button variant="outline" onClick={confirmMerge}>
                合并到当前简历
              </Button>
              <Button onClick={confirmReplace}>覆盖当前简历</Button>
            </div>
          </Card>
        </div>
      )}

      {poorExtractResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xl space-y-4 p-5">
            <h3 className="text-lg font-semibold">PDF 提取质量提醒</h3>
            <p className="text-sm text-muted-foreground">
              检测到该 PDF 文本提取质量较低，可能为扫描版、双栏简历或复杂排版。你仍可以继续导入，后续手动修正。
            </p>
            <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              <p>页数：{poorExtractResult.pageCount}</p>
              <p>原始文本长度：{poorExtractResult.rawText.length}</p>
              <p>清洗后文本长度：{poorExtractResult.cleanedText.length}</p>
              {poorExtractResult.warnings.map((warning, idx) => (
                <p key={`${warning}-${idx}`}>- {warning}</p>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPoorExtractResult(null)}>
                取消
              </Button>
              <Button
                onClick={() => {
                  if (!sourceName || !poorExtractResult) return;
                  applyHeuristicDraft(poorExtractResult, sourceName);
                  setPoorExtractResult(null);
                }}
              >
                继续尝试导入
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
