import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// TODO: Replace with your specific Firebase Project Configuration
// You can find this in Firebase Console > Project Settings > General > Your Apps
const firebaseConfig = {
    apiKey: "AIzaSyA6F16tY-ql2z8-iHI8croOvtQV_uRP5O8",
    authDomain: "do-or-due-40cf8.firebaseapp.com",
    projectId: "do-or-due-40cf8",
    storageBucket: "do-or-due-40cf8.firebasestorage.app",
    messagingSenderId: "241683701110",
    appId: "1:241683701110:web:d6c68f341be61e067bee57",
    measurementId: "G-R1HP70RVQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;
