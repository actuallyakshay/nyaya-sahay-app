import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Validation helpers ---

const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8, message: 'At least 8 characters' },
  { test: (v: string) => /[A-Z]/.test(v), message: 'At least 1 uppercase letter' },
  { test: (v: string) => /[a-z]/.test(v), message: 'At least 1 lowercase letter' },
  { test: (v: string) => /[0-9]/.test(v), message: 'At least 1 number' },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), message: 'At least 1 special character' },
];

export const validatePassword = (password: string): string[] => {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.message);
};

export const validatePhone = (phone: string): string | null => {
  const cleaned = phone.replace(/\s+/g, '');
  if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
    return 'Enter a valid phone number';
  }
  return null;
};

interface RegistrationFields {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string[];
}

export const validateRegistrationForm = (fields: RegistrationFields): FormErrors => {
  const errors: FormErrors = {};

  if (!fields.name.trim()) errors.name = 'Full name is required';
  if (!fields.email.trim()) errors.email = 'Email is required';

  const phoneError = validatePhone(fields.phone);
  if (!fields.phone.trim()) errors.phone = 'Phone number is required';
  else if (phoneError) errors.phone = phoneError;

  const passwordErrors = validatePassword(fields.password);
  if (!fields.password) errors.password = ['Password is required'];
  else if (passwordErrors.length > 0) errors.password = passwordErrors;

  return errors;
};

export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// --- API error helper ---

export const getApiErrorMessage = (err: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
};
