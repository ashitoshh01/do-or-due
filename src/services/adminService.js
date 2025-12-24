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
    setDoc
} from "firebase/firestore";

// --- Admin Auth ---
// --- Admin Auth ---
export const adminLogin = async (email, password) => {
    try {
        // 1. Try to sign in normally
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('adminToken', token);
        return { success: true, token };
    } catch (error) {
        // 2. If user not found, CREATE it (Dev Helper)
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                // Only create if it matches our specific hardcoded admin email to prevent abuse
                if (email === 'official@doordue.com') {
                    const newUser = await createUserWithEmailAndPassword(auth, email, password);
                    const token = await newUser.user.getIdToken();
                    localStorage.setItem('adminToken', token);
                    return { success: true, token };
                }
            } catch (createError) {
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
// Fetch all tasks for Admin Board (Pending, Success, Failed)
// REFACTORED: Fetching by User then Tasks to avoid 'collectionGroup' permission/index issues
export const fetchAllAdminTasks = async () => {
    try {
        const proofs = [];

        // 1. Fetch ALL Users
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        // 2. Iterate each user and fetch their tasks
        const fetchPromises = usersSnapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            const userId = userDoc.id;

            // Query this user's tasks
            const tasksRef = collection(db, 'users', userId, 'tasks');
            // We want specific statuses
            const q = query(tasksRef, where('status', 'in', ['pending_review', 'success', 'failed']));
            const tasksSnapshot = await getDocs(q);

            tasksSnapshot.forEach(taskDoc => {
                const taskData = taskDoc.data();
                proofs.push({
                    taskId: taskDoc.id,
                    userId,
                    ...taskData,
                    userName: userData.name || userData.email || 'Unknown User',
                    userEmail: userData.email || 'N/A',
                    createdAtTimestamp: taskData.createdAt?.toMillis ? taskData.createdAt.toMillis() : Date.now()
                });
            });
        });

        await Promise.all(fetchPromises);

        // 3. Sort client-side
        proofs.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);

        return proofs;

    } catch (error) {
        console.error("Error fetching admin tasks:", error);
        throw error;
    }
};

// Kept for backward compatibility if needed, but aliasing to new one
export const fetchPendingProofs = fetchAllAdminTasks;

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

        await updateDoc(taskRef, {
            status: 'failed',
            rejectionReason: reason,
            reviewedAt: serverTimestamp(),
            reviewedBy: 'admin'
        });

        // Reset streak? Or just mark failed?
        // Previous logic for 'failTask':
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            streak: 0,
            "stats.failed": increment(1)
        });

        return { success: true };

    } catch (error) {
        console.error("Error rejecting proof:", error);
        throw error;
    }
};
