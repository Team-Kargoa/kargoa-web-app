'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Check, LogOut, Moon, Search, Sun } from 'lucide-react';

import { signOut } from '@/app/(auth)/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { UserSummary } from '@/lib/api/types';
import { formatPhone, getInitials } from '@/lib/format';

// Remnants of a deleted app/admin/[section] catch-all route used to live
// here too (operations, vehicles, customers, trips, payments, wallets,
// disputes, reviews, analytics, audit, administrators) — none of those
// routes exist on disk. Only admin, drivers and settings are real pages.
const labels: Record<string, string> = {
  admin: 'Dashboard',
  drivers: 'Drivers',
  settings: 'Platform Settings',
};

export type AdminHeaderProps = {
  /**
   * The signed-in admin, or null if the session cookie is missing,
   * expired, or belongs to a role with no admin dashboard. Resolved
   * server-side in app/admin/layout.tsx via lib/current-user.ts — the
   * access token lives in an httpOnly cookie this Client Component
   * cannot read itself, so the layout (a Server Component) resolves it
   * and passes it down. Mirrors components/Navbar.tsx's DashboardLink.
   */
  user: UserSummary | null;
};

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean).slice(1);
  const pageTitle = labels[segments.at(-1) ?? 'admin'] ?? 'Dashboard';
  const [dark, setDark] = useTheme();
  const identity = adminIdentity(user);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="hidden h-5 w-px bg-border sm:block" />
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground"
            >
              Admin
            </Link>
          </BreadcrumbItem>
          {segments.length > 0 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="relative hidden w-56 lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search platform"
            placeholder="Search anything..."
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Search"
        >
          <Search />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark(!dark)}
          aria-label={dark ? 'Use light theme' : 'Use dark theme'}
        >
          {dark ? <Sun /> : <Moon />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative"
            >
              <Bell />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-3 p-2 text-sm">
              <p className="font-medium">4 drivers need approval</p>
              <p className="text-muted-foreground">
                Two disputes were opened today.
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              <Check /> Mark all as read
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-1.5">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                  {identity.initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`hidden text-sm md:inline ${identity.isPhone ? 'font-mono' : ''}`}
              >
                {identity.displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className={identity.isPhone ? 'font-mono' : undefined}>
                {identity.displayName}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Account settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="h-9 gap-1.5 rounded-xl px-2.5 text-destructive hover:text-destructive"
          >
            <LogOut aria-hidden="true" />
            <span>Sign out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}

type AdminIdentity = {
  displayName: string;
  initials: string;
  isPhone: boolean;
};

/**
 * Derives what the identity block shows: the signed-in admin's full name
 * when set, otherwise their formatted phone number (isPhone: true renders
 * it in font-mono — it's a number, not a name). Mirrors
 * components/Navbar.tsx's DashboardLink so the same rules apply
 * consistently everywhere a signed-in identity is shown. A null user
 * (missing/expired session) renders a "Signed out" fallback instead of
 * crashing — this header can't assume app/admin/layout.tsx always
 * resolved someone.
 */
function adminIdentity(user: UserSummary | null): AdminIdentity {
  if (!user) {
    return { displayName: 'Signed out', initials: '--', isPhone: false };
  }

  const trimmedName = user.full_name.trim();
  if (trimmedName) {
    return {
      displayName: trimmedName,
      initials: getInitials(trimmedName),
      isPhone: false,
    };
  }

  return {
    displayName: formatPhone(user.phone_number),
    initials: user.phone_number.replace(/\D/g, '').slice(-2),
    isPhone: true,
  };
}

function useTheme() {
  const [dark, setDark] = React.useState(false);
  const updateTheme = (value: boolean) => {
    document.documentElement.classList.toggle('dark', value);
    setDark(value);
  };
  return [dark, updateTheme] as const;
}
