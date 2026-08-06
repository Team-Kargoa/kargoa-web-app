'use client';

import { useId, useState, type ChangeEvent } from 'react';

const COUNTRY_PREFIX = '+237';
const MAX_LOCAL_DIGITS = 9;

export type PhoneFieldProps = {
  /** Form field name the complete +237-prefixed number is submitted under. */
  name: string;
  label?: string;
};

/**
 * Pulls the Cameroon local number (up to 9 digits) out of whatever the user
 * left in the field, tolerating attempts to edit or delete the +237 prefix.
 * The `237` country-code digits are stripped only once, from the front, so a
 * user who deletes into the prefix just loses the prefix, not their digits.
 */
function extractLocalDigits(rawValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, '');
  const withoutCountryCode = digitsOnly.startsWith('237')
    ? digitsOnly.slice(3)
    : digitsOnly;
  return withoutCountryCode.slice(0, MAX_LOCAL_DIGITS);
}

/**
 * Single text input whose value is always the complete `+237XXXXXXXXX`
 * number, so the plain `<input name>` submitted by the form already matches
 * the server's `^\+237[62][0-9]{8}$` contract with no client-side assembly
 * step. The +237 prefix is part of the field's own value (not a decorative
 * sibling element), and is re-applied on every change so it cannot be
 * deleted or edited out.
 */
export function PhoneField({ name, label = 'Phone number' }: PhoneFieldProps) {
  const id = useId();
  const [localDigits, setLocalDigits] = useState('');

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setLocalDigits(extractLocalDigits(event.target.value));
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-sans text-sm font-medium text-text-primary mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+2376XXXXXXXX"
        value={`${COUNTRY_PREFIX}${localDigits}`}
        onChange={handleChange}
        className="w-full h-14 px-4 rounded-xl border border-border bg-surface font-mono text-base text-text-primary transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-container/30"
      />
    </div>
  );
}
