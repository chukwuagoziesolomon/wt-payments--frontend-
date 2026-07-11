import type { IconType } from "@/components/icons";

export type NavItem = {
  title: string;
  url: string;
  icon?: IconType;
  isActive?: boolean;
};

export type NavGroup = {
  main: NavItem[];
  others: NavItem[];
};
