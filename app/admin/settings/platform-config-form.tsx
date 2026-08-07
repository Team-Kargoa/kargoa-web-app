'use client';

import { useActionState, useState } from 'react';
import { Loader2, Save } from 'lucide-react';

import type { PlatformConfig } from '@/lib/api/admin';
import { formatDate, formatPhone } from '@/lib/format';
import { updatePlatformConfigAction, type ConfigActionState } from './actions';

export type PlatformConfigFormProps = {
  config: PlatformConfig;
};

const VALUE_MAX_LENGTH = 255;
const initialState: ConfigActionState = { error: null };

export function PlatformConfigForm({ config }: PlatformConfigFormProps) {
  const boundAction = updatePlatformConfigAction.bind(null, config.key);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialState,
  );
  const [value, setValue] = useState(config.value);
  const dirty = value !== config.value;

  return (
    <li className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="font-mono text-sm font-bold text-foreground">
          {config.key}
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono uppercase text-muted-foreground">
          {config.value_type}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {config.description}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Last updated {formatDate(config.updated_at)}
        {config.updated_by ? (
          <>
            {' '}
            by{' '}
            <span className="font-mono">{formatPhone(config.updated_by)}</span>
          </>
        ) : null}
      </p>

      <form
        action={formAction}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label htmlFor={`config-${config.key}`} className="sr-only">
          Value for {config.key}
        </label>
        <input
          id={`config-${config.key}`}
          name="value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={VALUE_MAX_LENGTH}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
        />
        <button
          type="submit"
          disabled={pending || !dirty}
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{pending ? 'Saving…' : 'Save'}</span>
          {pending ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
        </button>
      </form>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
    </li>
  );
}
