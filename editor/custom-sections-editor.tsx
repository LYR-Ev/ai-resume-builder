"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/resume-store";

export function CustomSectionsEditor() {
  const sections = useResumeStore((state) => state.resume.customSections);
  const addCustomSection = useResumeStore((state) => state.addCustomSection);
  const removeCustomSection = useResumeStore((state) => state.removeCustomSection);
  const updateCustomSectionTitle = useResumeStore((state) => state.updateCustomSectionTitle);
  const addCustomItem = useResumeStore((state) => state.addCustomItem);
  const removeCustomItem = useResumeStore((state) => state.removeCustomItem);
  const updateCustomItem = useResumeStore((state) => state.updateCustomItem);

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.id} className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between gap-2">
            <Input
              value={section.title}
              onChange={(e) => updateCustomSectionTitle(section.id, e.target.value)}
              placeholder="模块名称"
            />
            <Button variant="destructive" size="icon" onClick={() => removeCustomSection(section.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {section.items.map((item) => (
            <div key={item.id} className="space-y-2 rounded-md border p-3">
              <div className="space-y-1">
                <Label>标题</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateCustomItem(section.id, item.id, { title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>副标题</Label>
                  <Input
                    value={item.subtitle}
                    onChange={(e) => updateCustomItem(section.id, item.id, { subtitle: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>时间</Label>
                  <Input
                    value={item.date}
                    onChange={(e) => updateCustomItem(section.id, item.id, { date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>描述</Label>
                <Textarea
                  rows={3}
                  value={item.description}
                  onChange={(e) => updateCustomItem(section.id, item.id, { description: e.target.value })}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeCustomItem(section.id, item.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                删除条目
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addCustomItem(section.id)}>
            <Plus className="mr-2 h-4 w-4" />
            新增条目
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={addCustomSection}>
        <Plus className="mr-2 h-4 w-4" />
        新增自定义模块
      </Button>
    </div>
  );
}
