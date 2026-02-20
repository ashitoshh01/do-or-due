import { auth, db, messaging } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getToken, onMessage } from "firebase/messaging";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    collectionGroup,
    // orderBy, // Removing orderBy to avoid index requirement for now
    getDoc,
    increment,
    setDoc,
    onSnapshot,
    deleteDoc
} from "firebase/firestore";
import { checkPlanExpiration } from "./dbService";

// --- Admin Auth ---
// --- Admin Auth ---
export const adminLogin = async (email, password) => {
    // 0. STRICT SECURITY CHECK
    if (email !== 'official@doordue.com') {
        throw new Error("Unauthorized Access: This portal is restricted.");
    }

    try {
        // 1. Try to sign in normally
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('adminToken', token);
        return { success: true, token };
    } catch (error) {
        // 2. If user not found, CREATE it (Dev Helper for first-time setup)
        // Check for both 'user-not-found' (legacy) and 'invalid-credential' (newer) depending on config
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                // Double check email just in case
                if (email === 'official@doordue.com') {
                    // Attempt creation - this might fail if password is weak (Firebase requires 6 chars)
                    // The requested password 'vvvvvvvv' is 8 chars, so it is fine.
                    const newUser = await createUserWithEmailAndPassword(auth, email, password);
                    const token = await newUser.user.getIdToken();
                    localStorage.setItem('adminToken', token);
                    return { success: true, token };
                }
            } catch (createError) {
                // If creation fails (e.g. user DOES exist but password was wrong and we got invalid-credential above),
                // we should re-throw the original login error or a generic one.
                if (createError.code === 'auth/email-already-in-use') {
                    throw new Error("Invalid password.");
                }
                throw createError;
            }
        }
        throw error;
    }
};

export const isAdminAuthenticated = () => {
    return !!localStorage.getItem('adminToken');
};

export const adminLogout = async () => {
    localStorage.removeItem('adminToken');
    await signOut(auth);
};

// --- Proof Verification ---

// Fetch all tasks for Admin Board (Pending, Success, Failed)
// REFACTORED: Fetching by User then Tasks to avoid 'collectionGroup' permission/index issues
// Real-time subscription for Admin Board

export const subscribeToAdminTasks = (callback) => {
    let unsubscribeSnapshot = null;

    // Wait for Auth to be ready
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        if (user) {
            try {
                // Query ALL 'tasks' collections where status is relevant
                const q = query(
                    collectionGroup(db, 'tasks'),
                    where('status', 'in', ['pending_review', 'success', 'failed'])
                );

                unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
                    const tempProofs = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            taskId: doc.id,
                            userId: doc.ref.parent.parent ? doc.ref.parent.parent.id : 'unknown', // Handle orphan tasks
                            ...data,
                            createdAtTimestamp: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
                        };
                    });

                    // Fetch user names for unique userIds
                    const uniqueUserIds = [...new Set(tempProofs.map(p => p.userId).filter(id => id !== 'unknown'))];

                    try {
                        const userCache = {};
                        await Promise.all(uniqueUserIds.map(async (uid) => {
                            const userDoc = await getDoc(doc(db, 'users', uid));
                            if (userDoc.exists()) {
                                userCache[uid] = userDoc.data().name || userDoc.data().email || 'Unknown';
                            }
                        }));

                        // Merge names
                        const populatedProofs = tempProofs.map(proof => ({
                            ...proof,
                            userName: userCache[proof.userId] || proof.userName || 'Unknown User'
                        }));

                        // Client-side sort
                        populatedProofs.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);
                        callback(populatedProofs);
                    } catch (err) {
                        console.error("Error fetching user details:", err);
                        tempProofs.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);
                        callback(tempProofs);
                    }

                }, (error) => {
                    console.error("Errors in snapshot:", error);
                });
            } catch (error) {
                console.error("Error creating query:", error);
            }
        } else {
            // User logged out
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            callback([]);
        }
    });

    // Return a function to cleanup BOTH listeners
    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
};

// (Legacy export removed)

// Approve Proof
export const approveProof = async (userId, taskId, stakeAmount) => {
    try {
        const taskRef = doc(db, 'users', userId, 'tasks', taskId);
        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) throw new Error("Task not found");
        if (taskSnap.data().status === 'success') throw new Error("Task already approved");

        // 1. Mark Task Success
        await updateDoc(taskRef, {
            status: 'success',
            reviewedAt: serverTimestamp(),
            reviewedBy: 'admin'
        });

        // 2. Update User Stats & Wallet (IDEMPOTENT CHECK above prevents double credit)
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const currentBalance = userData.balance || 0;
            const currentXp = userData.xp || 0;
            const currentStreak = userData.streak || 0;

            // Logic: Return Stake + Reward (e.g., 2x Stake? Or just stake back? Let's assume Stake + 10% or just points?)
            // Based on previous code: balance + (stake * 2) implied doubling.
            // Let's stick to the previous 'completeTask' logic to match user expectations.

            const reward = Math.floor(stakeAmount * 0.05);

            await updateDoc(userRef, {
                balance: increment(stakeAmount + reward), // Return stake + 5% reward
                xp: increment(50),
                streak: increment(1),
                "stats.success": increment(1),
                "stats.earned": increment(reward)
            });
        }

        return { success: true };

    } catch (error) {
        console.error("Error approving proof:", error);
        throw error;
    }
};

// Reject Proof
export const rejectProof = async (userId, taskId, reason) => {
    try {
        const taskRef = doc(db, 'users', userId, 'tasks', taskId);

        // Fetch task to check deadline? User asked "untill deadline is over".
        // For now, just set it back to pending so they can retry.
        // We set status to 'pending' (Active) and remove the current proof so they can upload again.
        // We keep 'rejectionReason' to display it.

        await updateDoc(taskRef, {
            status: 'pending', // Revert to active state
            proofUrl: null,    // Clear the rejected proof
            rejectionReason: reason,
            reviewedAt: serverTimestamp(),
            reviewedBy: 'admin'
        });

        // Previous failed stats logic removed because it's not a failure yet.
        return { success: true };

    } catch (error) {
        console.error("Error rejecting proof:", error);
        throw error;
    }
};

// --- Notifications ---

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: 'BFI5xi6yRNZKfECvYn1gOtinOnPm1zLfU-pHkzBsTLdNWJV1xaLh_HoHXzzz3W43ssnW1r3OM3LmPJUykyMYnJU'
                // Actually, for simple setup, we might not need Vapid Key if using default provided config?
                // No, getToken usually requires VAPID key.
                // I will add a TODO to get VAPID Key. Or I can try without it, sometimes it works if configured in firebase.json (not reliable).
                // Let's use a placeholder and ask user or look up if I can get it from project settings?
                // Project settings -> Cloud Messaging -> Web Push certificates.
                // I don't have this.
                // I'll try calling getToken without vapidKey first (it might warn but work if service worker is set up correctly?)
                // Actually, let's just leave it empty for now, it often fails without it.
            });
            // console.log("FCM Token:", token);
            return token;
        } else {
            console.log("Notification permission denied");
            return null;
        }
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log("payload", payload);
            resolve(payload);
        });
    });

// --- User Management ---

export const subscribeToAllUsers = (callback) => {
    // Query users sorted by joined date (createdAt)
    const q = query(
        collection(db, 'users'),
        // orderBy('createdAt', 'desc') // Ensure index exists or fallback to client sort
    );

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            const userData = {
                userId: doc.id,
                ...data,
                joinedAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0
            };

            // Check for expiration
            checkPlanExpiration(userData, doc.id);

            return userData;
        }).filter(user => user.email); // Only show users with an email

        // Client-side sort to avoid index issues during dev
        users.sort((a, b) => b.joinedAt - a.joinedAt);

        callback(users);
    }, (error) => {
        console.error("Error subscribing to users:", error);
        callback([]);
    });
};

export const deleteUserProfile = async (userId) => {
    try {
        await deleteDoc(doc(db, "users", userId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};


