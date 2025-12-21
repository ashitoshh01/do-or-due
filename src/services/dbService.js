import { db } from "../firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    setDoc,
    getDoc,
    orderBy,
    increment
} from "firebase/firestore";

// --- User Operations ---

export const createUserProfile = async (userId, email) => {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            email,
            name: email.split('@')[0], // Default name from email
            balance: 100,
            xp: 0,
            streak: 0,
            createdAt: new Date(),
            stats: {
                success: 0,
                failed: 0,
                staked: 0,
                earned: 0
            }
        });
    }
};

export const subscribeToUser = (userId, callback) => {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    }, (error) => {
        console.error("Error subscribing to user profile:", error);
    });
};

export const subscribeToLeaderboard = (callback) => {
    const q = query(
        collection(db, "users"),
        orderBy("xp", "desc"),
    );
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(users);
    }, (error) => {
        console.error("Error subscribing to leaderboard:", error);
        callback([]); // Return empty list on error
    });
};

export const updateUserBalance = async (userId, newBalance) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { balance: newBalance });
};

export const addFunds = async (userId, amount) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        balance: increment(amount),
        "stats.earned": increment(0)
    });
};

export const updateUserProfile = async (userId, updates) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
};

// --- Task Operations ---

export const subscribeToTasks = (userId, callback) => {
    const q = query(
        collection(db, "users", userId, "tasks"),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(tasks);
    }, (error) => {
        console.error("Error subscribing to tasks:", error);
        callback([]); // Return empty list on error
    });
};

export const addTask = async (userId, taskData) => {
    // Validate deadline is not in the past
    if (taskData.deadline) {
        const deadlineDate = new Date(taskData.deadline);
        const now = new Date();
        if (deadlineDate <= now) {
            throw new Error("Deadline must be in the future");
        }
    }

    // 1. Create Task in Subcollection
    await addDoc(collection(db, "users", userId, "tasks"), {
        userId, // Keep userId for reference if needed, though implicit in path
        objective: taskData.objective,
        stake: parseInt(taskData.stake),
        deadline: taskData.deadline,
        status: 'pending',
        createdAt: new Date(),
        proofUrl: null
    });

    // 2. Update User Stats (Staked count)
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        "stats.staked": increment(parseInt(taskData.stake))
    });
};

export const deleteTask = async (userId, taskId) => {
    await deleteDoc(doc(db, "users", userId, "tasks", taskId));
};

export const completeTask = async (userId, taskId, stakeAmount) => {
    // 1. Update Task Status
    await updateDoc(doc(db, "users", userId, "tasks", taskId), {
        status: 'success',
        completedAt: new Date()
    });

    // 2. Update User Stats
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const data = userSnap.data();
        await updateDoc(userRef, {
            balance: data.balance + (stakeAmount * 2), // Return stake + reward
            xp: (data.xp || 0) + 50,
            streak: (data.streak || 0) + 1,
            "stats.success": increment(1),
            "stats.earned": increment(stakeAmount)
        });
    }
}

export const failTask = async (userId, taskId) => {
    // 1. Update Task Status
    await updateDoc(doc(db, "users", userId, "tasks", taskId), {
        status: 'failed',
        completedAt: new Date()
    });

    // 2. Update User Stats
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        streak: 0, // Reset streak on failure
        "stats.failed": increment(1)
    });
};

export const updateTaskStatus = async (userId, taskId, status, proofUrl = null) => {
    await updateDoc(doc(db, "users", userId, "tasks", taskId), {
        status,
        proofUrl
    });
};
