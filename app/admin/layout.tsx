import { redirect } from 'next/navigation';

import { AdminHeader } from '@/components/admin/admin-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/admin/app-sidebar';
import { getCurrentUser } from '@/lib/current-user';
import { getAccessToken } from '@/lib/session';
import { listDriverApplications } from '@/lib/api/admin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The access token lives in an httpOnly cookie AdminHeader (a Client
  // Component) cannot read itself, so this Server Component resolves the
  // signed-in admin and passes it down — same pattern as app/layout.tsx
  // threading user through SiteChrome to Navbar.
  //
  // This is also the route gate for the whole /admin tree: without it, an
  // anonymous visitor reaches the console (getCurrentUser was previously
  // only used to render the header), and a signed-in fleet_owner holds a
  // valid token, so every `if (!token) redirect('/signin')` check on the
  // admin subpages passes even though the role is wrong. getCurrentUser is
  // cache()d, so this second call from each subpage's own token check is
  // free.
  const user = await getCurrentUser();
  if (!user) redirect('/signin');
  if (user.role !== 'admin') redirect('/fleet');

  // Real count for the header's notification bell — this used to be a
  // hardcoded "4 drivers need approval" with no data behind it at all.
  // getAccessToken() is cheap (an httpOnly cookie read, no network call),
  // so a second call here alongside every subpage's own is fine — same
  // precedent as getCurrentUser's doc comment on this file.
  const token = await getAccessToken();
  const { meta } = token
    ? await listDriverApplications(token, { status: 'pending' })
    : { meta: { count: 0, page: 1, page_size: 20, total_pages: 0 } };

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AdminHeader user={user} pendingDriverApprovals={meta.count} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
