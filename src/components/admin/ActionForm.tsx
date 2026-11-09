"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import type { ActionState } from "@/app/admin/actions";

type Props = {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
};

/** Form Server Action dengan pesan sukses/galat yang diumumkan ke pembaca layar. */
export default function ActionForm({ action, children, className = "", resetOnSuccess = true }: Props) {
  const [state, formAction] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <p aria-live="polite" className={`mt-3 text-small ${state.error ? "text-burgundy" : "text-ink-muted"}`}>
        {state.error ?? state.ok}
      </p>
    </form>
  );
}
