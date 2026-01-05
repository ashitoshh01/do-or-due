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

export const createUserProfile = async (userId, email, name = null) => {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            email,
            name: name || email.split('@')[0], // Use provided name or default from email
            balance: 100,
            xp: 0,
            streak: 0,
            createdAt: new Date(),
            defaultCharity: 1, // Defaulting to St. Jude (ID: 1) as "from our side"
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
    console.log(`Adding funds to ${userId}: ${amount}`);
    const userRef = doc(db, "users", userId);
    // Use setDoc with merge to ensure it works even if fields are missing
    await setDoc(userRef, {
        balance: increment(amount),
        stats: {
            earned: increment(amount)
        }
    }, { merge: true });
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
    const taskRef = await addDoc(collection(db, "users", userId, "tasks"), {
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

    // 3. Trigger Notification REMOVED (User requested notification only on Proof Upload)
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
        const reward = Math.floor(stakeAmount * 0.05); // 5% reward

        await updateDoc(userRef, {
            balance: data.balance + stakeAmount + reward, // Return stake + 5% reward
            xp: (data.xp || 0) + 50,
            streak: (data.streak || 0) + 1,
            "stats.success": increment(1),
            "stats.earned": increment(reward)
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

    // Trigger Notification for Admin if status is 'pending_review' (Proof Uploaded)
    if (status === 'pending_review') {
        // Fetch task details for the body
        // (Optimally we'd pass title, but fetching is safer to ensure data availability)
        // For speed, since we don't have title here readily without a read, 
        // I will just use a generic message or assume the caller passed it? 
        // No, caller didn't pass title.
        // Let's do a quick read or just say "A user uploaded proof".
        // Better: "Proof Uploaded ($STAKE)"

        // Let's try to get the task to make it nice
        try {
            const tDoc = await getDoc(doc(db, "users", userId, "tasks", taskId));
            if (tDoc.exists()) {
                const text = tDoc.data().objective;
                const stake = tDoc.data().stake;
                triggerNotificationApi({
                    title: "Proof Uploaded",
                    body: `${text} ($${stake})`,
                    taskId: taskId
                });
            }
        } catch (e) {
            console.error("Error fetching task for notification", e);
        }
    }
};

// --- Notifications ---

export const saveAdminToken = async (token) => {
    if (!token) return;
    // Save to a dedicated collection for admin tokens
    // Using token as ID to prevent duplicates
    await setDoc(doc(db, "admin_tokens", token), {
        token: token,
        updatedAt: new Date()
    });
};

export const triggerNotificationApi = async (taskData) => {
    try {
        // Use Absolute URL so it works from Firebase Hosting / Localhost too
        const API_URL = 'https://do-or-due.vercel.app/api/notify-admin';

        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });
    } catch (error) {
        console.error("Failed to trigger notification API:", error);
    }
};
