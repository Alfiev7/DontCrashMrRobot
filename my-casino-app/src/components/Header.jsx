import React from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { supabase } from '../utils/supabaseclient';
import { FaCoins, FaSignOutAlt } from 'react-icons/fa';

function Header({ coinsBalance }) {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            setUser(null);
            navigate('/login');
        }
    };

    // Conditionally render content based on `user`
    if (!user) {
        return null; // Render nothing if no user is logged in
    }

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-balance">
                    <FaCoins className="coin-icon" />
                    <span className="balance-amount">{coinsBalance.toLocaleString()}</span>
                </div>
                <div className="header-right">
                    <Link to="/" className="logo-link">
                        <h1 className="header-title">DON'T CRASH MR ROCKET</h1>
                    </Link>
                    <nav className="header-nav">
                        <button onClick={handleSignOut} className="nav-item signout-button">
                            Sign Out <FaSignOutAlt />
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;
