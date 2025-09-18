import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./Components/Pages/Login";
import Sidebar from "./Components/Sidebar/Sidebar";
import ProtectedRoutes from "./Components/Best_Routes/ProtectedRoutes";
import PublicRoute from "./Components/Best_Routes/PublicRoute";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { RouteGuard } from "./Components/RouteGuard";
import { createContext } from "react";
import { useContext } from "react";
import { AppContext } from "./Components/ContextAPI";
import { useState } from "react";
import Create_Blog from "./Components/Admin_Panel/Create_Blog";
import Gallery from "./Components/Admin_Panel/Gallery";

export const LogoutContext = createContext();

const Layout = ({ handleLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar open={drawerOpen} setOpen={setDrawerOpen} />
      <Box component="main" sx={{ flexGrow: 1, p: 2, marginTop: "64px" }}>
        <Outlet context={{ drawerOpen }} />
      </Box>
    </Box>
  );
};

function App() {
  const { user } = useSelector((state) => state.user) || {};
  const { token } = useContext(AppContext);
  const versionNo = "V1.0.20250802.1510";

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("profilePic");
    localStorage.removeItem("Name");
    localStorage.removeItem("Token");
    localStorage.removeItem("Designation");
    localStorage.removeItem("WorkLocation");   
    localStorage.removeItem("department");
    window.location.href = "/login";
  };

 return (
    <Router>
      <RouteGuard
        token={token}
        handleLogout={handleLogout}
        versionNo={versionNo}
      >
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            element={
              <ProtectedRoutes>
                <Layout handleLogout={handleLogout} />
              </ProtectedRoutes>
            }
          >
            <Route path="/dashboard" element={<Create_Blog />} />
            <Route path="/galley" element={<Gallery />} />
           
          </Route>

          {/* Default redirect */}
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </RouteGuard>
    </Router>
  );
}

export default App;
