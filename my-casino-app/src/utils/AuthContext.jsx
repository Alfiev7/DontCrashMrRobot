import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getUser } from './supabaseclient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { user, error } = await getUser();
            if (error) {
                console.error('Error fetching user data:', error.message);
            }
            setUser(user || null);
            setLoading(false);
        };
        fetchUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchUser(); // Re-fetch user details on auth state change
            } else {
                setUser(null); // Clear user on logout
            }
        });

        return () => {
            subscription?.unsubscribe(); // Properly unsubscribe the listener
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
