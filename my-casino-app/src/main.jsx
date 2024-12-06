import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './utils/AuthContext';
import { BalanceProvider } from './utils/BalanceContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BalanceProvider>
                <App />
            </BalanceProvider>
        </AuthProvider>
    </React.StrictMode>
);
