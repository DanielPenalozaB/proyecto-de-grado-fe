import { LucideIconData } from "lucide-angular";

export interface SidebarLink {
  icon: LucideIconData;
  label: string;
  url?: string;
  class?: string;
  isActive?: boolean;
  children?: SidebarLink[];
  isExpanded?: boolean;
}