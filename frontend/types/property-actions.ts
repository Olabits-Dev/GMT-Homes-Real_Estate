export type InspectionBookingFormErrors = {
  message?: string[];
  preferredDate?: string[];
  preferredTime?: string[];
  requesterPhone?: string[];
};

export type InspectionBookingFormState = {
  errors?: InspectionBookingFormErrors;
  message?: string;
  successMessage?: string;
};

export type ActionFeedbackState = {
  message?: string;
  successMessage?: string;
};
