import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "src/store/store";

// Based on your screenshot, the Base URL seems to be specific for SignalR
// Ideally, put this in your .env file like VITE_SIGNALR_API_URL
export const signalRBaseUrl = "https://qsignalr-test.satbayev.university/";

export const signalRManagerApi = createApi({
    reducerPath: "signalRManagerApi", // Unique key for the store
    baseQuery: fetchBaseQuery({
        baseUrl: signalRBaseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.auth?.token;
console.log("🔍 ТОКЕН В ЗАГОЛОВКЕ:", token);            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
    
        registerManager: builder.mutation<any, { connectionId: string }>({
            query: (payload) => ({
                url: "api/registry/manager",
                method: "POST",
                body: payload,
            }),
        }),

    }),
});

export const { 
    useRegisterManagerMutation, 
} = signalRManagerApi;