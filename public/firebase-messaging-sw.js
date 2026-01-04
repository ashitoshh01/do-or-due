importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// This is required for background notifications to work.
firebase.initializeApp({
    apiKey: "AIzaSyA6F16tY-ql2z8-iHI8croOvtQV_uRP5O8",
    authDomain: "do-or-due-40cf8.firebaseapp.com",
    projectId: "do-or-due-40cf8",
    storageBucket: "do-or-due-40cf8.firebasestorage.app",
    messagingSenderId: "241683701110",
    appId: "1:241683701110:web:d6c68f341be61e067bee57",
    measurementId: "G-R1HP70RVQP"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg' // Using vite logo as placeholder
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
