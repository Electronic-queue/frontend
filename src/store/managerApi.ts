import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "src/store/store";
import { ManagerRecord } from "src/types/managerApiTypes";
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const managerApi = createApi({
    reducerPath: "managerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: apiBaseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.auth?.token;

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

        getRecordById: builder.query<any, number>({
            query: (recordId) => ({
                url: `Record/${recordId}`,
                params: { "api-version": "1" },
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
        redirectClient: builder.mutation<any, { serviceId: number }>({
            query: ({ serviceId }) => ({
                url: "Manager/redirectclient",
                method: "POST",
                params: {
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
    useGetRecordByIdQuery,
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
