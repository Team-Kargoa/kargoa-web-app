import { AdminHeader } from '@/components/admin/admin-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/app-sidebar';
import { getCurrentUser } from '@/lib/current-user';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The access token lives in an httpOnly cookie AdminHeader (a Client
  // Component) cannot read itself, so this Server Component resolves the
  // signed-in admin and passes it down — same pattern as app/layout.tsx
  // threading user through SiteChrome to Navbar.
  const user = await getCurrentUser();

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AdminHeader user={user} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
