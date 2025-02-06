import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { managerApi } from "./managerApi";
import userReducer from "./userAuthSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        [managerApi.reducerPath]: managerApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(managerApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
