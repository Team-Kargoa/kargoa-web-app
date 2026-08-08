'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

import { BrandLink } from '@/components/brand-link';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type NavigationItem =
  | { title: string; href: string; icon: typeof LayoutDashboard }
  | { title: string; href?: undefined; icon: typeof LayoutDashboard };

// admin_fleet_approval_queue/code.html + screen.png: the design's sidebar
// has exactly five items. Only three are backed by a real endpoint today
// (/admin, /admin/drivers, /admin/settings — see task 4.3). Fleet Approvals
// and Financial Oversight have no backend route yet — getFleetApplications
// and the payments module both still fall back to fixtures — so they omit
// `href` and render as non-interactive labels below rather than links to a
// route that doesn't exist on disk. That would be the fifth dead-link
// incident on this project.
const NAV_ITEMS: NavigationItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Fleet Approvals', icon: ClipboardCheck },
  { title: 'Driver Verification', href: '/admin/drivers', icon: ShieldCheck },
  { title: 'Financial Oversight', icon: Wallet },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

/**
 * A route is active on an exact match for /admin (the shell root), or as a
 * prefix for every other section so a nested route (e.g. a future
 * /admin/drivers/[id] detail page) keeps its parent nav item highlighted.
 * Same rule as components/Navbar.tsx's isNavLinkActive.
 */
function isActiveRoute(pathname: string, href: string): boolean {
  return href === '/admin' ? pathname === href : pathname.startsWith(href);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <BrandLink size="sm" className="h-9 rounded-md px-2 text-foreground" />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <nav aria-label="Admin sections">
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              if (!item.href) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <div
                      aria-disabled="true"
                      className="flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-sm font-medium text-muted-foreground/60"
                    >
                      <item.icon className="size-4" aria-hidden="true" />
                      <span className="flex-1 truncate">{item.title}</span>
                    </div>
                  </SidebarMenuItem>
                );
              }

              const active = isActiveRoute(pathname, item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className="data-[active=true]:bg-secondary-container/40 data-[active=true]:font-semibold data-[active=true]:text-secondary-container-foreground"
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                    >
                      <item.icon className="size-4" aria-hidden="true" />
                      <span className="flex-1 truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
