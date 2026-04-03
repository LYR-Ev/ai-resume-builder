import { cleanResumeText } from "@/lib/resume-cleaner";

export type PdfExtractResult = {
  rawText: string;
  cleanedText: string;
  pageCount: number;
  quality: "good" | "medium" | "poor" | "empty";
  warnings: string[];
};

function evaluateTextQuality(rawText: string, cleanedText: string, pageCount: number): PdfExtractResult["quality"] {
  if (!rawText.trim()) return "empty";

  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const singleCharLines = lines.filter((line) => line.length === 1).length;
  const singleCharRatio = lines.length ? singleCharLines / lines.length : 0;
  const garbledCount = (rawText.match(/\uFFFD/g) ?? []).length;
  const garbledRatio = rawText.length ? garbledCount / rawText.length : 0;

  if (cleanedText.length < 80 || singleCharRatio > 0.4 || garbledRatio > 0.03) return "poor";
  if (cleanedText.length < 220 || singleCharRatio > 0.22 || pageCount > 1) return "medium";
  return "good";
}

function buildWarnings(rawText: string, cleanedText: string, quality: PdfExtractResult["quality"]): string[] {
  const warnings: string[] = [];
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const singleCharLines = lines.filter((line) => line.length === 1).length;
  const singleCharRatio = lines.length ? singleCharLines / lines.length : 0;

  if (cleanedText.length < 120) {
    warnings.push("检测到文本较少，该 PDF 可能为扫描版或图片版。");
  }
  if (singleCharRatio > 0.3) {
    warnings.push("检测到大量单字断行，PDF 排版可能较复杂。");
  }
  if ((rawText.match(/\uFFFD/g) ?? []).length > 0) {
    warnings.push("检测到部分乱码字符，导入结果可能需要手动修正。");
  }
  if (quality === "poor") {
    warnings.push("检测到文本结构较混乱，导入后请重点检查教育/项目/经历模块。");
  }
  return warnings;
}

type PositionedText = {
  str: string;
  x: number;
  y: number;
};

function toPageText(textItems: any[]): string {
  const positioned: PositionedText[] = textItems
    .map((item) => {
      const str = "str" in item ? String(item.str || "").trim() : "";
      const transform = Array.isArray(item.transform) ? item.transform : [0, 0, 0, 0, 0, 0];
      return {
        str,
        x: Number(transform[4] ?? 0),
        y: Number(transform[5] ?? 0)
      };
    })
    .filter((item) => item.str.length > 0);

  if (!positioned.length) return "";

  positioned.sort((a, b) => {
    if (Math.abs(a.y - b.y) <= 2) return a.x - b.x;
    return b.y - a.y;
  });

  const lineGroups: PositionedText[][] = [];
  for (const item of positioned) {
    const lastGroup = lineGroups[lineGroups.length - 1];
    if (!lastGroup) {
      lineGroups.push([item]);
      continue;
    }
    const avgY = lastGroup.reduce((sum, current) => sum + current.y, 0) / lastGroup.length;
    if (Math.abs(item.y - avgY) <= 2.2) {
      lastGroup.push(item);
    } else {
      lineGroups.push([item]);
    }
  }

  const lines = lineGroups.map((group) => group.sort((a, b) => a.x - b.x).map((item) => item.str).join(" ").trim());
  return lines.filter(Boolean).join("\n");
}

export async function extractPdfText(file: File): Promise<PdfExtractResult> {
  if (typeof window === "undefined") {
    throw new Error("PDF 解析仅支持在浏览器环境运行。");
  }

  if (!file || file.type !== "application/pdf") {
    throw new Error("请上传有效的 PDF 文件。");
  }

  const dynamicImport = new Function("url", "return import(url)") as (url: string) => Promise<any>;
  const pdfjs = await dynamicImport("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");

  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }

  let pdf: any;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    pdf = await loadingTask.promise;
  } catch {
    throw new Error("PDF 读取失败，文件可能损坏或加密。");
  }

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    pageTexts.push(toPageText(textContent.items as any[]));
  }

  const rawText = pageTexts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
  const cleanedText = cleanResumeText(rawText);
  const quality = evaluateTextQuality(rawText, cleanedText, pdf.numPages);
  const warnings = buildWarnings(rawText, cleanedText, quality);

  if (process.env.NODE_ENV !== "production") {
    console.log("[PDF Extract Debug]", {
      pageCount: pdf.numPages,
      rawLength: rawText.length,
      cleanedLength: cleanedText.length,
      quality,
      warnings,
      preview: rawText.slice(0, 500)
    });
  }

  return {
    rawText,
    cleanedText,
    pageCount: pdf.numPages,
    quality,
    warnings
  };
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const result = await extractPdfText(file);
  if (result.quality === "empty") {
    throw new Error("未能从 PDF 中提取到可用文字，该文件可能是纯扫描图像。");
  }
  return result.cleanedText || result.rawText;
}
