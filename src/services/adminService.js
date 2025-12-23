import { db } from "../firebase";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    collectionGroup,
    orderBy,
    getDoc,
    increment,
    setDoc
} from "firebase/firestore";

// --- Admin Auth ---
export const adminLogin = async (email, password) => {
    // This is hardcoded for the prototype as requested.
    // In production, this would use Firebase Auth Custom Claims or a separate users collection.
    if (email === 'official@doordue.com' && password === 'vvvvvvvv') {
        // Create an admin session token (mock)
        const token = 'admin-session-' + Date.now();
        localStorage.setItem('adminToken', token);
        return { success: true, token };
    }
    throw new Error('Invalid admin credentials');
};

export const isAdminAuthenticated = () => {
    return !!localStorage.getItem('adminToken');
};

export const adminLogout = () => {
    localStorage.removeItem('adminToken');
};

// --- Proof Verification ---

// Fetch all pending proofs across all users
export const fetchPendingProofs = async () => {
    try {
        // Use collectionGroup query to find all tasks with status 'pending' (or a specific 'in_review' status if we add one)
        // For now, let's assume tasks with a 'proofUrl' but status 'pending' need review.
        // OR better yet, let's look for status 'pending' and proofUrl != null.
        // Caveat: Firestore composite indexes required for compound queries.
        // Simpler approach for prototype: Fetch recent tasks from collectionGroup 'tasks' order by createdAt.
        // Filter client-side for now if dataset is small, or strictly query where status == 'pending_review' 
        // (We might need to update the status when user uploads proof).

        // Let's assume user upload sets status to 'pending_review' or we just look for 'proofUrl' existing.
        // Update: The current user flow sets 'status' to 'success' immediately after local AI check.
        // To implement ADMIN review, we must change that flow -> Local AI -> 'pending_review' -> Admin Board.

        // FOR NOW: Let's fetch all tasks where valid proof exists.
        // Creating a loose query for tasks. 

        const tasksQuery = query(
            collectionGroup(db, 'tasks'),
            where('status', '==', 'pending_review'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(tasksQuery);
        const proofs = [];

        // We need user details for each task too.
        for (const docSnap of snapshot.docs) {
            const taskData = docSnap.data();
            const taskId = docSnap.id;

            // Get user data
            // taskData.userId MUST be present. If not, we can get it from ref.parent.parent.id
            const userId = taskData.userId || docSnap.ref.parent.parent.id;

            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : { name: 'Unknown User', email: 'N/A' };

            proofs.push({
                taskId,
                userId,
                ...taskData,
                userName: userData.name || userData.email,
                userEmail: userData.email
            });
        }

        return proofs;

    } catch (error) {
        console.error("Error fetching pending proofs:", error);
        throw error;
    }
};

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
