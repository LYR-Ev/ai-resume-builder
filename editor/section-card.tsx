"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  extra?: ReactNode;
}

export function SectionCard({ title, collapsed, onToggle, children, extra }: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {extra}
            <Button variant="ghost" size="icon" onClick={onToggle}>
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {!collapsed && <CardContent className="space-y-3">{children}</CardContent>}
    </Card>
  );
}
