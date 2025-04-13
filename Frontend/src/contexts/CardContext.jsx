import { createContext, useContext, useState, useCallback } from 'react';

// Tạo Context
const CardContext = createContext();

// Provider
export const CardProvider = ({ cardId, children }) => {
    return (
        <CardContext.Provider
            value={{
                cardId,
            }}
        >
            {children}
        </CardContext.Provider>
    );
};

// Custom hook
export const useCard = () => {
    const context = useContext(CardContext);
    if (!context) {
        throw new Error('useCard phải dùng trong CardProvider');
    }
    return context;
};
