import { Navigate } from 'react-router-dom';

const ProtectedRoutes = ({ children }) => {
  const token = localStorage.getItem('token');
  const isLogin = localStorage.getItem('islogin');
  const user = localStorage.getItem('user');

  // Check if user is properly logged in
  if (!token || !user || isLogin !== 'true') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;