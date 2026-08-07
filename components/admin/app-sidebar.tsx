'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CarFront,
  CreditCard,
  FileSearch,
  Gauge,
  LayoutDashboard,
  MessageSquareWarning,
  Settings2,
  ShieldCheck,
  Star,
  Truck,
  Users,
  WalletCards,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BrandLink } from '@/components/brand-link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type NavigationItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

const primaryItems: NavigationItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Operations', href: '/admin/operations', icon: Gauge },
];
const managementItems: NavigationItem[] = [
  { title: 'Drivers', href: '/admin/drivers', icon: Users },
  { title: 'Vehicles', href: '/admin/vehicles', icon: CarFront },
  { title: 'Customers', href: '/admin/customers', icon: Users },
  { title: 'Trips', href: '/admin/trips', icon: Truck },
  { title: 'Payments', href: '/admin/payments', icon: CreditCard },
  { title: 'Wallets', href: '/admin/wallets', icon: WalletCards },
  {
    title: 'Disputes',
    href: '/admin/disputes',
    icon: MessageSquareWarning,
    badge: '4',
  },
  { title: 'Reviews', href: '/admin/reviews', icon: Star },
];
const systemItems: NavigationItem[] = [
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Platform Settings', href: '/admin/settings', icon: Settings2 },
  { title: 'Audit Logs', href: '/admin/audit', icon: FileSearch },
  { title: 'Administrators', href: '/admin/administrators', icon: ShieldCheck },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname.startsWith(href);
  const renderItems = (items: NavigationItem[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={isActive(item.href)}>
          <Link href={item.href}>
            <item.icon className="size-4" />
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <Badge
                variant="secondary"
                className="h-5 min-w-5 justify-center px-1 text-[10px]"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarHeader>
        <BrandLink className="h-9 rounded-md px-2 text-foreground" />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>{renderItems(primaryItems)}</SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>{renderItems(managementItems)}</SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>{renderItems(systemItems)}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="mb-3" />
        <div className="flex items-center gap-2 px-2 py-1">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
              AO
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-xs">
            <p className="truncate font-medium text-foreground">Admin Office</p>
            <p className="truncate text-muted-foreground">
              Super administrator
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
