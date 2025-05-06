import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    userInfo: any | null;
    serviceId: number | null;
    token: string | null;
    recordId: number | null;
    connectionId: string | null;
    ticketNumber: number | null;
    queueTypeId: string | null;
}

const loadFromLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key);
};

const loadNumberFromLocalStorage = (key: string): number | null => {
    const value = localStorage.getItem(key);
    return value ? Number(value) : null;
};

const initialState: UserState = {
    userInfo: null,
    serviceId: null,
    token: loadFromLocalStorage("token"),
    ticketNumber: loadNumberFromLocalStorage("ticketNumber"),
    recordId: loadNumberFromLocalStorage("recordId"),
    connectionId: loadFromLocalStorage("connectionId"),
    queueTypeId: loadFromLocalStorage("queueTypeId"),
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
            action.payload
                ? localStorage.setItem("token", action.payload)
                : localStorage.removeItem("token");
        },
        setRecordId: (state, action: PayloadAction<number | null>) => {
            state.recordId = action.payload;
            action.payload
                ? localStorage.setItem("recordId", String(action.payload))
                : localStorage.removeItem("recordId");
        },
        setTicketNumber: (state, action: PayloadAction<number | null>) => {
            state.ticketNumber = action.payload;
            action.payload
                ? localStorage.setItem("ticketNumber", String(action.payload))
                : localStorage.removeItem("ticketNumber");
        },
        setQueueTypeId: (state, action: PayloadAction<string | null>) => {
            state.queueTypeId = action.payload;
            action.payload
                ? localStorage.setItem("queueTypeId", action.payload)
                : localStorage.removeItem("queueTypeId");
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
                    localStorage.setItem("ticketNumber", String(ticketNumber));
                }
                localStorage.setItem("recordId", String(recordId));
                localStorage.setItem("connectionId", connectionId);
            } else {
                state.recordId = null;
                state.connectionId = null;
                state.ticketNumber = null;
                localStorage.removeItem("recordId");
                localStorage.removeItem("connectionId");
                localStorage.removeItem("ticketNumber");
            }
        },
    },
});

export const {
    setUserInfo,
    setServiceId,
    setToken,
    setRecordData,
    setRecordId,
    setTicketNumber,
    setQueueTypeId,
} = userSlice.actions;
export default userSlice.reducer;
