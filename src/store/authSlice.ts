import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const login = createAsyncThunk(
    "auth/login",
    async (
        { username, password }: { username: string; password: string },
        thunkAPI
    ) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                { username, password }
            );
            return response.data.token;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                login.fulfilled,
                (state, action: PayloadAction<string>) => {
                    state.loading = false;
                    state.token = action.payload;
                    state.isAuthenticated = true;
                    localStorage.setItem("token", action.payload);
                }
            )
            .addCase(login.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
