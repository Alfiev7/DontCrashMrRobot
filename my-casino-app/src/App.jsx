import Header from './components/Header';
import RocketGame from './components/RocketGame';
import Register from './components/Register';
import Login from './components/Login';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './utils/AuthContext';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return user ? children : <Navigate to="/login" replace />;
}

function App() {
    const { user } = useAuth();
    const [coinsBalance, setCoinsBalance] = useState(0);

    useEffect(() => {
        if (user && user.coin_balance) {
            setCoinsBalance(user.coin_balance);
        }
    }, [user]);

    return (
        <Router>
            <Header coinsBalance={coinsBalance} />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <RocketGame coinsBalance={coinsBalance} setCoinsBalance={setCoinsBalance} />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
