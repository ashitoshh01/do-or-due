const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Witty notification templates based on what provoked the alert
const getNudgeMessage = (userName, type, extraParams = {}) => {
    const templates = {
        procrastination: [
            `Hey ${userName}, your duecoins are getting nervous. You haven't done your task yet. 🕰️`,
            `Don't let the day slip by, ${userName}. Your streak misses you! 🏃`,
            `We see you scrolling, ${userName}. Do your task, keep your money.`
        ],
        panic: [
            `🚨 2 HOURS LEFT 🚨 ${userName}, do you hate money? Get the task done!`,
            `Time's ticking, ${userName}. Secure the bag or donate it. 💸`
        ],
        comeback: [
            `Ouch. You lost ${extraParams.stakeLost || 'some'} coins yesterday. But comeback seasons make the best movies. 🎬`,
            `Yesterday was rough. Today is yours. Regain your honor, ${userName}. ⚔️`
        ]
    };

    const options = templates[type] || templates.procrastination;
    return options[Math.floor(Math.random() * options.length)];
};

/**
 * Scheduled Function: Runs every hour to check for impending deadlines
 * This acts as the "Behavioral Trigger" engine.
 */
exports.checkDeadlinesAndNudge = functions.pubsub.schedule('every 60 minutes').onRun(async (context) => {
    console.log("Running hourly check for user nudges...");

    const now = admin.firestore.Timestamp.now();
    // 2 hours from now
    const panicTimeThreshold = new Date(now.toDate().getTime() + 2 * 60 * 60 * 1000);

    const usersSnapshot = await db.collection("users").get();
    let notificationsSent = 0;

    for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Skip if user doesn't have FCM token
        if (!userData.fcmToken) continue;

        const userName = userData.name || 'Champion';

        // Get user's active tasks
        const tasksSnapshot = await db.collection("users").doc(userDoc.id).collection("tasks")
            .where("status", "==", "pending").get();

        for (const taskDoc of tasksSnapshot.docs) {
            const task = taskDoc.data();
            if (!task.deadline) continue;

            const deadlineDates = task.deadline.toDate();

            // Trigger: 2 Hours Left Panic
            if (deadlineDates > now.toDate() && deadlineDates <= panicTimeThreshold) {

                const messageBody = getNudgeMessage(userName, 'panic');

                const payload = {
                    notification: {
                        title: 'DoOrDue Alert',
                        body: messageBody,
                    },
                    data: {
                        click_action: "https://doordue.com", // Adjust to actual production URL
                    }
                };

                try {
                    await admin.messaging().sendToDevice(userData.fcmToken, payload);
                    console.log(`Sent panic nudge to ${userName}`);
                    notificationsSent++;
                } catch (e) {
                    console.error(`Failed to send push to ${userName}:`, e);
                }

            }
        }
    }

    return { result: `Sent ${notificationsSent} nudges.` };
});

/**
 * Trigger Function: When a task fails, queue up a "Comeback" notification
 * to trigger the next morning. (Simulated here by sending immediately)
 */
exports.onTaskFailed = functions.firestore
    .document('users/{userId}/tasks/{taskId}')
    .onUpdate(async (change, context) => {

        const newValue = change.after.data();
        const previousValue = change.before.data();

        // Only care if it CHANGED to 'failed'
        if (newValue.status === 'failed' && previousValue.status !== 'failed') {
            const userId = context.params.userId;
            const userDoc = await db.collection("users").doc(userId).get();
            const userData = userDoc.data();

            if (userData && userData.fcmToken) {
                const userName = userData.name || 'Champion';
                const messageBody = getNudgeMessage(userName, 'comeback', { stakeLost: newValue.stake });

                const payload = {
                    notification: {
                        title: 'Time for a Comeback',
                        body: messageBody,
                    }
                };

                try {
                    // In a perfect system, you'd schedule this for the next morning.
                    // For this MVP, we fire it off shortly after the failure.
                    await admin.messaging().sendToDevice(userData.fcmToken, payload);
                    console.log(`Sent comeback nudge to ${userName}`);
                } catch (e) {
                    console.error(`Error sending comeback nudge: ${e}`);
                }
            }
        }
        return null;
    });
