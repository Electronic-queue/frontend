// firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Твоя конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyA_z9661DrBy0vr-gOtLM6uT3R8qkpt1fk",
    authDomain: "equeuenotifications.firebaseapp.com",
    projectId: "equeuenotifications",
    storageBucket: "equeuenotifications.firebasestorage.app",
    messagingSenderId: "1097099239306",
    appId: "1:1097099239306:web:50b7adfdeaf34133bcf273",
    measurementId: "G-377XRE2G3Q",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
