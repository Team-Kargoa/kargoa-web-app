import { formatXaf, formatPhone } from './format';

describe('formatXaf', () => {
  it('groups thousands and appends the currency code', () => {
    expect(formatXaf(1240000)).toBe('1,240,000 XAF');
  });

  it('accepts the decimal strings the API returns', () => {
    expect(formatXaf('1500.00')).toBe('1,500 XAF');
  });

  it('renders zero without a sign', () => {
    expect(formatXaf(0)).toBe('0 XAF');
  });

  it('guards against empty string input', () => {
    expect(formatXaf('')).toBe('—');
  });

  it('guards against undefined input', () => {
    expect(formatXaf(undefined as unknown as number)).toBe('—');
  });
});

describe('formatPhone', () => {
  it('spaces a Cameroon E.164 number for display', () => {
    expect(formatPhone('+237691234567')).toBe('+237 6 91 23 45 67');
  });

  it('returns unrecognised input unchanged', () => {
    expect(formatPhone('12345')).toBe('12345');
  });
});
