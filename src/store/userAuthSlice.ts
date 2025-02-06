import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    userInfo: any;
    serviceId: number | null;
    token: string | null;
    recordId: number | null;
    connectionId: string | null;
}

const initialState: UserState = {
    userInfo: null,
    serviceId: null,
    token: localStorage.getItem("token") || null,
    recordId: localStorage.getItem("recordId")
        ? Number(localStorage.getItem("recordId"))
        : null,
    connectionId: localStorage.getItem("connectionId") || null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserInfo: (state, action: PayloadAction<any>) => {
            state.userInfo = action.payload;
        },
        setServiceId: (state, action: PayloadAction<number>) => {
            state.serviceId = action.payload;
        },
        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload;
            if (action.payload) {
                localStorage.setItem("token", action.payload);
            } else {
                localStorage.removeItem("token");
            }
        },
        setRecordData: (
            state,
            action: PayloadAction<{
                recordId: number;
                connectionId: string;
            } | null>
        ) => {
            if (action.payload) {
                state.recordId = action.payload.recordId;
                state.connectionId = action.payload.connectionId;
                localStorage.setItem(
                    "recordId",
                    String(action.payload.recordId)
                );
                localStorage.setItem(
                    "connectionId",
                    action.payload.connectionId
                );
            } else {
                state.recordId = null;
                state.connectionId = null;
                localStorage.removeItem("recordId");
                localStorage.removeItem("connectionId");
            }
        },
    },
});

export const { setUserInfo, setServiceId, setToken, setRecordData } =
    userSlice.actions;
export default userSlice.reducer;
