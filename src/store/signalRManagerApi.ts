import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "src/store/store";

// Based on your screenshot, the Base URL seems to be specific for SignalR
// Ideally, put this in your .env file like VITE_SIGNALR_API_URL
export const signalRBaseUrl = import.meta.env.VITE_SIGNALR_BASE_URL;

export const signalRManagerApi = createApi({
    reducerPath: "signalRManagerApi", // Unique key for the store
    baseQuery: fetchBaseQuery({
        baseUrl: signalRBaseUrl,
        prepareHeaders: (headers, { getState }) => {
            // We get the token from your existing auth slice
            const token = (getState() as RootState)?.auth?.token;

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // Endpoint for /api/registry/client
        registerClient: builder.mutation<any, { connectionId: string }>({
            query: (body) => ({
                url: "api/registry/client",
                method: "POST",
                body: body, // { connectionId: "..." }
            }),
        }),

        // Endpoint for /api/registry/manager
        registerManager: builder.mutation<any, { connectionId: string }>({
            query: (body) => ({
                url: "api/registry/manager",
                method: "POST",
                body: body,
            }),
        }),

    }),
});

// Export hooks for usage in components
export const { 
    useRegisterClientMutation, 
    useRegisterManagerMutation, 
} = signalRManagerApi;