/**
 * Centralized error handling utilities
 * Provides consistent error formatting and handling across the app
 */

export type AppError = {
  message: string;
  code?: string;
  field?: string;
};

/**
 * Format an error into a user-friendly message
 */
export const formatError = (error: unknown): AppError => {
  // Better Auth error format
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return {
      message: error.message,
      code:
        "code" in error && typeof error.code === "string"
          ? error.code
          : undefined,
      field:
        "field" in error && typeof error.field === "string"
          ? error.field
          : undefined,
    };
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message: "Network error. Please check your connection and try again.",
      code: "NETWORK_ERROR",
    };
  }

  // Generic Error object
  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    };
  }

  // Fallback
  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
};

/**
 * Wraps an async function and returns [error, data] tuple
 * Similar to Go's error handling pattern
 *
 * @example
 * const [error, data] = await handleAsync(() => fetchUser(id));
 * if (error) {
 *   setError(error.message);
 *   return;
 * }
 * setUser(data);
 */
export const handleAsync = async <T>(
  fn: () => Promise<T>,
): Promise<[AppError, null] | [null, T]> => {
  try {
    const data = await fn();
    return [null, data];
  } catch (error) {
    return [formatError(error), null];
  }
};

/**
 * Common error messages for consistency
 */
export const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  SERVER: "Server error. Please try again later.",
  UNKNOWN: "An unexpected error occurred. Please try again.",
} as const;
