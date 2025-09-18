import axios from 'axios';

// Global variables to track API calls
let currentController = null;
let isApiCallInProgress = false;
let lastCallTime = 0;
const CALL_INTERVAL = 5000; // 5 seconds minimum gap between calls

const performStatusCheck = async (handleLogout, versionNo) => {
  const path = "https://maintenance.umanerp.com/api/";
  const personId = localStorage.getItem('user');
  const isLogin = localStorage.getItem('islogin');
  const token = localStorage.getItem('token');

  // Check if user is logged in
  if (isLogin !== 'true' || !personId || !token) {
    return;
  }
  if (isApiCallInProgress) {
    return;
  }

  const currentTime = Date.now();
  if (currentTime - lastCallTime < CALL_INTERVAL) {
    return;
  }

  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();
  isApiCallInProgress = true;
  lastCallTime = currentTime;

  try {
    const response = await axios.post(`${path}Employee/CheckActive`, {
      personid: personId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 15000,
      signal: currentController.signal
    });

    const data = response.data;

    if (data.status === 'Inactive' || data.status === false) {
      handleLogout();
      return;
    }

    if (data.versionName && data.versionName !== versionNo) {
      handleLogout();
      return;
    }
  } catch (err) {
    if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
      return;
    }

    if (err.response) {
      const { status } = err.response;
      if (status === 401 || status === 403) {
        handleLogout();
      }
    }
  } finally {
    isApiCallInProgress = false;
    currentController = null;
  }
};

export const checkStatus = performStatusCheck;
