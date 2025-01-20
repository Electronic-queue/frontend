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
    onAccept: () => void;
}

export interface ServiceData {
    id: number;
    service: string;
}
