import { cn } from "@/lib/utils";

type PhotoTone = "light" | "blue" | "dark" | "muted";

interface ResumePhotoFrameProps {
  src?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  placeholderText?: string;
  tone?: PhotoTone;
}

const toneClassMap: Record<PhotoTone, string> = {
  light: "border-slate-200 bg-slate-100 text-slate-500",
  blue: "border-white/40 bg-blue-500/20 text-blue-100",
  dark: "border-slate-600 bg-slate-800 text-slate-300",
  muted: "border-border bg-muted text-muted-foreground"
};

export function ResumePhotoFrame({
  src,
  alt = "简历照片",
  className,
  imageClassName,
  placeholderText = "证件照",
  tone = "light"
}: ResumePhotoFrameProps) {
  return (
    <div
      className={cn(
        "h-[160px] w-[120px] overflow-hidden rounded-lg border shadow-sm",
        toneClassMap[tone],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn("h-full w-full object-cover object-center", imageClassName)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs">{placeholderText}</div>
      )}
    </div>
  );
}
