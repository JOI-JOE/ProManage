import { createContext, useContext } from 'react';

// Tạo Context
const CardContext = createContext();

// Provider
export const CardProvider = ({ card, children }) => {
    return (

        <CardContext.Provider
            value={{
                cardId: card?.id,
                badges: card?.badges || []
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
