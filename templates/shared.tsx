import { ResumeData } from "@/types/resume";

export function DateRange({ startDate, endDate, date }: { startDate?: string; endDate?: string; date?: string }) {
  if (date) return <span>{date}</span>;
  if (!startDate && !endDate) return null;
  return (
    <span>
      {startDate || ""} {startDate || endDate ? "-" : ""} {endDate || ""}
    </span>
  );
}

export function SectionTitle({ title, className = "" }: { title: string; className?: string }) {
  return <h3 className={`mb-2 mt-4 text-sm font-semibold uppercase tracking-wide ${className}`}>{title}</h3>;
}

export function renderCommonSections(data: ResumeData, titleClass = "") {
  const experienceList = Array.isArray(data.experience) ? data.experience : [];
  const projectList = Array.isArray(data.projects) ? data.projects : [];
  const skillList = Array.isArray(data.skills) ? data.skills : [];
  const customSectionList = Array.isArray(data.customSections) ? data.customSections : [];

  return (
    <>
      {!!data.education.length && (
        <section>
          <SectionTitle title="教育经历" className={titleClass} />
          <div className="space-y-2">
            {data.education.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between text-sm">
                  <p className="font-medium">
                    {item.title} {item.degree ? `| ${item.degree}` : ""} {item.major ? `| ${item.major}` : ""}
                  </p>
                  <DateRange startDate={item.startDate} endDate={item.endDate} />
                </div>
                {item.description && <p className="text-xs opacity-90">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {!!experienceList.length && (
        <section>
          <SectionTitle title="实习/工作经历" className={titleClass} />
          <div className="space-y-3">
            {experienceList.map((item) => {
              const achievements = Array.isArray(item.achievements) ? item.achievements : [];
              return (
              <div key={item.id}>
                <div className="flex justify-between text-sm">
                  <p className="font-medium">
                    {item.title} {item.role ? `| ${item.role}` : ""}
                  </p>
                  <DateRange startDate={item.startDate} endDate={item.endDate} />
                </div>
                {item.description && <p className="text-xs opacity-90">{item.description}</p>}
                {!!achievements.length && (
                  <ul className="ml-4 mt-1 list-disc space-y-1 text-xs">
                    {achievements.map((point, idx) => (
                      <li key={`${item.id}-a-${idx}`}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
            })}
          </div>
        </section>
      )}
      {!!projectList.length && (
        <section>
          <SectionTitle title="项目经历" className={titleClass} />
          <div className="space-y-3">
            {projectList.map((item) => {
              const highlights = Array.isArray(item.highlights) ? item.highlights : [];
              return (
              <div key={item.id}>
                <div className="flex justify-between text-sm">
                  <p className="font-medium">
                    {item.title} {item.role ? `| ${item.role}` : ""}
                  </p>
                  <DateRange startDate={item.startDate} endDate={item.endDate} />
                </div>
                {item.description && <p className="text-xs opacity-90">{item.description}</p>}
                {!!highlights.length && (
                  <ul className="ml-4 mt-1 list-disc space-y-1 text-xs">
                    {highlights.map((point, idx) => (
                      <li key={`${item.id}-h-${idx}`}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
            })}
          </div>
        </section>
      )}
      {!!skillList.length && (
        <section>
          <SectionTitle title="技能清单" className={titleClass} />
          <div className="space-y-1 text-xs">
            {skillList.map((skill) => (
              <p key={skill.id}>
                <span className="font-medium">{skill.category}：</span>
                {(Array.isArray(skill.items) ? skill.items : []).join(" / ")}
              </p>
            ))}
          </div>
        </section>
      )}
      {!!data.awards.length && (
        <section>
          <SectionTitle title="获奖经历" className={titleClass} />
          <ul className="ml-4 list-disc space-y-1 text-xs">
            {data.awards.map((item) => (
              <li key={item.id}>
                {item.title}
                {item.date ? `（${item.date}）` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!data.activities.length && (
        <section>
          <SectionTitle title="校园/社团经历" className={titleClass} />
          <ul className="ml-4 list-disc space-y-1 text-xs">
            {data.activities.map((item) => (
              <li key={item.id}>
                {item.title}
                {item.role ? ` - ${item.role}` : ""}
                {item.date ? `（${item.date}）` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!data.certifications.length && (
        <section>
          <SectionTitle title="证书/语言成绩" className={titleClass} />
          <ul className="ml-4 list-disc space-y-1 text-xs">
            {data.certifications.map((item) => (
              <li key={item.id}>
                {item.title}
                {item.score ? ` - ${item.score}` : ""}
                {item.date ? `（${item.date}）` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
      {customSectionList.map((section) => (
        <section key={section.id}>
          <SectionTitle title={section.title} className={titleClass} />
          <div className="space-y-2 text-xs">
            {(Array.isArray(section.items) ? section.items : []).map((item) => (
              <div key={item.id}>
                <p className="font-medium">
                  {item.title} {item.subtitle ? `| ${item.subtitle}` : ""}
                </p>
                {item.date && <p>{item.date}</p>}
                {item.description && <p>{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
