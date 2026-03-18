import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "src/store/store";

export const signalRBaseUrl = "https://qclient.satbayev.university";
export const signalRManagerApi = createApi({
    reducerPath: "signalRManagerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: signalRBaseUrl,
        prepareHeaders: (headers, { getState }) => {
            const state = getState() as RootState;

            // Берем токен из Redux или из localStorage (на случай F5)
            const token = state.auth?.token || localStorage.getItem("token");

            if (token && typeof token === "string") {
                // Обязательно проверяем, не попала ли туда строка "null" или "undefined"
                if (token !== "null" && token !== "undefined") {
                    headers.set("Authorization", `Bearer ${token}`);
                    // console.log("✅ Token added to headers");
                }
            } else {
                console.warn("⚠️ No token found for registerManager request");
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

export const { useRegisterManagerMutation } = signalRManagerApi;
