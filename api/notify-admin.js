import admin from 'firebase-admin';

// Initialize Firebase Admin (Singleton pattern)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines if they exist (common issue with env vars)
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Pre-flight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { title, body, taskId } = req.body;

        if (!title || !body) {
            return res.status(400).json({ message: 'Missing title or body' });
        }

        const db = admin.firestore();

        // 1. Get all Admin Tokens
        const tokensSnapshot = await db.collection('admin_tokens').get();

        if (tokensSnapshot.empty) {
            console.log('No admin tokens found.');
            return res.status(200).json({ message: 'No admins to notify' });
        }

        const tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(t => t);
        const uniqueTokens = [...new Set(tokens)]; // Remove duplicates

        if (uniqueTokens.length === 0) {
            return res.status(200).json({ message: 'No valid tokens' });
        }

        console.log(`Sending notification to ${uniqueTokens.length} devices.`);

        // 2. Send Multicast Message
        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
                taskId: taskId || 'unknown',
                url: '/admin/verification' // Action URL if supported by client handling
            },
            tokens: uniqueTokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        // Optional: Cleanup invalid tokens
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(uniqueTokens[idx]);
                }
            });
            console.log('List of invalid tokens:', failedTokens);
            // TODO: Delete invalid tokens from DB to keep it clean
        }

        return res.status(200).json({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        });

    } catch (error) {
        console.error('Notification API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
