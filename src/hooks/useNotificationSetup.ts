import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../widgets/firebase";
import { useSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setFcmToken } from "src/store/userAuthSlice";

export const useNotificationSetup = () => {
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();

    useEffect(() => {
        const isIos = /iphone|ipad|ipod/.test(
            window.navigator.userAgent.toLowerCase()
        );
        const isStandalone =
            (window.navigator as any).standalone === true ||
            window.matchMedia("(display-mode: standalone)").matches;

        if (isIos && !isStandalone) {
            alert(
                "Чтобы получать уведомления, добавьте сайт на главный экран. Нажмите 'Поделиться' в Safari и выберите 'На экран Домой'."
            );
            return;
        }

        const registerServiceWorkerAndRequestPermission = async () => {
            try {
                const registration = await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js"
                );

                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    const token = await getToken(messaging, {
                        vapidKey:
                            "BAeXCiI74sxDvNuRi_TYCNLsvBSAOwqio5ZHxDBqr997gbaddcYzLLmK1nPeLBrm4XJEg360vkwQ3tQFaADVPnc",
                    });

                    if (token) {
                        dispatch(setFcmToken(token));
                    } else {
                        console.warn("Не удалось получить токен");
                    }
                } else {
                    console.warn("Разрешение на уведомления не получено");
                }
            } catch (error) {
                console.error("Ошибка при регистрации service worker:", error);
            }
        };

        if ("serviceWorker" in navigator && "Notification" in window) {
            registerServiceWorkerAndRequestPermission();

            const unsubscribe = onMessage(messaging, (payload) => {
                const { title, body } = payload.notification || {};
                if (document.visibilityState === "visible" && title && body) {
                    enqueueSnackbar(`${title}: ${body}`, { variant: "info" });
                }
            });

            return () => unsubscribe();
        }
    }, [enqueueSnackbar, dispatch]);
};
