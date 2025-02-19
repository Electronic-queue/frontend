export interface ManagerRecord {
    createdOn: string;
    expectedAcceptanceTime: string | undefined;
    serviceNameRu: string;
    recordId: number;
    firstName: string;
    lastName: string;
    surname: string;
    iin: string;
    serviceId: number;
    startTime: string;
    endTime: string;
    isCreatedByEmployee: boolean;
    createdBy: number;
}
