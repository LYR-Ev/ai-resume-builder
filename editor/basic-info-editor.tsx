"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumePhotoUploader } from "@/editor/resume-photo-uploader";
import { useResumeStore } from "@/store/resume-store";

const basicSchema = z.object({
  name: z.string().min(1, "请输入姓名"),
  phone: z.string().min(6, "请输入有效电话"),
  email: z.string().email("请输入有效邮箱"),
  targetRole: z.string().min(1, "请输入求职意向"),
  location: z.string().min(1, "请输入所在地"),
  github: z.string().optional(),
  website: z.string().optional()
});

type BasicFormData = z.infer<typeof basicSchema>;

export function BasicInfoEditor() {
  const basics = useResumeStore((state) => state.resume.basics);
  const patchBasics = useResumeStore((state) => state.patchBasics);

  const form = useForm<BasicFormData>({
    resolver: zodResolver(basicSchema),
    mode: "onBlur",
    defaultValues: basics
  });

  useEffect(() => {
    form.reset(basics);
  }, [basics, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      patchBasics(value);
    });
    return () => subscription.unsubscribe();
  }, [form, patchBasics]);

  const { register, formState } = form;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="space-y-1 md:col-span-2">
        <ResumePhotoUploader
          preview={basics.photoDataUrl}
          onPhotoChange={({ dataUrl, fileName, mimeType }) =>
            patchBasics({
              photoDataUrl: dataUrl,
              photoFileName: fileName,
              photoMimeType: mimeType
            })
          }
          onClear={() => patchBasics({ photoDataUrl: "", photoFileName: "", photoMimeType: "" })}
        />
      </div>
      <div className="space-y-1">
        <Label>姓名</Label>
        <Input {...register("name")} />
        {formState.errors.name && <p className="text-xs text-red-500">{formState.errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>求职意向</Label>
        <Input {...register("targetRole")} />
        {formState.errors.targetRole && (
          <p className="text-xs text-red-500">{formState.errors.targetRole.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label>电话</Label>
        <Input {...register("phone")} />
        {formState.errors.phone && <p className="text-xs text-red-500">{formState.errors.phone.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>邮箱</Label>
        <Input {...register("email")} />
        {formState.errors.email && <p className="text-xs text-red-500">{formState.errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>所在地</Label>
        <Input {...register("location")} />
      </div>
      <div className="space-y-1">
        <Label>GitHub</Label>
        <Input {...register("github")} placeholder="https://github.com/username" />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label>个人网站</Label>
        <Input {...register("website")} placeholder="https://your-site.com" />
      </div>
    </div>
  );
}
