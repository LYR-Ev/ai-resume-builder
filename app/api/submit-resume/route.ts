import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeRaw = formData.get("resume");
    const photo = formData.get("photo");

    if (typeof resumeRaw !== "string") {
      return NextResponse.json({ error: "缺少简历数据。" }, { status: 400 });
    }

    let resume: unknown;
    try {
      resume = JSON.parse(resumeRaw);
    } catch {
      return NextResponse.json({ error: "简历数据不是合法 JSON。" }, { status: 400 });
    }

    let savedPhotoPath = "";
    if (photo instanceof File) {
      if (!ALLOWED_TYPES.includes(photo.type)) {
        return NextResponse.json({ error: "仅支持 JPG/PNG 图片。" }, { status: 400 });
      }
      if (photo.size >= MAX_PHOTO_SIZE) {
        return NextResponse.json({ error: "图片大小必须小于 2MB。" }, { status: 400 });
      }

      const extension = photo.type === "image/png" ? "png" : "jpg";
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${randomUUID()}.${extension}`;
      const target = path.join(uploadDir, filename);
      const buffer = Buffer.from(await photo.arrayBuffer());
      await writeFile(target, buffer);
      savedPhotoPath = `/uploads/${filename}`;
    }

    return NextResponse.json({
      success: true,
      message: "简历提交成功。",
      savedPhotoPath,
      receivedAt: new Date().toISOString(),
      resume
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "服务端处理失败，请稍后重试。" }, { status: 500 });
  }
}
