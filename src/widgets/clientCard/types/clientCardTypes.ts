export interface ClientData {
    clientNumber: string;
    lastName: string;
    firstName: string;
    patronymic?: string;
    service: string;
    iin: string;
}

export interface ClientCardProps {
    clientData: ClientData;
    serviceTime: string;
    onRedirect: () => void;
    onAccept: () => void;
    onComplete: () => void;
    callNext: () => void;
    status: "idle" | "called" | "accepted";
    loading: boolean;
}

export interface ServiceData {
    id: number;
    service: string;
}
