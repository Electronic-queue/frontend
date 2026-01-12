import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userAuthSlice";
import { managerApi } from "./managerApi";
import { userApi } from "./userApi";
import { signalRManagerApi } from "./signalRManagerApi";
import { signalRClientApi } from "./signalRClientApi";

const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        [managerApi.reducerPath]: managerApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [signalRManagerApi.reducerPath]: signalRManagerApi.reducer,
        [signalRClientApi.reducerPath]: signalRClientApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(managerApi.middleware)
            .concat(userApi.middleware)
            .concat(signalRManagerApi.middleware)
            .concat(signalRClientApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
