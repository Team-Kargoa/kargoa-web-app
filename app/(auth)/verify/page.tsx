import { VerifyForm } from './verify-form';
import type { OtpPurpose } from '@/lib/api/types';

type VerifySearchParams = {
  phone?: string;
  purpose?: string;
  role?: string;
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<VerifySearchParams>;
}) {
  const params = await searchParams;
  const phone = params.phone ?? '';
  const purpose = (params.purpose as OtpPurpose | undefined) ?? 'login';

  return <VerifyForm phone={phone} purpose={purpose} role={params.role} />;
}
