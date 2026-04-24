declare module "lucide-react" {
  import * as React from "react";

  export type Icon = React.ForwardRefExoticComponent<
    React.Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      color?: string;
      size?: string | number;
      strokeWidth?: string | number;
      absoluteStrokeWidth?: boolean;
    } & React.RefAttributes<SVGSVGElement>
  >;

  export const Download: Icon;
  export const FileUp: Icon;
  export const FileJson: Icon;
  export const FileText: Icon;
  export const UploadCloud: Icon;
  export const RefreshCw: Icon;
  export const WandSparkles: Icon;
  export const Moon: Icon;
  export const Sun: Icon;
  export const Sparkles: Icon;
  export const Trash2: Icon;
  export const ArrowUp: Icon;
  export const ArrowDown: Icon;
  export const Plus: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
}
