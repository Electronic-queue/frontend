import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "src/store/store";
import { ManagerRecord } from "src/types/managerApiTypes";

export const userApi = createApi({
    
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.user?.token;

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        createRecord: builder.mutation<any, Partial<ManagerRecord>>({
            query: (newRecord) => ({
                url: "Record/create",
                method: "POST",
                params: {
                    "api-version": "1",
                },
                body: {
                    ...newRecord,
                },
            }),
        }),
        getRecordIdByToken: builder.query<
            {
                ticketNumber: number;
                recordId: number;
                connectionId: string;
            },
            void
        >({
            query: () => ({
                url: "Record/getrecordidbytoken",
                params: { "api-version": "1" },
            }),
        }),
        getClientRecordById: builder.query<any, number>({
            query: (recordId) => ({
                url: `Record/GetClientRecord/${recordId}`,
                params: { "api-version": "1" },
            }),
        }),
        updateQueueItem: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: "QueueItem/update",
                method: "POST",
                params: {
                    id,
                    "api-version": "1",
                },
            }),
        }),
        getTicketNumberByToken: builder.query({
            query: () => ({
                url: `Record/get-ticketnumber-bytoken`,
                params: { "api-version": "1" },
            }),
        }),
        getUserProfile: builder.query<any, void>({
            query: () => ({
                url: "User/profile",
                params: { "api-version": "1" },
            }),
        }),
        loginRecord: builder.mutation<any, {iin: string}>({
            query: ({ iin }) => ({
                url: "https://qmain-test.satbayev.university/api/Record/login",
                method: "POST",
                body: { iin: iin },                
            }),
        }),
    }),
});

export const {
    useGetUserProfileQuery,
    useCreateRecordMutation,
    useGetRecordIdByTokenQuery,
    useGetClientRecordByIdQuery,
    useUpdateQueueItemMutation,
    useGetTicketNumberByTokenQuery,
    useLoginRecordMutation
} = userApi;
