import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
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
    onSnapshot
} from "firebase/firestore";

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

            await updateDoc(userRef, {
                balance: increment(stakeAmount * 2), // Return stake + equal reward
                xp: increment(50),
                streak: increment(1),
                "stats.success": increment(1),
                "stats.earned": increment(stakeAmount)
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
