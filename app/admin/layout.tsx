import { AdminHeader } from '@/components/admin/admin-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/app-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
