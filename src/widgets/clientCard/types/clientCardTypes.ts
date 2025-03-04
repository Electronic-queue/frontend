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
    onRedirect: (serviceIdRedirect: number) => void;
    onAccept: () => void;
    onComplete: () => void;
    callNext: () => void;
    status: "idle" | "called" | "accepted" | "redirected";
    loading: boolean;
}

export interface ServiceData {
    id: number;
    service: string;
}
