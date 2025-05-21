import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";
import { setFcmToken } from "src/store/userAuthSlice";
import { AppDispatch } from "src/store/store";

export const requestNotificationPermission = async (
    dispatch: AppDispatch,
    registration: ServiceWorkerRegistration
) => {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
        try {
            const currentToken = await getToken(messaging, {
                vapidKey:
                    "BAeXCiI74sxDvNuRi_TYCNLsvBSAOwqio5ZHxDBqr997gbaddcYzLLmK1nPeLBrm4XJEg360vkwQ3tQFaADVPnc",
            });

            if (currentToken) {
                dispatch(setFcmToken(currentToken));
            } else {
                console.warn("Не удалось получить токен");
            }
        } catch (err) {
            console.error("Ошибка при получении токена:", err);
        }
    } else {
        console.warn("Разрешение на уведомления не получено");
    }
};
