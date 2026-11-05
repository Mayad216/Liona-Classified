import { ApiError } from "@/lib/api";

const STATUS_MESSAGES: Record<number, string> = {
  401: "Please sign in again.",
  403: "You don't have permission to do that.",
  404: "That item could not be found.",
  422: "Please check your input and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our server. Please try again later.",
  502: "The server is temporarily unavailable. Please try again later.",
  503: "The service is temporarily unavailable. Please try again later.",
};

/** Strip technical details from raw API / server error text. */
export function sanitizeErrorMessage(raw: string): string {
  if (!raw?.trim()) return "";

  const text = raw.trim();

  if (
    text.includes("SQLSTATE") ||
    text.includes("Connection refused") ||
    text.includes("getaddrinfo failed") ||
    text.includes("no such table") ||
    text.includes("Database is unavailable") ||
    text.includes("could not find driver")
  ) {
    return "The server is temporarily unavailable. Please try again in a few minutes.";
  }

  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html") || text.includes("<html")) {
    return "The server returned an unexpected response. Please try again later.";
  }

  if (text.includes("SQLSTATE") && text.includes("(SQL:")) {
    return "A server error occurred. Please try again later.";
  }

  if (text === "Failed to fetch" || text === "NetworkError when attempting to fetch resource.") {
    return "Could not reach the server. Check your connection and try again.";
  }

  return text;
}

/** Turn API failures into short, user-safe messages. */
export function formatApiError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!(err instanceof ApiError) && !(err instanceof Error)) {
    return fallback;
  }

  const status = err instanceof ApiError ? err.status : undefined;
  const raw = err.message;

  try {
    const data = JSON.parse(raw) as {
      message?: string;
      errors?: Record<string, string[] | string>;
    };

    if (data.errors && typeof data.errors === "object") {
      for (const value of Object.values(data.errors)) {
        const msg = Array.isArray(value) ? value[0] : value;
        if (typeof msg === "string" && msg.trim()) {
          return sanitizeErrorMessage(msg);
        }
      }
    }

    if (data.message?.trim()) {
      return sanitizeErrorMessage(data.message);
    }
  } catch {
    /* plain text body */
  }

  const sanitized = sanitizeErrorMessage(raw);
  if (sanitized) return sanitized;

  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }

  return fallback;
}
