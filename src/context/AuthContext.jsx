import React, { createContext, useContext, useState, useEffect } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updatePassword,
    deleteUser
} from "firebase/auth";
import { auth } from "../firebase";
import { createUserProfile } from "../services/dbService";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function googleLogin() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    await createUserProfile(user.uid, user.email);
                } catch (error) {
                    console.error("Error creating user profile:", error);
                }
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    function updateUserPassword(password) {
        if (currentUser) {
            return updatePassword(currentUser, password);
        }
        return Promise.reject("No user logged in");
    }

    function deleteUserAccount() {
        if (currentUser) {
            return deleteUser(currentUser);
        }
        return Promise.reject("No user logged in");
    }

    const value = {
        currentUser,
        loading,
        signup,
        login,
        googleLogin,
        logout,
        updateUserPassword,
        deleteUserAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
                    <div className="animate-in" style={{ fontWeight: 600, color: '#64748B' }}>Loading DoOrDue...</div>
                </div>
            )}
        </AuthContext.Provider>
    );
}
