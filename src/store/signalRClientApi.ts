import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "src/store/store";

// ВРЕМЕННЫЙ ТЕСТ: Идем в обход прокси IIS
export const signalRBaseUrl = "https://qclient.satbayev.university";
export const signalRClientApi = createApi({
    reducerPath: "signalRClientApi",
    baseQuery: fetchBaseQuery({
        baseUrl: signalRBaseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.user?.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        registerClient: builder.mutation<any, { connectionId: string }>({
            query: (payload) => ({
                url: "api/registry/client",
                method: "POST",
                body: payload,
            }),
        }),
    }),
});

export const { useRegisterClientMutation } = signalRClientApi;
