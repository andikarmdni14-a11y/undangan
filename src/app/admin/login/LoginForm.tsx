"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

export default function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  const error = state.error ?? notice;
  const field =
    "w-full rounded-2xl border border-rose-300 bg-alabaster px-4 py-3 text-body focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20";
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-small font-medium">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-small font-medium">Kata Sandi</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={field} />
      </div>
      <p aria-live="polite" className="min-h-5 text-small text-burgundy">{error}</p>
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full rounded-full bg-burgundy text-body font-medium text-alabaster transition-colors hover:bg-burgundy-700 disabled:opacity-70"
      >
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
