import type { AxiosError } from 'axios';

type ApiErrorBody = {
  detail?: string;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

function firstFieldError(data: Record<string, unknown>): string | undefined {
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
      return value[0];
    }
    if (typeof value === 'string' && value) {
      return value;
    }
  }
  return undefined;
}

/** Normalize axios / unknown API errors into a user-facing string. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  const data = axiosError.response?.data;

  if (typeof data === 'string' && data) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string' && data.detail) {
      return data.detail;
    }
    if (typeof data.error === 'string' && data.error) {
      return data.error;
    }
    if (typeof data.message === 'string' && data.message) {
      return data.message;
    }
    const fieldError = firstFieldError(data as Record<string, unknown>);
    if (fieldError) {
      return fieldError;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
