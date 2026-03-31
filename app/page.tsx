"use client";

import { useEffect, useRef } from "react";
import { TopBar } from "@/components/topbar";
import { Card } from "@/components/ui/card";
import { EditorPanel } from "@/editor/editor-panel";
import { ResumePreview } from "@/preview/resume-preview";
import { useResumeStore } from "@/store/resume-store";

export default function HomePage() {
  const hydrated = useResumeStore((state) => state.hydrated);
  const setHydrated = useResumeStore((state) => state.setHydrated);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  if (!hydrated) {
    return <div className="p-8 text-sm text-muted-foreground">简历数据加载中...</div>;
  }

  return (
    <main className="min-h-screen">
      <TopBar previewRef={previewRef} />
      <div className="grid h-[calc(100vh-88px)] grid-cols-1 gap-4 p-4 xl:grid-cols-[46%_54%]">
        <Card className="h-full overflow-auto p-4">
          <EditorPanel />
        </Card>
        <div className="h-full overflow-auto">
          <ResumePreview ref={previewRef} />
        </div>
      </div>
    </main>
  );
}
