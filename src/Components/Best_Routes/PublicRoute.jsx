import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const user = localStorage.getItem("user");

  if (user && user !== "null") {
    // return <Navigate to="/fqcList" />;
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PublicRoute;