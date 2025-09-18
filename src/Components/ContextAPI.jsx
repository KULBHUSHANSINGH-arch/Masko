import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);
 
    useEffect(() => {
        localStorage.setItem("url", "https://maintenance.umanerp.com/api/"); 
    }, []);

    // Initialize token from localStorage on app start
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const isLogin = localStorage.getItem('islogin');
        
        if (storedToken && isLogin === 'true') {
            setToken(storedToken);
        }
        setIsLoading(false);
    }, []);

    // Update localStorage when token changes
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        }
    }, [token]);

    const value = {
        token,
        setToken,
        isLoading
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};