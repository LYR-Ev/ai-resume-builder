import { v4 as uuid } from "uuid";
import {
  ActivityItem,
  AwardItem,
  CertificationItem,
  CustomSection,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  SkillCategory
} from "@/types/resume";

const education: EducationItem[] = [
  {
    id: uuid(),
    title: "华东理工大学",
    degree: "本科",
    major: "软件工程",
    location: "上海",
    startDate: "2019.09",
    endDate: "2023.06",
    description: "主修软件工程、数据结构、数据库系统，GPA 3.7/4.0。"
  }
];

const projects: ProjectItem[] = [
  {
    id: uuid(),
    title: "AI Resume Builder",
    role: "全栈开发",
    organization: "个人项目",
    startDate: "2025.01",
    endDate: "至今",
    description:
      "设计并实现在线简历生成平台，支持实时编辑、模板切换、PDF 导出与本地持久化。",
    technologies: ["Next.js", "TypeScript", "Tailwind", "Zustand"],
    highlights: [
      "负责前端编辑器与预览联动架构设计，提升编辑效率与可维护性。",
      "实现 Markdown/JSON 双向导入导出，降低用户迁移成本。",
      "优化 PDF 导出样式一致性，确保分页与排版可用于真实投递。"
    ]
  }
];

const experience: ExperienceItem[] = [
  {
    id: uuid(),
    title: "某科技公司",
    organization: "前端开发工程师（实习）",
    role: "前端开发",
    location: "上海",
    startDate: "2022.06",
    endDate: "2022.12",
    description: "参与 B 端管理系统开发，完成多个核心页面重构与性能优化。",
    achievements: [
      "负责数据看板模块重构，首屏渲染时间降低约 35%。",
      "实现通用表单组件，减少重复开发，提升迭代效率。",
      "协助推进代码规范与组件文档建设，降低协作沟通成本。"
    ]
  }
];

const skills: SkillCategory[] = [
  {
    id: uuid(),
    category: "前端",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS"]
  },
  {
    id: uuid(),
    category: "工程化",
    items: ["Vite", "Webpack", "ESLint", "Jest"]
  },
  {
    id: uuid(),
    category: "后端与数据库",
    items: ["Node.js", "Express", "PostgreSQL", "Prisma"]
  }
];

const awards: AwardItem[] = [
  {
    id: uuid(),
    title: "全国大学生程序设计竞赛省级二等奖",
    issuer: "教育厅",
    date: "2022.11",
    description: "负责算法实现与工程落地，最终进入决赛并获奖。"
  }
];

const activities: ActivityItem[] = [
  {
    id: uuid(),
    title: "开源社团",
    role: "技术负责人",
    date: "2021-2022",
    description: "组织技术分享与项目协作，沉淀前端工程实践文档。"
  }
];

const certifications: CertificationItem[] = [
  {
    id: uuid(),
    title: "CET-6",
    score: "550",
    date: "2021.12",
    description: "具备良好的英文技术文档阅读与书面表达能力。"
  }
];

const customSections: CustomSection[] = [
  {
    id: uuid(),
    title: "个人亮点",
    items: [
      {
        id: uuid(),
        title: "跨团队协作",
        subtitle: "产品/设计/研发协同",
        date: "长期",
        description: "能够快速对齐目标并推动需求落地，保障项目按时上线。"
      }
    ]
  }
];

export const defaultResumeData: ResumeData = {
  meta: {
    template: "minimal",
    updatedAt: new Date().toISOString()
  },
  basics: {
    name: "张三",
    phone: "138-0000-0000",
    email: "zhangsan@example.com",
    targetRole: "前端开发工程师",
    location: "上海",
    github: "https://github.com/zhangsan",
    website: "https://portfolio.example.com",
    photoDataUrl: "",
    photoFileName: "",
    photoMimeType: ""
  },
  summary:
    "3 年前端开发经验，擅长 React/Next.js 与 TypeScript 技术栈。关注工程效率与用户体验，能够独立完成从需求分析到上线交付的完整流程。",
  education,
  projects,
  experience,
  skills,
  awards,
  activities,
  certifications,
  customSections
};
