import { notFound } from 'next/navigation';
import { ModuleShell } from '@/components/admin/module-shell';

const sections = [
  'operations',
  'drivers',
  'vehicles',
  'customers',
  'trips',
  'payments',
  'wallets',
  'disputes',
  'reviews',
  'analytics',
  'settings',
  'audit',
  'administrators',
];

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export default async function AdminModulePage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <ModuleShell section={section} />;
}
