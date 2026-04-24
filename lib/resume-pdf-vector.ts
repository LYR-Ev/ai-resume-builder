import { jsPDF } from "jspdf";
import { ResumeData } from "@/types/resume";
import { buildEmbeddedResumeTextLines, EMBED_LINE_PREFIX } from "@/lib/resume-embed-pdf";

const FONT_CDN = "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf";
const VFS_NAME = "NotoSansSC-Regular.otf";
const FAMILY = "NotoSansSC";
const MARGIN = 14;
const PAGE_H = 297;
const BOTTOM = PAGE_H - MARGIN;

let fontBase64: string | null = null;

function arrayBufferToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + Math.min(chunk, bytes.length - i)) as unknown as number[]
    );
  }
  return btoa(binary);
}

export async function ensureCjkFontOrThrow() {
  if (fontBase64) return;
  const response = await fetch(FONT_CDN, { mode: "cors" });
  if (!response.ok) {
    throw new Error("无法从网络加载中文字体（Noto Sans SC），请检查网络后重试。");
  }
  const buf = await response.arrayBuffer();
  fontBase64 = arrayBufferToBase64(buf);
}

function registerFont(doc: jsPDF) {
  if (!fontBase64) {
    throw new Error("中文字体未准备好。");
  }
  doc.addFileToVFS(VFS_NAME, fontBase64);
  doc.addFont(VFS_NAME, FAMILY, "normal");
  doc.setFont(FAMILY, "normal");
}

function newPageIfNeeded(doc: jsPDF, y: number, lineH: number) {
  if (y + lineH > BOTTOM) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function writeHeading(doc: jsPDF, y: number, text: string) {
  y = newPageIfNeeded(doc, y, 10);
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.setFont(FAMILY, "normal");
  doc.text(text, MARGIN, y);
  return y + 7;
}

function writeBody(doc: jsPDF, y: number, text: string, size = 9.5) {
  doc.setFontSize(size);
  doc.setTextColor(20, 20, 20);
  doc.setFont(FAMILY, "normal");
  const w = 210 - MARGIN * 2;
  const lines = doc.splitTextToSize((text || "").trim() || "—", w);
  const lineH = (size * 0.4) * 0.6 + 0.1;
  for (const line of lines) {
    y = newPageIfNeeded(doc, y, lineH);
    doc.text(line, MARGIN, y, { maxWidth: w });
    y += lineH + 0.2;
  }
  return y + 2;
}

function addPhotoIfAny(doc: jsPDF, yStart: number, data: ResumeData) {
  const url = data.basics.photoDataUrl?.trim();
  if (!url) return yStart;
  const imgW = 32;
  const top = 18;
  const x = 210 - MARGIN - imgW;
  const fmt = data.basics.photoMimeType === "image/png" || url.startsWith("data:image/png") ? "PNG" : "JPEG";
  try {
    doc.addImage(url, fmt, x, top, imgW, imgW * 1.2);
  } catch {
    // 忽略无法嵌入的头像
  }
  return yStart;
}

export async function buildVectorResumePdfBlob(data: ResumeData) {
  await ensureCjkFontOrThrow();
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  registerFont(doc);
  doc.setProperties({
    title: `简历 - ${data.basics.name || "未命名"}`,
    subject: "由 AI Resume Builder 导出的矢量 PDF（含可回导数据区）",
    author: "AI Resume Builder",
    keywords: "AI-Resume-Builder,embed,AIB1",
    creator: "AI Resume Builder"
  });

  let y = MARGIN;
  y = addPhotoIfAny(doc, y, data);

  doc.setFontSize(18);
  doc.setTextColor(15, 15, 15);
  doc.text(data.basics.name || "未命名", MARGIN, y);
  y += 8;

  doc.setFontSize(9.5);
  const metas: string[] = [];
  if (data.basics.targetRole) metas.push(data.basics.targetRole);
  if (data.basics.phone) metas.push(data.basics.phone);
  if (data.basics.email) metas.push(data.basics.email);
  if (data.basics.location) metas.push(data.basics.location);
  if (data.basics.github) metas.push(data.basics.github);
  if (data.basics.website) metas.push(data.basics.website);
  y = writeBody(doc, y, metas.join("  |  "));

  if (data.summary?.trim()) {
    y = writeHeading(doc, y, "个人简介 / Summary");
    y = writeBody(doc, y, data.summary);
  }

  if (data.education.length) {
    y = writeHeading(doc, y, "教育经历");
    for (const e of data.education) {
      const head = [e.title, e.degree, e.major].filter(Boolean).join(" · ");
      const time = [e.startDate, e.endDate].filter(Boolean).join(" - ");
      y = writeBody(doc, y, `${head}${time ? "  " + time : ""}`);
      if (e.description?.trim()) y = writeBody(doc, y, e.description, 8.5);
    }
  }

  if (data.experience.length) {
    y = writeHeading(doc, y, "实习/工作经历");
    for (const e of data.experience) {
      const org = e.organization || "";
      y = writeBody(
        doc,
        y,
        [e.title, e.role, org].filter(Boolean).join(" · ") +
          (e.startDate || e.endDate
            ? `  ${[e.startDate, e.endDate].filter(Boolean).join(" - ")}`
            : "")
      );
      for (const a of e.achievements || []) y = writeBody(doc, y, "• " + a, 8.5);
      if (e.description?.trim() && !e.achievements?.length) y = writeBody(doc, y, e.description, 8.5);
    }
  }

  if (data.projects.length) {
    y = writeHeading(doc, y, "项目经历");
    for (const p of data.projects) {
      y = writeBody(
        doc,
        y,
        [p.title, p.role, p.organization].filter(Boolean).join(" · ") +
          (p.startDate || p.endDate
            ? `  ${[p.startDate, p.endDate].filter(Boolean).join(" - ")}`
            : "")
      );
      for (const h of p.highlights || []) y = writeBody(doc, y, "• " + h, 8.5);
      for (const t of p.technologies || []) y = writeBody(doc, y, t, 8);
      if (p.description?.trim() && !(p.highlights?.length)) y = writeBody(doc, y, p.description, 8.5);
    }
  }

  if (data.skills.length) {
    y = writeHeading(doc, y, "技能");
    for (const s of data.skills) {
      y = writeBody(doc, y, `${s.category}：${s.items.join("、")}`);
    }
  }

  if (data.awards.length) {
    y = writeHeading(doc, y, "获奖与荣誉");
    for (const a of data.awards) {
      y = writeBody(doc, y, [a.title, a.issuer, a.date].filter(Boolean).join(" · ") + (a.description ? "\n" + a.description : ""));
    }
  }

  if (data.activities.length) {
    y = writeHeading(doc, y, "校园/社团/活动");
    for (const a of data.activities) {
      y = writeBody(doc, y, [a.title, a.role, a.date].filter(Boolean).join(" · ") + (a.description ? "\n" + a.description : ""));
    }
  }

  if (data.certifications.length) {
    y = writeHeading(doc, y, "证书与语言");
    for (const c of data.certifications) {
      y = writeBody(
        doc,
        y,
        [c.title, c.score, c.date].filter(Boolean).join(" · ") + (c.description ? "\n" + c.description : "")
      );
    }
  }

  for (const cs of data.customSections) {
    y = writeHeading(doc, y, cs.title || "自定义模块");
    for (const it of cs.items) {
      y = writeBody(
        doc,
        y,
        [it.title, it.subtitle, it.date].filter(Boolean).join(" · ") + (it.description ? "\n" + it.description : "")
      );
    }
  }

  y = writeHeading(doc, y, "附录（可回导数据区）");
  doc.setFontSize(6.5);
  doc.setTextColor(130, 130, 130);
  const hint =
    "以下为机器可读行（以 " +
    EMBED_LINE_PREFIX +
    " 开头），用于本编辑器完整还原结构数据；可在此应用内「导入 PDF 简历」无损还原。";
  y = writeBody(doc, y, hint, 6.5);
  y += 1;

  const embedLines = buildEmbeddedResumeTextLines(data);
  for (const line of embedLines) {
    const isMark = line === "%%AI_RESUME_V1%%" || line === "%%/AI_RESUME_V1%%";
    const lineH = isMark ? 2.2 : 3.3;
    y = newPageIfNeeded(doc, y, lineH);
    doc.setFontSize(isMark ? 4.2 : 3.2);
    /* 浅灰/细字：仍为矢量文字，pdf.js 可稳定抽取，打印时较不抢眼 */
    doc.setTextColor(isMark ? 95 : 190, isMark ? 95 : 190, isMark ? 95 : 190);
    /* AIB1| 行不拆行，保证 pdf.js 抽回后可拼接 base64；过长由 chunk 在编码端控制为单行可放下 */
    y = newPageIfNeeded(doc, y, lineH);
    doc.text(line, MARGIN, y);
    y += lineH;
  }

  return new Blob([doc.output("arraybuffer")], { type: "application/pdf" });
}
