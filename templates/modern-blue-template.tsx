import { ResumeData } from "@/types/resume";
import { renderCommonSections } from "@/templates/shared";
import { ResumePhotoFrame } from "@/components/resume-photo-frame";

export function ModernBlueTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="resume-page bg-white p-10 text-slate-900">
      <header className="flex items-start justify-between gap-4 rounded-xl bg-blue-600 p-6 text-white">
        <div>
          <h1 className="text-3xl font-bold">{data.basics.name || "你的姓名"}</h1>
          <div className="mt-2 space-y-1">
            {data.basics.targetRole && <p className="text-sm opacity-95">求职意向：{data.basics.targetRole}</p>}
            {data.basics.phone && <p className="text-xs opacity-90">电话：{data.basics.phone}</p>}
            {data.basics.email && <p className="text-xs opacity-90">邮箱：{data.basics.email}</p>}
            {data.basics.location && <p className="text-xs opacity-90">所在城市：{data.basics.location}</p>}
            {data.basics.github && <p className="text-xs opacity-90">GitHub：{data.basics.github}</p>}
            {data.basics.website && <p className="text-xs opacity-90">个人网站：{data.basics.website}</p>}
          </div>
        </div>
        <ResumePhotoFrame
          src={data.basics.photoDataUrl}
          alt={`${data.basics.name || "候选人"}照片`}
          placeholderText="上传证件照"
          tone="blue"
        />
      </header>
      <section className="mt-4 rounded-lg bg-blue-50 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">个人简介</h2>
        <p className="text-sm leading-relaxed text-slate-700">{data.summary}</p>
      </section>
      {renderCommonSections(data, "text-blue-700")}
    </div>
  );
}
