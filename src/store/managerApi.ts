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

            console.log(
                "🔑 [prepareHeaders] Current token state:",
                token
                    ? "Exists (starts with " + token.substring(0, 10) + "...)"
                    : "Empty"
            );

            if (token) {
                const authHeader = `Bearer ${token}`;
                headers.set("Authorization", authHeader);
                // Проверим, не закрались ли лишние пробелы или спецсимволы
                console.log(
                    "📡 [prepareHeaders] Auth header set:",
                    authHeader.substring(0, 20) + "..."
                );
            } else {
                console.warn("⚠️ [prepareHeaders] No token found in state!");
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
        getServiceList: builder.mutation<any, string>({
            query: (queueTypeId) => ({
                url: "Service",
                method: "POST",
                params: {
                    "api-version": "1",
                },
                body: JSON.stringify(queueTypeId),
                headers: {
                    "Content-Type": "application/json",
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
        cancelQueue: builder.mutation<any, {}>({
            query: ({}) => ({
                url: "Manager/cancel-queue",
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
        observer: builder.mutation<
            any,
            { connectionId: string; queueTypeId: string }
        >({
            query: (payload) => ({
                url: "Observer/register",
                method: "POST",
                params: {
                    "api-version": "1",
                },
                // Данные передаем именно в body, а не деструктурируем в params
                body: payload,
                // Явно указываем, что отправляем JSON
                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),
        redirectClient: builder.mutation<any, void>({
            query: () => ({
                url: "Manager/redirectclient",
                method: "POST",
                params: {
                    "api-version": "1",
                },
            }),
        }),
        updateClientService: builder.mutation<any, { serviceId: string }>({
            query: (payload) => ({
                url: "Manager/update-client-service",
                method: "POST",
                params: {
                    "api-version": "1",
                },
                body: payload,
            }),
        }),
        getServicesForManager: builder.mutation<any, void>({
            query: () => ({
                url: "Service/get-services-for-manager",
                method: "POST",
                params: {
                    "api-version": "1",
                },
                headers: {
                    "Content-Type": "application/json",
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
        forgotPassword: builder.mutation<any, { email: string }>({
            query: ({ email }) => ({
                url: "User/forgot-password",
                method: "POST",
                params: {
                    "api-version": "1",
                },
                body: { email },
            }),
        }),
        changePassword: builder.mutation<
            any,
            { accessToken: string; password: string }
        >({
            query: ({ accessToken, password }) => ({
                url: "User/change-password",
                method: "POST",
                params: {
                    "api-version": "1",
                },
                body: {
                    accessToken,
                    password,
                },

                headers: {
                    "Content-Type": "application/json",
                },
            }),
        }),

        startWindow: builder.mutation<any, {}>({
            query: ({}) => ({
                url: "Manager/startwindow",
                method: "POST",
                params: {
                    "api-version": "1",
                },
            }),
        }),

        getQueueType: builder.query<any, void>({
            query: () => ({
                url: "QueueType",
                params: {
                    "api-version": "1",
                },
            }),
        }),

        getQueueTypeByToken: builder.query<any, void>({
            query: () => ({
                url: "QueueType/get-queuetype-by-token",
                method: "GET",
                params: {
                    "api-version": "1",
                },
            }),
        }),
        getQueueForClients: builder.query<any, void>({
            query: () => ({
                url: "QueueItem/GetQueueForClients",
                method: "GET",
                params: {
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
    useCancelQueueMutation,
    useForgotPasswordMutation,
    useChangePasswordMutation,
    useGetQueueTypeQuery,
    useGetServiceListMutation,
    useGetServicesForManagerMutation,
    useGetQueueTypeByTokenQuery,
    useGetQueueForClientsQuery,
    useObserverMutation,
    useUpdateClientServiceMutation,
} = managerApi;
