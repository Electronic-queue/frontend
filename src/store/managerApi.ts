import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "src/store/store";
import { ManagerRecord } from "src/types/managerApiTypes";
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

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
                url: "Manager/recordListByManager",
                params: {
                    "api-version": "1",
                },
            }),
        }),
        getServiceList: builder.query<any, void>({
            query: () => ({
                url: "Service",
                params: {
                    "api-version": "1",
                },
            }),
        }),
        getManagerId: builder.query<number, void>({
            query: () => ({
                url: "Manager/GetManagerId",
                params: {
                    "api-version": "1",
                },
            }),
        }),
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
        getRecordById: builder.query<any, number>({
            query: (recordId) => ({
                url: `Record/${recordId}`,
                params: { "api-version": "1" },
            }),
        }),
        getClientRecordById: builder.query<any, number>({
            query: (recordId) => ({
                url: `Record/GetClientRecord/${recordId}`,
                params: { "api-version": "1" },
            }),
        }),
        getRecordIdByToken: builder.query<
            { recordId: number; connectionId: string },
            void
        >({
            query: () => ({
                url: "Record/getrecordidbytoken",
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

        getServiceById: builder.query<any, number>({
            query: (serviceId) => ({
                url: `Service/${serviceId}`,
                params: { "api-version": "1" },
            }),
        }),

        acceptClient: builder.mutation<any, {}>({
            query: ({}) => ({
                url: "Manager/acceptclient",
                method: "POST",
                params: {
                    "api-version": "1",
                },
            }),
        }),

        callNext: builder.mutation<any, {}>({
            query: ({}) => ({
                url: "Manager/callnext",
                method: "POST",
                params: {
                    "api-version": "1",
                },
            }),
        }),
        completeClient: builder.mutation<any, { managerId: number }>({
            query: ({ managerId }) => ({
                url: "Manager/completeclient",
                method: "POST",
                params: {
                    managerId,
                    "api-version": "1",
                },
            }),
        }),
        redirectClient: builder.mutation<
            any,
            { managerId: number; serviceId: number }
        >({
            query: ({ managerId, serviceId }) => ({
                url: "Manager/redirectclient",
                method: "POST",
                params: {
                    managerId,
                    serviceId,
                    "api-version": "1",
                },
            }),
        }),
        pauseWindow: builder.mutation<
            any,
            { managerId: number; exceedingTime: number }
        >({
            query: ({ managerId, exceedingTime }) => ({
                url: "Manager/pausewindow",
                method: "POST",
                params: {
                    managerId,
                    exceedingTime,
                    "api-version": "1",
                },
            }),
        }),
        startWindow: builder.mutation<any, { managerId: number }>({
            query: ({ managerId }) => ({
                url: "Manager/startwindow",
                method: "POST",
                params: {
                    managerId,
                    "api-version": "1",
                },
            }),
        }),
        createReview: builder.mutation<
            any,
            { recordId: number; rating: number; content: string }
        >({
            query: (review) => ({
                url: "Review/create",
                method: "POST",
                params: {
                    "api-version": "1",
                },
                body: review,
            }),
        }),
    }),
});

export const {
    useGetRecordListByManagerQuery,
    useGetServiceListQuery,
    useCreateRecordMutation,
    useGetRecordIdByTokenQuery,
    useGetRecordByIdQuery,
    useGetClientRecordByIdQuery,
    useUpdateQueueItemMutation,
    useCreateReviewMutation,
    useGetServiceByIdQuery,
    useAcceptClientMutation,
    useCallNextMutation,
    useCompleteClientMutation,
    useRedirectClientMutation,
    usePauseWindowMutation,
    useStartWindowMutation,
    useGetManagerIdQuery,
} = managerApi;
