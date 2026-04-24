"use client";

import { TopBar } from "@/components/topbar";
import { Card } from "@/components/ui/card";
import { EditorPanel } from "@/editor/editor-panel";
import { ResumePreview } from "@/preview/resume-preview";
import { useResumeStore } from "@/store/resume-store";

export default function HomePage() {
  const hydrated = useResumeStore((state) => state.hydrated);

  if (!hydrated) {
    return <div className="p-8 text-sm text-muted-foreground">正在从本机恢复简历数据…</div>;
  }

  return (
    <main className="min-h-screen">
      <TopBar />
      <div className="grid h-[calc(100vh-7.5rem)] min-h-[480px] grid-cols-1 gap-0 border-t p-0 xl:grid-cols-2">
        <Card className="h-full overflow-auto rounded-none border-0 p-4 shadow-sm xl:rounded-l-lg">
          <EditorPanel />
        </Card>
        <div className="h-full overflow-auto border-t bg-muted/20 xl:border-l xl:border-t-0">
          <div className="p-2 lg:p-4">
            <ResumePreview />
          </div>
        </div>
      </div>
    </main>
  );
}
