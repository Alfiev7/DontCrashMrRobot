import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseclient';
import { FaMedal } from 'react-icons/fa';
import './Leaderboard.css';

function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [error, setError] = useState(null);

    const fetchLeaderboard = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('username, coin_balance')
            .order('coin_balance', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching leaderboard:', error.message);
            setError('Failed to load leaderboard');
        } else {
            setLeaders(data || []);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 60000);
        return () => clearInterval(interval);
    }, []);

    const getMedalColor = (index) => {
        switch(index) {
            case 0: return 'gold';
            case 1: return 'silver';
            case 2: return '#CD7F32'; // bronze
            default: return 'transparent';
        }
    };

    return (
        <div className="leaderboard">
            <h2 className="leaderboard-title">Leaderboard</h2>
            {error ? (
                <p className="leaderboard-error">{error}</p>
            ) : (
                <ul className="leaderboard-list">
                    {leaders.map((leader, index) => (
                        <li key={index} className="leaderboard-item">
                            <span className="leaderboard-rank">
                                {index < 3 ? (
                                    <FaMedal color={getMedalColor(index)} size={20} />
                                ) : (
                                    `#${index + 1}`
                                )}
                            </span>
                            <span className="leaderboard-username">{leader.username}</span>
                            <span className="leaderboard-balance">
                                {leader.coin_balance.toLocaleString()} 
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Leaderboard;

