import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vwgvmkwnrmirpvomtzjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Z3Zta3ducm1pcnB2b210emp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MDA2NTMsImV4cCI6MjA0OTA3NjY1M30.NlXl9Zy_U0ywsutuFxrOTWpJ3SGjX95KTa0HIGjxz04';

export const supabase = createClient(supabaseUrl, supabaseKey);



export const signUp = async (email, password, username) => {
    // Sign up the user in Supabase auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Error signing up user:', error.message);
        return { error };
    }

    const userId = data.user?.id; // Ensure we have the user ID
    console.log('Signed-up user ID:', userId);

    if (userId) {
        // Attempt to insert the username into the `users` table
        const { error: insertError } = await supabase.from('users').insert([
            { id: userId, username }, // Save the user ID and username
        ]);

        if (insertError) {
            console.error('Error inserting user into users table:', insertError.message);
            return { error: insertError };
        }
    }

    return { error: null }; // Success
};


export const getUser = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
        console.error('Error fetching user from auth:', authError.message);
        return { user: null, error: authError };
    }

    const userId = authData.user?.id;
    if (userId) {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('username, coin_balance')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('Error fetching user data from users table:', userError.message);
            return { user: authData.user, error: userError };
        }

        // Merge the username and coin balance with the auth data
        return {
            user: { ...authData.user, username: userData.username, coin_balance: userData.coin_balance },
            error: null,
        };
    }

    return { user: authData.user, error: null };
};

export const updateUserBalance = async (userId, newBalance) => {
    const { data, error } = await supabase
        .from('users')
        .update({ coin_balance: newBalance })
        .eq('id', userId);

    if (error) {
        console.error('Error updating user balance:', error.message);
        return { success: false, error };
    }

    return { success: true, data };
};

export const getUserBalance = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('coin_balance')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user balance:', error.message);
        return { balance: null, error };
    }

    return { balance: data.coin_balance, error: null };
};
