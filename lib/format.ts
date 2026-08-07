const XAF_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const CAMEROON_E164 = /^\+237([62])(\d{2})(\d{2})(\d{2})(\d{2})$/;

export function formatXaf(amount: number | string): string {
  if (amount === '' || !Number.isFinite(Number(amount))) return '—';
  const num = Number(amount);
  return `${XAF_FORMATTER.format(num)} XAF`;
}

/** Two-letter initials (first + last name initial), consistent with the
 * avatar treatment already used in components/fleet/driver-table.tsx. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return `${first}${last}`.toUpperCase();
}

export function formatPhone(e164: string): string {
  const match = CAMEROON_E164.exec(e164);
  if (!match) return e164;
  const [, prefix, ...pairs] = match;
  return `+237 ${prefix} ${pairs.join(' ')}`;
}

/**
 * Masks a Cameroon E.164 number for display on the OTP verification
 * screen: reveals just the leading digit and the final pair, enough for
 * the owner to recognise their own number without exposing it in full.
 */
export function maskPhone(e164: string): string {
  const match = CAMEROON_E164.exec(e164);
  if (!match) return e164;
  const [, prefix, , , , lastPair] = match;
  return `+237 ${prefix} XX XX XX ${lastPair}`;
}
