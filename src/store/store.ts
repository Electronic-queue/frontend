import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userAuthSlice";
import { managerApi } from "./managerApi";
import { userApi } from "./userApi";

const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        [managerApi.reducerPath]: managerApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(managerApi.middleware)
            .concat(userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
