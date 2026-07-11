import Image from "next/image";
import Link from "next/link";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navigationItems } from "@/constants/navigation";
import Icons from "../icons";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-0">
        <Link href="/">
          <Image
            alt="Logo"
            className="ml-[26px]"
            height={56}
            src="/images/logo.svg"
            width={132}
          />
        </Link>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <hr className="-mt-px border-border border-t" />
        <SidebarMenu className="px-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="px-[22px]" size="lg">
              <a href="/">
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Elgoauto</span>
                  <span className="">#1234</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <hr className="-mt-px border-border border-t" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="mt-8 gap-2 px-3">
          {navigationItems.main.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons];
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="group/menu-button h-9 gap-2 rounded-md bg-gradient-to-r px-4 py-2.5 font-medium font-sans text-[16px]/[120%] tracking-[4%] hover:bg-transparent hover:from-muted hover:to-muted/40 data-[active=true]:bg-muted data-[active=true]:font-bold data-[active=true]:text-primary [&>svg]:size-auto"
                  isActive={item.isActive}
                >
                  <a href={item.url}>
                    {item.icon && (
                      <Icon className="size-6 text-secondary-foreground group-data-[active=true]/menu-button:text-primary" />
                    )}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <hr className="-mt-px mx-2 border-border border-t" />
        <SidebarMenu>
          {navigationItems.others.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons];

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton className="h-9 gap-3 rounded-md bg-gradient-to-r font-medium hover:bg-transparent hover:from-sidebar-accent hover:to-sidebar-accent/40 data-[active=true]:from-primary/20 data-[active=true]:to-primary/5 [&>svg]:size-auto">
                  <Icon
                    aria-hidden="true"
                    className="text-muted-foreground/60 group-data-[active=true]/menu-button:text-primary"
                    size={22}
                  />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
