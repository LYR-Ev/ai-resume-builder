"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResumePhotoFrame } from "@/components/resume-photo-frame";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

interface ResumePhotoUploaderProps {
  preview: string;
  onPhotoChange: (payload: { dataUrl: string; fileName: string; mimeType: string }) => void;
  onClear: () => void;
}

export function ResumePhotoUploader({ preview, onPhotoChange, onClear }: ResumePhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("只允许上传 JPG/PNG 图片。");
      event.target.value = "";
      return;
    }

    if (file.size >= MAX_PHOTO_SIZE) {
      setError("图片大小必须小于 2MB。");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setError("图片读取失败，请重试。");
        return;
      }
      setError("");
      onPhotoChange({ dataUrl: result, fileName: file.name, mimeType: file.type });
      event.target.value = "";
    };
    reader.onerror = () => {
      setError("图片读取失败，请重试。");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">简历照片</p>
      <p className="text-xs text-muted-foreground">
        建议上传正面免冠照片，系统将按 3:4 证件照比例居中裁剪，导出 PDF 与预览保持一致。
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          {preview ? "重新上传照片" : "上传照片（JPG/PNG，小于 2MB）"}
        </Button>
        {preview && (
          <Button type="button" variant="ghost" onClick={onClear}>
            清除照片
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <ResumePhotoFrame
        src={preview}
        alt="简历照片预览"
        tone="muted"
        placeholderText="暂无照片"
      />
    </div>
  );
}
