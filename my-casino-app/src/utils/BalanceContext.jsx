
import React, { createContext, useContext, useState } from 'react';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
    const [coinsBalance, setCoinsBalance] = useState(0);

    return (
        <BalanceContext.Provider value={{ coinsBalance, setCoinsBalance }}>
            {children}
        </BalanceContext.Provider>
    );
};

export const useBalance = () => useContext(BalanceContext);
