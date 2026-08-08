'use client';

import {
  Fragment,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';

const CODE_LENGTH = 6;

export type OtpFieldProps = {
  /** Form field name the joined 6-digit code is submitted under. */
  name: string;
  label?: string;
  /**
   * Zero-based box index after which to render a decorative divider (e.g.
   * `2` renders it between box 3 and box 4). Purely a screen-assembly
   * concern — omitted by default so existing callers are unaffected.
   */
  dividerAfterIndex?: number;
};

/**
 * Six single-character boxes that behave like one field: typing a digit
 * advances focus, Backspace on an empty box moves focus back, and the
 * combined code is mirrored into a single hidden input under `name` so the
 * server action reads it as one plain `code` value from FormData.
 */
export function OtpField({
  name,
  label = 'Verification code',
  dividerAfterIndex,
}: OtpFieldProps) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array(CODE_LENGTH).fill(''),
  );
  const boxRefs = useRef<Array<HTMLInputElement | null>>([]);
  const legendId = useId();

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const digit = event.target.value.replace(/\D/g, '').slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    // The `index < CODE_LENGTH - 1` guard documents intent (don't advance
    // past the last box) but is defensively redundant: boxRefs.current[6]
    // is undefined for a 6-element array, so the optional-chained .focus()
    // below already no-ops at the boundary with or without this check.
    if (digit && index < CODE_LENGTH - 1) {
      boxRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === 'Backspace' && digits[index] === '' && index > 0) {
      boxRefs.current[index - 1]?.focus();
    }
  }

  function handleFocus(event: { target: HTMLInputElement }) {
    event.target.select();
  }

  return (
    <fieldset aria-labelledby={legendId} className="border-0 p-0 m-0">
      <legend
        id={legendId}
        className="font-sans text-sm font-medium text-text-primary mb-2"
      >
        {label}
      </legend>
      <div className="flex items-center gap-2">
        {digits.map((digit, index) => (
          <Fragment key={index}>
            <input
              ref={(el) => {
                boxRefs.current[index] = el;
              }}
              aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              autoComplete="one-time-code"
              value={digit}
              onChange={(event) => handleChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onFocus={handleFocus}
              className="w-12 h-14 md:w-14 md:h-16 text-center font-mono text-2xl rounded-xl border-2 border-border bg-surface text-text-primary transition-all focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/30"
            />
            {dividerAfterIndex === index && (
              <span
                data-testid="otp-divider"
                aria-hidden="true"
                className="w-2 h-[2px] bg-border rounded-full"
              />
            )}
          </Fragment>
        ))}
      </div>
      <input type="hidden" name={name} value={digits.join('')} readOnly />
    </fieldset>
  );
}
