import React, { useState } from 'react';
import { signUp } from '../utils/supabaseclient';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const { error } = await signUp(email, password, username);

        if (error) {
            setErrorMessage(error.message);
        } else {
            setSuccessMessage('Registration successful! Redirecting to home...');
            setEmail('');
            setPassword('');
            setUsername('');
            setTimeout(() => navigate('/'), 2000);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2 className="register-title">Create Account</h2>
                <form onSubmit={handleRegister} className="register-form">
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="register-button">Register</button>
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <p className="login-link">
                    Already have an account? <a href="/login">Log in</a>
                </p>
            </div>
        </div>
    );
}

export default Register;

