"use client";

import { useActionState } from "react";
import { updateInspectionBookingStatusAction } from "@/app/actions/properties";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { ActionFeedbackState } from "@/types/property-actions";
import type { InspectionBookingStatus } from "@/types/property";

type InspectionBookingStatusFormProps = {
  bookingId: string;
  currentStatus: InspectionBookingStatus;
};

const initialState: ActionFeedbackState = {};

export function InspectionBookingStatusForm({
  bookingId,
  currentStatus,
}: InspectionBookingStatusFormProps) {
  const [state, formAction] = useActionState(
    updateInspectionBookingStatusAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <label className="block space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Booking status
        </span>
        <select
          name="status"
          defaultValue={currentStatus}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-3 text-sm text-[color:var(--foreground)]"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      {state.message ? (
        <p className="text-sm text-[color:#b42318]">{state.message}</p>
      ) : null}
      {state.successMessage ? (
        <p className="text-sm text-[color:var(--foreground)]">{state.successMessage}</p>
      ) : null}
      <FormSubmitButton
        pendingLabel="Updating booking..."
        className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Update booking
      </FormSubmitButton>
    </form>
  );
}
