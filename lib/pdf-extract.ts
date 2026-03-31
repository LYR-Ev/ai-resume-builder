export async function extractTextFromPdf(file: File): Promise<string> {
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

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const strings = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .map((line: string) => line.trim())
      .filter(Boolean);
    pageTexts.push(strings.join(" "));
  }

  const fullText = pageTexts.join("\n").replace(/\s+\n/g, "\n").trim();
  if (!fullText) {
    throw new Error("未能从 PDF 中提取到可用文字。");
  }

  return fullText;
}
