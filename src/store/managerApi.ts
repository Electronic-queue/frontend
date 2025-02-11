import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "src/store/store"; // Adjust path based on your project structure

import { ManagerRecord } from "src/types/managerApiTypes";
import { apiBaseUrl } from "src/config/api.config";

export const managerApi = createApi({
    reducerPath: "managerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: apiBaseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.user?.token;

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
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
                body: {
                    ...newRecord,
                    CreatedBy: 2,
                },
            }),
        }),

        getRecordIdByToken: builder.query<
            { recordId: number; connectionId: string },
            void
        >({
            query: () => ({
                url: `Record/getrecordidbytoken`,
                params: { "api-version": "1" },
            }),
        }),
    }),
});

export const {
    useGetRecordListByManagerQuery,
    useGetServiceListQuery,
    useCreateRecordMutation,
    useGetRecordIdByTokenQuery,
} = managerApi;
