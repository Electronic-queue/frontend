import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "src/store/store";

export const signalRBaseUrl = "https://qsignalr-test.satbayev.university/";

export const signalRManagerApi = createApi({
    reducerPath: "signalRManagerApi",
    baseQuery: fetchBaseQuery({
        baseUrl: signalRBaseUrl,
        prepareHeaders: (headers, { getState }) => {
            const state = getState() as RootState;
            // Получаем то, что лежит в сторе
            const rawToken = state.auth?.token;
            
            let tokenToUse = "";

            // Проверка: если это строка — используем как есть
            if (typeof rawToken === "string") {
                tokenToUse = rawToken;
            } 
            // Проверка: если это объект (как у тебя в логах), достаем поле token
            else if (typeof rawToken === "object" && rawToken !== null && "token" in rawToken) {
                // @ts-ignore - игнорируем TS, так как мы чиним рантайм баг
                tokenToUse = rawToken.token;
            }

            console.log("🔍 ИТОГОВЫЙ ТОКЕН:", tokenToUse ? "Найден" : "Пусто"); 

            if (tokenToUse) {
                headers.set("Authorization", `Bearer ${tokenToUse}`);
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