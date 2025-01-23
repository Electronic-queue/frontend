import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface ManagerRecord {
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

export const managerApi = createApi({
    reducerPath: "managerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://queue-main-api.satbayevproject.kz/api/Manager",
    }),
    endpoints: (builder) => ({
        getRecordListByManager: builder.query<ManagerRecord[], void>({
            query: () => ({
                url: `recordListByManager`,
                params: {
                    managerId: 3,
                    "api-version": "1",
                },
            }),
        }),
    }),
});

export const { useGetRecordListByManagerQuery } = managerApi;
