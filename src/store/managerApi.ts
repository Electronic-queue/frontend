import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ManagerRecord } from "src/types/managerApiTypes";

export const managerApi = createApi({
    reducerPath: "managerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://queue-main-api.satbayevproject.kz/api",
    }),
    endpoints: (builder) => ({
        getRecordListByManager: builder.query<ManagerRecord[], void>({
            query: () => ({
                url: `Manager/recordListByManager`,
                params: {
                    managerId: 3,
                    "api-version": "1",
                },
            }),
        }),
        getServiceList: builder.query<any, void>({
            query: () => ({
                url: `Service`,
                params: {
                    "api-version": "1",
                },
            }),
        }),
        createRecord: builder.mutation<any, Partial<ManagerRecord>>({
            query: (newRecord) => ({
                url: `Record/create`,
                method: "POST",
                params: {
                    "api-version": "1",
                },
                body: newRecord,
            }),
        }),
    }),
});

export const {
    useGetRecordListByManagerQuery,
    useGetServiceListQuery,
    useCreateRecordMutation,
} = managerApi;
