"use client";

import { useActionState } from "react";
import { moderatePropertyAction } from "@/app/actions/properties";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { PropertyModerationStatus } from "@/types/property";

type ModerationFormProps = {
  currentStatus: PropertyModerationStatus;
  propertyId: string;
  propertySlug: string;
};

const initialState = {};

export function ModerationForm({
  currentStatus,
  propertyId,
  propertySlug,
}: ModerationFormProps) {
  const [state, formAction] = useActionState(moderatePropertyAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="propertySlug" value={propertySlug} />
      <label className="block space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Moderation status
        </span>
        <select
          name="moderationStatus"
          defaultValue={currentStatus}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)]"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
        </select>
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Moderation notes
        </span>
        <textarea
          name="moderationNotes"
          rows={3}
          placeholder="Share what changed, what still needs work, or why the listing was rejected."
          className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm leading-7 text-[color:var(--foreground)]"
        />
      </label>
      {state.message ? (
        <p className="text-sm text-[color:#b42318]">{state.message}</p>
      ) : null}
      {state.successMessage ? (
        <p className="text-sm text-[color:var(--foreground)]">{state.successMessage}</p>
      ) : null}
      <FormSubmitButton
        pendingLabel="Saving moderation..."
        className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent-strong)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save moderation
      </FormSubmitButton>
    </form>
  );
}
