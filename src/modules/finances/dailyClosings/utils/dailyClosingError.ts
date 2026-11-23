type ErrorWithResponse = {
    response?: { data?: unknown };
    message?: string;
};

export function getDailyClosingErrorMessage(
    error: unknown,
    fallback: string
): string {
    const candidate = error as ErrorWithResponse | null;
    const data = candidate?.response?.data as
        | { message?: string | string[] }
        | string
        | undefined;

    if (typeof data === "string" && data.trim()) return data;

    const message = typeof data === "object" ? data?.message : undefined;

    if (Array.isArray(message) && message.length > 0) {
        return message.join(", ");
    }

    if (typeof message === "string" && message.trim()) return message;

    if (candidate?.message && candidate.message !== "Request failed with status code 403") {
        return candidate.message;
    }

    return fallback;
}
