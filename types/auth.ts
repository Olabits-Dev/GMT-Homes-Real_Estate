export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type StoredUser = AuthUser & {
  passwordHash: string;
  passwordSalt: string;
};

export type SessionPayload = {
  userId: string;
  expiresAt: string;
};

export type AuthFormErrors = {
  confirmPassword?: string[];
  email?: string[];
  name?: string[];
  password?: string[];
};

export type AuthFormState = {
  errors?: AuthFormErrors;
  message?: string;
};

export type PropertyFormErrors = {
  bathrooms?: string[];
  bedrooms?: string[];
  cityLabel?: string[];
  description?: string[];
  location?: string[];
  price?: string[];
  status?: string[];
  title?: string[];
  type?: string[];
};

export type PropertyFormState = {
  errors?: PropertyFormErrors;
  message?: string;
};
