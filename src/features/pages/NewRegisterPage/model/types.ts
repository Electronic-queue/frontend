export interface StudentFormData {
    lastName: string;
    firstName: string;
    surname: string;
}

export interface ActiveRequest {
    recordId: number;
    iin: string;

    firstName: string;
    lastName: string;
    surName: string;

    ticketNumber: number;
    statusId: number;

    serviceNameRu: string;
    serviceNameKk: string;
    serviceNameEn: string;

    averageExecutionTime: number;
    expectedAcceptanceTime: string | null;
    createdOn: string;

    managerFirstName: string | null;
    managerLastName: string | null;

    windowNumber: number | null;

    /**
     * Храним только в React state.
     * В localStorage токен не записывается.
     */
    token: string;
}

export interface QueueType {
    queueTypeId: string;

    nameRu: string;
    nameKk: string;
    nameEn: string;

    descriptionRu: string | null;
    descriptionKk: string | null;
    descriptionEn: string | null;
}

export interface QueueTypesResponse {
    value: QueueType[];
}

export interface Service {
    serviceId: string;

    nameRu: string;
    nameKk: string;
    nameEn: string;

    descriptionRu: string | null;
    descriptionKk: string | null;
    descriptionEn: string | null;

    averageExecutionTime: number;
    queueTypeId: string;
}

export interface CreateRecordPayload {
    firstName: string;
    lastName: string;
    surname: string;
    iin: string;
    serviceId: string;
    isCreatedByEmployee: boolean;
    createdBy: null;
}

export interface CreatedRecordResponse {
    recordId?: number;
    ticketNumber?: number;

    firstName?: string;
    lastName?: string;
    surname?: string;

    iin?: string;
    serviceId?: string;
    createdOn?: string;

    [key: string]: unknown;
}

export interface CreateReviewPayload {
    recordId: number;
    rating: number;
    content: string;
}

export type RegisterStep =
    | "check-iin"
    | "personal-data"
    | "department-service"
    | "success"
    | "review";