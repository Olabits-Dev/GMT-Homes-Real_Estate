import type {
  AuthFormState,
  AuthUser,
  ForgotPasswordFormState,
  PasswordResetFormState,
  PropertyFormState,
  UserRole,
} from "./auth";
import type {
  InspectionBooking,
  InspectionBookingStatus,
  ListingStatus,
  Property,
  PropertyModerationStatus,
  PropertyType,
} from "./property";

export type SignupRequest = {
  email: string;
  name: string;
  password: string;
  role: Exclude<UserRole, "admin">;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthMutationResponse = AuthFormState & {
  user?: AuthUser;
};

export type UserResponse = {
  user: AuthUser | null;
};

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetCompletionRequest = {
  newPassword: string;
  token: string;
};

export type PasswordChangeRequest = {
  currentPassword: string;
  newPassword: string;
  userId: string;
};

export type PasswordMutationResponse = PasswordResetFormState;

export type PasswordResetRequestResponse = ForgotPasswordFormState;

export type BackendCapabilitiesResponse = {
  cloudImageUploadEnabled: boolean;
  inspectionBookingEnabled: boolean;
  moderationEnabled: boolean;
  passwordResetEmailEnabled: boolean;
};

export type PublishPropertyRequest = {
  bathrooms: number;
  bedrooms: number;
  cityLabel: string;
  description: string;
  imageAssets?: Property["imageAssets"];
  location: string;
  price: number;
  status: ListingStatus;
  title: string;
  type: PropertyType;
  userId: string;
};

export type PublishPropertyResponse = PropertyFormState & {
  property?: Property;
};

export type PropertiesResponse = {
  properties: Property[];
};

export type PropertyResponse = {
  property: Property | null;
};

export type InspectionBookingRequest = {
  message: string;
  preferredDate: string;
  preferredTime: string;
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  requesterEmail: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
};

export type InspectionBookingMutationResponse = {
  booking?: InspectionBooking;
  message?: string;
};

export type InspectionBookingsResponse = {
  bookings: InspectionBooking[];
};

export type ModeratePropertyRequest = {
  actorUserId: string;
  moderationNotes?: string;
  moderationStatus: PropertyModerationStatus;
  propertyId: string;
};

export type ModeratePropertyResponse = {
  message?: string;
  property?: Property;
};

export type UpdateInspectionBookingRequest = {
  actorUserId: string;
  bookingId: string;
  status: InspectionBookingStatus;
};
