import { ResumeData } from "@/types/resume";
import { renderCommonSections } from "@/templates/shared";
import { ResumePhotoFrame } from "@/components/resume-photo-frame";

export function DarkProTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="resume-page bg-slate-950 p-10 text-slate-100">
      <header className="flex items-start justify-between gap-4 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-wide">{data.basics.name || "你的姓名"}</h1>
          <div className="mt-2 space-y-1">
            {data.basics.targetRole && <p className="text-sm text-slate-300">求职意向：{data.basics.targetRole}</p>}
            {data.basics.phone && <p className="text-sm text-slate-300">电话：{data.basics.phone}</p>}
            {data.basics.email && <p className="text-sm text-slate-300">邮箱：{data.basics.email}</p>}
            {data.basics.location && <p className="text-xs text-slate-400">所在城市：{data.basics.location}</p>}
            {data.basics.github && <p className="text-xs text-slate-400">GitHub：{data.basics.github}</p>}
            {data.basics.website && <p className="text-xs text-slate-400">个人网站：{data.basics.website}</p>}
          </div>
        </div>
        <ResumePhotoFrame
          src={data.basics.photoDataUrl}
          alt={`${data.basics.name || "候选人"}照片`}
          placeholderText="上传证件照"
          tone="dark"
        />
      </header>
      <section className="mt-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sky-300">个人简介</h2>
        <p className="text-sm leading-relaxed text-slate-200">{data.summary}</p>
      </section>
      {renderCommonSections(data, "text-sky-300")}
    </div>
  );
}
