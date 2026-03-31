"use client";

import { Sparkles, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { useState } from "react";
import { optimizeResumeBullet } from "@/lib/resume-ai";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type SectionKey =
  | "education"
  | "projects"
  | "experience"
  | "skills"
  | "awards"
  | "activities"
  | "certifications";

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "tags" | "bullet";
  placeholder?: string;
  ai?: boolean;
};

interface Props {
  section: SectionKey;
  title: string;
  fields: FieldConfig[];
}

export function ListSectionEditor({ section, title, fields }: Props) {
  const items = useResumeStore((state) => state.resume[section]) as Array<Record<string, any>>;
  const addListItem = useResumeStore((state) => state.addListItem);
  const updateListItem = useResumeStore((state) => state.updateListItem);
  const removeListItem = useResumeStore((state) => state.removeListItem);
  const moveListItem = useResumeStore((state) => state.moveListItem);
  const [aiLoadingId, setAiLoadingId] = useState("");

  const updateValue = (id: string, key: string, value: string) => {
    if (["technologies", "highlights", "achievements", "items"].includes(key)) {
      const parsed = value
        .split(/[\n,]/)
        .map((v) => v.trim())
        .filter(Boolean);
      updateListItem(section as any, id, { [key]: parsed });
      return;
    }
    updateListItem(section as any, id, { [key]: value });
  };

  const handleAiOptimize = async (id: string, value: string, key: string) => {
    setAiLoadingId(id + key);
    const optimized = optimizeResumeBullet(value);
    updateListItem(section as any, id, { [key]: optimized });
    setAiLoadingId("");
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="rounded-lg border bg-background/60 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">
              {title} #{idx + 1}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => moveListItem(section as any, item.id, "up")}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => moveListItem(section as any, item.id, "down")}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => removeListItem(section as any, item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {fields.map((field) => {
              const rawValue = item[field.key];
              const value = Array.isArray(rawValue) ? rawValue.join(", ") : (rawValue ?? "");
              const isProjectDescription = section === "projects" && field.key === "description";

              return (
                <div
                  key={field.key}
                  className={cn("space-y-1", field.type === "textarea" || field.type === "bullet" ? "md:col-span-2" : "")}
                >
                  <div className="flex items-center justify-between">
                    <Label>{field.label}</Label>
                    {isProjectDescription && (
                      <Badge className="border-blue-300 text-blue-600">{String(value).length} 字</Badge>
                    )}
                  </div>
                  {field.type === "textarea" || field.type === "bullet" ? (
                    <>
                      <Textarea
                        rows={field.type === "bullet" ? 4 : 3}
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(e) => updateValue(item.id, field.key, e.target.value)}
                      />
                      {field.ai && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAiOptimize(item.id, value, field.key)}
                          disabled={aiLoadingId === item.id + field.key || !String(value).trim()}
                        >
                          <Sparkles className="h-4 w-4" />
                          {aiLoadingId === item.id + field.key ? "优化中..." : "AI 优化文案"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Input
                      placeholder={field.placeholder}
                      value={value}
                      onChange={(e) => updateValue(item.id, field.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => addListItem(section as any)}>
        <Plus className="h-4 w-4" />
        新增{title}
      </Button>
    </div>
  );
}
