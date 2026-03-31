"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/store/resume-store";

export function SkillsEditor() {
  const skills = useResumeStore((state) => state.resume.skills);
  const addListItem = useResumeStore((state) => state.addListItem);
  const updateListItem = useResumeStore((state) => state.updateListItem);
  const removeListItem = useResumeStore((state) => state.removeListItem);
  const moveListItem = useResumeStore((state) => state.moveListItem);

  return (
    <div className="space-y-3">
      {skills.map((skillGroup, idx) => (
        <div key={skillGroup.id} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">技能组 #{idx + 1}</span>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => moveListItem("skills", skillGroup.id, "up")}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => moveListItem("skills", skillGroup.id, "down")}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => removeListItem("skills", skillGroup.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label>分类名</Label>
            <Input
              value={skillGroup.category}
              onChange={(e) => updateListItem("skills", skillGroup.id, { category: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>技能标签（逗号分隔）</Label>
            <Input
              value={skillGroup.items.join(", ")}
              onChange={(e) =>
                updateListItem("skills", skillGroup.id, {
                  items: e.target.value
                    .split(",")
                    .map((it) => it.trim())
                    .filter(Boolean)
                })
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {skillGroup.items.map((item) => (
              <Badge key={item} className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => addListItem("skills")}>
        <Plus className="mr-2 h-4 w-4" />
        新增技能组
      </Button>
    </div>
  );
}
