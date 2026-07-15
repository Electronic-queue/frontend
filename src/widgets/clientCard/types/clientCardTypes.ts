export interface ClientData {
    clientNumber: string;
    lastName: string;
    firstName: string;
    patronymic?: string;
    service: string;
    iin: string;
    createdOn?: string;
}

export interface ClientCardProps {
    clientData: ClientData;
    serviceTime: string;
    onRedirect: (serviceIdRedirect: number) => void;
    onAccept: () => void;
    onComplete: () => void;
    recordId: number;
    callNext: (recordId: number) => void;
    status: "idle" | "called" | "accepted" | "redirected";
    isLoading: boolean;
}

export interface ServiceData {
    id: number;
    service: string;
}
