import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Описание структуры из твоего скриншота
interface LoginResponse {
    window: any;
    token: {
        token: string; // Сама строка JWT
        userName: string;
        fullName: string;
        queueTypeID: string;
        isAdmin: boolean | null;
    };
}

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    loading: false,
    error: null,
};

export const login = createAsyncThunk(
    "auth/login",
    async (
        { login, password }: { login: string; password: string },
        thunkAPI
    ) => {
        try {
            const response = await axios.post<LoginResponse>(
                "https://qclient.satbayev.university/api/Manager/login",
                { login, password },
                {
                    params: { "api-version": "1" },
                    headers: { "Content-Type": "application/json" },
                }
            );
            return response.data;
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
            localStorage.removeItem("windowInfo");
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
                (state, action: PayloadAction<LoginResponse>) => {
                    state.loading = false;

                    // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: достаем именно строку токена
                    const pureToken = action.payload.token.token;

                    state.token = pureToken;
                    state.isAuthenticated = true;

                    // Сохраняем в браузер только строку токена
                    localStorage.setItem("token", pureToken);
                    // Информацию об окне (Cs2, 2024 и т.д.) сохраняем отдельн
                    localStorage.setItem(
                        "windowInfo",
                        JSON.stringify(action.payload.window)
                    );
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
