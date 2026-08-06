import { VerifyForm } from './verify-form';
import type { OtpPurpose } from '@/lib/api/types';

type VerifySearchParams = {
  phone?: string;
  purpose?: string;
  role?: string;
};

function isOtpPurpose(value: string | undefined): value is OtpPurpose {
  return value === 'registration' || value === 'login';
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<VerifySearchParams>;
}) {
  const params = await searchParams;
  const phone = params.phone ?? '';
  const purpose = isOtpPurpose(params.purpose) ? params.purpose : 'login';

  return <VerifyForm phone={phone} purpose={purpose} role={params.role} />;
}
