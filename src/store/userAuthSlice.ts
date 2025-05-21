import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    userInfo: any | null;
    serviceId: number | null;
    token: string | null;
    recordId: number | null;
    connectionId: string | null;
    ticketNumber: number | null;
    queueTypeId: string | null;
    nameEn: string | null;
    nameKk: string | null;
    nameRu: string | null;
    wasRedirected: boolean;
    fcmToken: string | null;
}

// Helpers
const loadFromLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key);
};

const loadNumberFromLocalStorage = (key: string): number | null => {
    const value = localStorage.getItem(key);
    return value ? Number(value) : null;
};

const loadBooleanFromLocalStorage = (key: string): boolean => {
    return localStorage.getItem(key) === "true";
};

const persist = (key: string, value: string | null) => {
    if (value !== null) {
        localStorage.setItem(key, value);
    } else {
        localStorage.removeItem(key);
    }
};

// Initial state
const initialState: UserState = {
    userInfo: null,
    serviceId: null,
    token: loadFromLocalStorage("token"),
    ticketNumber: loadNumberFromLocalStorage("ticketNumber"),
    recordId: loadNumberFromLocalStorage("recordId"),
    connectionId: loadFromLocalStorage("connectionId"),
    queueTypeId: loadFromLocalStorage("queueTypeId"),
    nameEn: loadFromLocalStorage("nameEn"),
    nameKk: loadFromLocalStorage("nameKk"),
    nameRu: loadFromLocalStorage("nameRu"),
    wasRedirected: loadBooleanFromLocalStorage("wasRedirected"),
    fcmToken: loadFromLocalStorage("fcmToken"),
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserInfo: (state, action: PayloadAction<any | null>) => {
            state.userInfo = action.payload;
        },
        setServiceId: (state, action: PayloadAction<number | null>) => {
            state.serviceId = action.payload;
        },
        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload;
            persist("token", action.payload);
        },
        setRecordId: (state, action: PayloadAction<number | null>) => {
            state.recordId = action.payload;
            persist(
                "recordId",
                action.payload !== null ? String(action.payload) : null
            );
        },
        setTicketNumber: (state, action: PayloadAction<number | null>) => {
            state.ticketNumber = action.payload;
            persist(
                "ticketNumber",
                action.payload !== null ? String(action.payload) : null
            );
        },
        setQueueTypeId: (state, action: PayloadAction<string | null>) => {
            state.queueTypeId = action.payload;
            persist("queueTypeId", action.payload);
        },
        setFcmToken: (state, action: PayloadAction<string | null>) => {
            state.fcmToken = action.payload;
            persist("fcmToken", action.payload);
        },

        setRecordData: (
            state,
            action: PayloadAction<{
                recordId: number;
                connectionId: string;
                ticketNumber?: number;
            } | null>
        ) => {
            if (action.payload) {
                const { recordId, connectionId, ticketNumber } = action.payload;
                state.recordId = recordId;
                state.connectionId = connectionId;
                if (ticketNumber !== undefined) {
                    state.ticketNumber = ticketNumber;
                    persist("ticketNumber", String(ticketNumber));
                }
                persist("recordId", String(recordId));
                persist("connectionId", connectionId);
            } else {
                state.recordId = null;
                state.connectionId = null;
                state.ticketNumber = null;
                localStorage.removeItem("recordId");
                localStorage.removeItem("connectionId");
                localStorage.removeItem("ticketNumber");
            }
        },
        setNames: (
            state,
            action: PayloadAction<{
                nameEn: string;
                nameKk: string;
                nameRu: string;
            }>
        ) => {
            const { nameEn, nameKk, nameRu } = action.payload;
            state.nameEn = nameEn;
            state.nameKk = nameKk;
            state.nameRu = nameRu;
            persist("nameEn", nameEn);
            persist("nameKk", nameKk);
            persist("nameRu", nameRu);
        },
        setWasRedirected: (state, action: PayloadAction<boolean>) => {
            state.wasRedirected = action.payload;
            localStorage.setItem("wasRedirected", String(action.payload));
        },
    },
});

export const {
    setUserInfo,
    setServiceId,
    setToken,
    setRecordId,
    setTicketNumber,
    setQueueTypeId,
    setRecordData,
    setNames,
    setWasRedirected,
    setFcmToken,
} = userSlice.actions;

export default userSlice.reducer;
