/**
 * Maps Firebase authentication error codes to user-friendly messages.
 * @param {Object} error - The error object returned by Firebase.
 * @returns {string} - A user-friendly error message.
 */
export const getFriendlyErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred.';

    // Check for specific Firebase auth error codes
    switch (error.code) {
        case 'auth/invalid-credential':
            return 'Incorrect email or password. Please try again.';
        case 'auth/user-not-found':
            return 'No account found with this email. Please sign up.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please log in instead.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in cancelled.';
        default:
            // For other errors, return the cleaned message or a generic fallback
            // Remove "Firebase: " prefix if present to make it slightly cleaner
            const msg = error.message || 'Something went wrong. Please try again.';
            return msg.replace('Firebase: ', '').replace('Error (auth/', '').replace(').', '');
    }
};
