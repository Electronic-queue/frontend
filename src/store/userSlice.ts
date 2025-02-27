import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
    iin: string;
    firstName: string;
    lastName: string;
    surname?: string;
    serviceId?: number;
}

interface UserState {
    userInfo: UserInfo | null;
}

const initialState: UserState = {
    userInfo: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserInfo: (state, action: PayloadAction<UserInfo>) => {
            state.userInfo = action.payload;
        },
        setServiceId: (state, action: PayloadAction<number>) => {
            if (state.userInfo) {
                state.userInfo.serviceId = action.payload;
            }
        },
        clearUserInfo: (state) => {
            state.userInfo = null;
        },
    },
});

export const { setUserInfo, setServiceId, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
