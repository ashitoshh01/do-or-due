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
    increment,
    serverTimestamp,
    getDocs
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
            longestStreak: 0,
            lastTaskCompleted: null,
            groups: [], // Array of group IDs the user belongs to
            createdAt: new Date(),
            plan: 'base', // Explicitly set to base plan
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

export const checkPlanExpiration = async (userData, userId) => {
    if (userData.plan !== 'base' && userData.planExpiresAt) {
        let expireTime;
        // Handle Firestore Timestamp or Date object or numeric
        if (userData.planExpiresAt.seconds) {
            expireTime = userData.planExpiresAt.seconds * 1000;
        } else if (userData.planExpiresAt instanceof Date) {
            expireTime = userData.planExpiresAt.getTime();
        } else {
            expireTime = new Date(userData.planExpiresAt).getTime();
        }

        if (Date.now() > expireTime) {
            console.log(`User ${userId} plan expired. Reverting to base.`);
            await updateUserProfile(userId, {
                plan: 'base',
                planExpiresAt: null
            });
            return true;
        }
    }
    return false;
};

export const subscribeToUser = (userId, callback) => {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Check for expiration (async, will trigger update if needed)
            checkPlanExpiration(data, docSnap.id);
            callback(data);
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
        const users = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(user => user.email); // Only show users with valid email
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

        let newStreak = (data.streak || 0);
        let now = new Date();
        const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (data.lastTaskCompleted) {
            let lastCompleted = data.lastTaskCompleted.toDate ? data.lastTaskCompleted.toDate() : new Date(data.lastTaskCompleted);
            const lastMidnight = new Date(lastCompleted.getFullYear(), lastCompleted.getMonth(), lastCompleted.getDate());
            const diffDays = Math.floor((nowMidnight - lastMidnight) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            }
        } else {
            newStreak = Math.max(1, newStreak);
        }

        let newLongestStreak = Math.max((data.longestStreak || 0), newStreak);

        await updateDoc(userRef, {
            balance: data.balance + stakeAmount + reward, // Return stake + 5% reward
            xp: (data.xp || 0) + 50,
            streak: newStreak,
            longestStreak: newLongestStreak,
            lastTaskCompleted: now,
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

// --- Feedback Operations ---

export const submitFeedback = async (userId, userEmail, title, description) => {
    try {
        await addDoc(collection(db, "feedbacks"), {
            userId,
            userEmail,
            title,
            description,
            createdAt: serverTimestamp(),
            status: 'unread' // unread, read
        });
        return true;
    } catch (error) {
        console.error("Error submitting feedback:", error);
        throw error;
    }
};

export const subscribeToFeedbacks = (callback) => {
    const q = query(
        collection(db, "feedbacks"),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const feedbacks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(feedbacks);
    });
};

// --- Group / Squad Operations ---

export const createGroup = async (userId, groupName) => {
    try {
        // 1. Generate a random invite code (e.g., 6 uppercase letters/numbers)
        const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
        let inviteCode = generateCode();

        // Ensure uniqueness (simple retry mechanism)
        let codeExists = true;
        while (codeExists) {
            const codeQuery = query(collection(db, "groups"), where("inviteCode", "==", inviteCode));
            const codeSnapshot = await getDocs(codeQuery);
            if (codeSnapshot.empty) {
                codeExists = false;
            } else {
                inviteCode = generateCode();
            }
        }

        // 2. Create the group document
        const groupRef = await addDoc(collection(db, "groups"), {
            name: groupName,
            inviteCode: inviteCode,
            createdBy: userId,
            createdAt: serverTimestamp(),
            members: [userId] // The creator is the first member
        });

        // 3. Update the user's profile to include this group ID
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const currentGroups = userData.groups || [];
            if (!currentGroups.includes(groupRef.id)) {
                await updateDoc(userRef, {
                    groups: [...currentGroups, groupRef.id]
                });
            }
        }

        return { id: groupRef.id, inviteCode, name: groupName, members: [userId] };
    } catch (error) {
        console.error("Error creating group:", error);
        throw error;
    }
};

export const joinGroup = async (userId, inviteCode) => {
    try {
        const upperCode = inviteCode.toUpperCase().trim();

        // 1. Find the group by invite code
        const q = query(collection(db, "groups"), where("inviteCode", "==", upperCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Invalid invite code. Group not found.");
        }

        const groupDoc = querySnapshot.docs[0];
        const groupData = groupDoc.data();
        const groupId = groupDoc.id;

        // 2. Add user to group's members array if not already there
        const currentMembers = groupData.members || [];
        if (!currentMembers.includes(userId)) {
            await updateDoc(doc(db, "groups", groupId), {
                members: [...currentMembers, userId]
            });
        }

        // 3. Add group to user's groups array if not already there
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const currentUserGroups = userData.groups || [];
            if (!currentUserGroups.includes(groupId)) {
                await updateDoc(userRef, {
                    groups: [...currentUserGroups, groupId]
                });
            } else {
                throw new Error("You are already in this squad!");
            }
        }

        return { id: groupId, ...groupData };
    } catch (error) {
        console.error("Error joining group:", error);
        throw error;
    }
};

export const subscribeToUserGroups = (userId, callback) => {
    // 1. Subscribe to the user profile to get their list of group IDs
    const userRef = doc(db, "users", userId);

    return onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const groupIds = userData.groups || [];

            if (groupIds.length === 0) {
                callback([]);
                return;
            }

            // 2. Fetch the corresponding group documents
            try {
                // Since 'in' queries are limited to 10 items, we batch them if necessary
                const groups = [];
                // Chunk array into size of 10
                const chunks = [];
                for (let i = 0; i < groupIds.length; i += 10) {
                    chunks.push(groupIds.slice(i, i + 10));
                }

                for (const chunk of chunks) {
                    const qGroups = query(collection(db, "groups"), where("__name__", "in", chunk));
                    const snap = await getDocs(qGroups);
                    snap.docs.forEach(d => {
                        groups.push({ id: d.id, ...d.data() });
                    });
                }

                callback(groups);

            } catch (err) {
                console.error("Error fetching user's groups:", err);
                callback([]);
            }
        }
    });
};

export const subscribeToGroupMembers = (groupId, callback) => {
    // We first read the group to get members, then subscribe to those users.
    // However, for pure real-time, we can subscribe to the group doc itself,
    // and whenever members change, fetch the users.
    const groupRef = doc(db, "groups", groupId);

    return onSnapshot(groupRef, async (docSnap) => {
        if (docSnap.exists()) {
            const groupData = docSnap.data();
            const memberIds = groupData.members || [];

            if (memberIds.length === 0) {
                callback({ groupName: groupData.name, users: [] });
                return;
            }

            try {
                // Fetch the users
                const users = [];
                const chunks = [];
                for (let i = 0; i < memberIds.length; i += 10) {
                    chunks.push(memberIds.slice(i, i + 10));
                }

                for (const chunk of chunks) {
                    const qUsers = query(collection(db, "users"), where("__name__", "in", chunk));
                    const snap = await getDocs(qUsers);
                    snap.docs.forEach(d => {
                        users.push({ id: d.id, ...d.data() });
                    });
                }

                // Sort by XP descending locally since we fetched by 'in' __name__
                users.sort((a, b) => (b.xp || 0) - (a.xp || 0));

                callback({ groupName: groupData.name, users });

            } catch (err) {
                console.error("Error fetching group members:", err);
                callback({ groupName: groupData.name, users: [] });
            }
        }
    });
};
