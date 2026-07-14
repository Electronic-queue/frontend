import {
    ActiveRequest,
    CreateRecordPayload,
    CreateReviewPayload,
    CreatedRecordResponse,
    QueueType,
    QueueTypesResponse,
    Service,
} from "../model/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getErrorMessage = async (
    response: Response,
    fallbackMessage: string
): Promise<string> => {
    try {
        const contentType =
            response.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
            const data = await response.json();

            return (
                data?.message ||
                data?.title ||
                data?.error ||
                fallbackMessage
            );
        }

        const text = await response.text();

        return text.trim() || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
};

/**
 * Проверяет последнюю активную заявку по ИИН.
 *
 * Новый API возвращает плоский объект ActiveRequest.
 */
export const checkLastRecordByIin = async (
    iin: string
): Promise<ActiveRequest | null> => {
    const response = await fetch(
        `${API_BASE_URL}/Manager/recordLastByStudent?INN=${encodeURIComponent(
            iin
        )}&api-version=v1`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (response.status === 404 || response.status === 204) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                `Не удалось проверить заявку: ${response.status}`
            )
        );
    }

    const text = await response.text();

    if (!text.trim()) {
        return null;
    }

    const data = JSON.parse(text) as ActiveRequest | null;

    if (!data?.recordId) {
        return null;
    }

    return data;
};

export const getQueueTypes = async (): Promise<QueueType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/QueueType?api-version=v1`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                `Не удалось загрузить подразделения: ${response.status}`
            )
        );
    }

    const data: QueueTypesResponse = await response.json();

    return Array.isArray(data?.value) ? data.value : [];
};

export const getServicesByQueueType = async (
    queueTypeId: string
): Promise<Service[]> => {
    const response = await fetch(
        `${API_BASE_URL}/Service?api-version=v1`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(queueTypeId),
        }
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                `Не удалось загрузить услуги: ${response.status}`
            )
        );
    }

    const data: Service[] = await response.json();

    return Array.isArray(data) ? data : [];
};

export const createRecord = async (
    payload: CreateRecordPayload
): Promise<CreatedRecordResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/Record/create?api-version=v1`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                `Не удалось создать заявку: ${response.status}`
            )
        );
    }

    const text = await response.text();

    if (!text.trim()) {
        return {};
    }

    return JSON.parse(text) as CreatedRecordResponse;
};

/**
 * Отказ от активной очереди.
 *
 * recordId передаётся в query.
 * Токен берётся из ответа активной заявки и отправляется как Bearer.
 *
 * Токен нигде не сохраняется.
 */
export const cancelActiveRequest = async (
    recordId: number,
    token: string
): Promise<void> => {
    if (!token.trim()) {
        throw new Error(
            "Не удалось отказаться от очереди: отсутствует токен"
        );
    }

    const response = await fetch(
        `${API_BASE_URL}/QueueItem/update?id=${recordId}&api-version=1`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                `Не удалось отказаться от очереди: ${response.status}`
            )
        );
    }
};

export const createReview = async (
    payload: CreateReviewPayload
): Promise<void> => {
    const response = await fetch(
        `${API_BASE_URL}/Review/create?api-version=1`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                `Не удалось отправить оценку: ${response.status}`
            )
        );
    }
};