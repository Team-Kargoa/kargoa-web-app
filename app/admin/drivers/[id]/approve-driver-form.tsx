'use client';

import { useActionState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

import { approveDriverAction, type DriverActionState } from './actions';

export type ApproveDriverFormProps = {
  id: string;
};

const initialState: DriverActionState = { error: null };

/**
 * A single primary button that approves this driver's application.
 * Approving is destructive and irreversible, but the design (and task
 * 4.3) only require the guarded confirmation flow on Reject — see
 * RejectDriverForm for that two-step disclosure.
 */
export function ApproveDriverForm({ id }: ApproveDriverFormProps) {
  const boundAction = approveDriverAction.bind(null, id);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-1 flex-col gap-2 md:flex-[2]"
    >
      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span>{pending ? 'Approving…' : 'Approve Driver'}</span>
        {pending ? (
          <Loader2 aria-hidden="true" className="size-5 animate-spin" />
        ) : (
          <ShieldCheck aria-hidden="true" className="size-5" />
        )}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
