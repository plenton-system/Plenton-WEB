import axios from 'axios';

const GENERIC_AXIOS_ERROR_MESSAGE_REGEX = /^Request failed with status code \d{3}$/i;

const isReadableMessage = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

const appendMessages = (target: string[], value: unknown) => {
    if (Array.isArray(value)) {
        target.push(...value.map(String).filter((message) => message.trim().length > 0));
        return;
    }

    if (isReadableMessage(value)) {
        target.push(value);
    }
};

const collectObjectMessages = (value: Record<string, unknown>) => {
    const messages: string[] = [];

    for (const nestedValue of Object.values(value)) {
        appendMessages(messages, nestedValue);
    }

    return messages;
};

const omitKnownProblemDetailsFields = (value: Record<string, unknown>) =>
    Object.fromEntries(
        Object.entries(value).filter(
            ([key]) => !['message', 'title', 'type', 'status', 'traceId', 'instance', 'errors'].includes(key)
        )
    );

/**
 * Extrai uma mensagem legível de um erro de chamada HTTP.
 * Cobre os formatos usados pelo back-end Plenton e do ASP.NET Core:
 *   - `{ message: string }` (ServiceResponse)
 *   - `{ errors: string[] }` (validações customizadas)
 *   - `{ Field: ["msg1", "msg2"], ... }` (ModelState do ASP.NET)
 *   - string crua
 */
export function extractApiErrorMessage(err: unknown, fallback = 'Erro inesperado'): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data;

        if (typeof data === 'string' && data.trim()) return data;
        if (Array.isArray(data) && data.length) {
            return data.map(String).filter((message) => message.trim().length > 0).join('\n');
        }

        if (data && typeof data === 'object') {
            const message = (data as { message?: unknown }).message;
            if (typeof message === 'string' && message.trim()) return message;

            const errors = (data as { errors?: unknown }).errors;
            if (Array.isArray(errors) && errors.length) {
                return errors.map(String).filter((errorMessage) => errorMessage.trim().length > 0).join('\n');
            }

            if (errors && typeof errors === 'object') {
                const nestedMessages = collectObjectMessages(errors as Record<string, unknown>);

                if (nestedMessages.length) return nestedMessages.join('\n');
            }

            // ProblemDetails / ModelState-like root payload with validation arrays on field keys.
            const modelStateMessages = collectObjectMessages(
                omitKnownProblemDetailsFields(data as Record<string, unknown>)
            );
            if (modelStateMessages.length) return modelStateMessages.join('\n');

            const title = (data as { title?: unknown }).title;
            if (typeof title === 'string' && title.trim()) return title;
        }

        if (isReadableMessage(err.message) && !GENERIC_AXIOS_ERROR_MESSAGE_REGEX.test(err.message.trim())) {
            return err.message;
        }

        return fallback;
    }

    if (err instanceof Error && isReadableMessage(err.message)) return err.message;
    return fallback;
}
