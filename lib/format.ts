const XAF_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const CAMEROON_E164 = /^\+237([62])(\d{2})(\d{2})(\d{2})(\d{2})$/;

export function formatXaf(amount: number | string): string {
  return `${XAF_FORMATTER.format(Number(amount))} XAF`;
}

export function formatPhone(e164: string): string {
  const match = CAMEROON_E164.exec(e164);
  if (!match) return e164;
  const [, prefix, ...pairs] = match;
  return `+237 ${prefix} ${pairs.join(' ')}`;
}
