// public/firebase-messaging-sw.js
importScripts(
    "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyA_z9661DrBy0vr-gOtLM6uT3R8qkpt1fk",
    authDomain: "equeuenotifications.firebaseapp.com",
    projectId: "equeuenotifications",
    storageBucket: "equeuenotifications.firebasestorage.app",
    messagingSenderId: "1097099239306",
    appId: "1:1097099239306:web:50b7adfdeaf34133bcf273",
    measurementId: "G-377XRE2G3Q",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    const { title, body } = payload.notification;
    self.registration.showNotification(title, {
        body,
        icon: "/suLogo.svg",
    });
});
