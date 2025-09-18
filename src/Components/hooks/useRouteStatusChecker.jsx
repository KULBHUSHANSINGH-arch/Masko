import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { checkStatus } from '../Utils/checkStatus';

export const useRouteStatusChecker = (token, handleLogout, versionNo) => {
  const location = useLocation();
  const timeoutRef = useRef(null);
  const lastCallRef = useRef(0);
  const DEBOUNCE_DELAY = 2000; // 2 seconds debounce

  const callStatusCheck = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      const isLogin = localStorage.getItem('islogin');
      const storedToken = localStorage.getItem('token');
      const personId = localStorage.getItem('user');
        if (isLogin === 'true' && storedToken && personId) {
        checkStatus(handleLogout, versionNo);
      }
    }, DEBOUNCE_DELAY);
  };

  useEffect(() => {
    callStatusCheck();
        return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, handleLogout, versionNo]);

  useEffect(() => {
    const currentTime = Date.now();
    if (currentTime - lastCallRef.current > 5000) { 
      lastCallRef.current = currentTime;
      callStatusCheck();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [token, handleLogout, versionNo]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};