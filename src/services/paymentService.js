import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Verifies if the UTR is valid (12 digits) and unique.
 * @param {string} utr - The 12-digit transaction ID.
 * @returns {Promise<boolean>} - True if valid, throws Error if invalid.
 */
export const verifyUTR = async (utr) => {
    // 1. Format Check (12 digits)
    const utrRegex = /^\d{12}$/;
    if (!utrRegex.test(utr)) {
        throw new Error("Invalid UTR format. Must be exactly 12 digits.");
    }

    // 2. Uniqueness Check
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, where("utr", "==", utr));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        throw new Error("This UTR has already been used. Please check your Reference ID.");
    }

    return true;
};

/**
 * Records a manual UPI payment transaction in Firestore.
 * @param {string} userId - The ID of the user.
 * @param {number} amount - The amount in INR.
 * @param {string} utr - The transaction UTR.
 */
export const recordManualPayment = async (userId, amount, utr) => {
    try {
        await addDoc(collection(db, "transactions"), {
            userId,
            amount: parseFloat(amount),
            utr,
            method: 'UPI_MANUAL',
            status: 'completed', // Trust model: auto-complete
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error recording payment:", error);
        throw new Error("Failed to record transaction.");
    }
};
