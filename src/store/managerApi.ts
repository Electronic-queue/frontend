import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ManagerRecord } from "src/types/managerApiTypes";

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
