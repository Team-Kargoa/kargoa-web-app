'use client';

import { useActionState, useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';

import { rejectDriverAction, type DriverActionState } from './actions';

export type RejectDriverFormProps = {
  id: string;
};

const REASON_MAX_LENGTH = 500;
const initialState: DriverActionState = { error: null };

/**
 * Rejecting a driver application is destructive and irreversible, so this
 * is deliberately not a single button. Reject Application only reveals a
 * required reason field; the confirm button stays disabled until a
 * non-blank reason is typed, mirroring the server's own validation (an
 * empty reason returns HTTP 422 — verified live 2026-08-07) so the error
 * path is unreachable by mistake rather than merely reported after the
 * fact.
 */
export function RejectDriverForm({ id }: RejectDriverFormProps) {
  const boundAction = rejectDriverAction.bind(null, id);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialState,
  );
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const canSubmit = reason.trim().length > 0;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-14 flex-1 rounded-xl border-2 border-outline font-semibold text-outline transition-all hover:bg-muted active:scale-[0.98]"
      >
        Reject Application
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-4"
    >
      <label
        htmlFor={`reject-reason-${id}`}
        className="text-sm font-semibold text-foreground"
      >
        Reason for rejection
      </label>
      <textarea
        id={`reject-reason-${id}`}
        name="reason"
        required
        maxLength={REASON_MAX_LENGTH}
        rows={3}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Explain why this application is being rejected..."
        className="rounded-xl border border-border bg-background p-3 text-sm text-foreground"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setReason('');
          }}
          className="h-14 flex-1 rounded-xl border border-border font-semibold text-muted-foreground transition-all hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending || !canSubmit}
          className="flex h-14 flex-[2] items-center justify-center gap-2 rounded-xl bg-destructive font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{pending ? 'Rejecting…' : 'Confirm Rejection'}</span>
          {pending ? (
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <XCircle aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
