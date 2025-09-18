import React, { useState, useRef } from "react";
import {
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  Avatar,
  Tooltip,
  Popper,
  Paper,


} from "@mui/material";
import { ClickAwayListener } from "@mui/material";


import { useNavigate, useLocation } from "react-router-dom";
import { Menu as MenuIcon, Logout as LogoutIcon } from "@mui/icons-material";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import InsightsIcon from "@mui/icons-material/Insights";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ChecklistIcon from '@mui/icons-material/Checklist';
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CloseIcon from "@mui/icons-material/Close";


const Sidebar = ({ children, handleLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const drawerWidth = open ? (isMobile ? 200 : 220) : 62;
  const [anchorEl, setAnchorEl] = useState('');
  const toolbarRef = useRef('');

  const toggleDrawer = () => setOpen(!open);
  const handleLogoutClick = () => {
    setAnchorEl('');
    if (handleLogout) {
      handleLogout();
    } else {
      localStorage.clear();
      navigate("/login");
      window.location.reload();
    }
  };

  const profileImg = localStorage.getItem("pic");
  const name = localStorage.getItem("fullname");
 
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setOpen(false);
  };

  const handleProfileClick = () => {
    setAnchorEl(anchorEl ? null : toolbarRef.current);
  };

  const allLinks = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <DashboardCustomizeIcon sx={{ color: "#00695c" }} />,
    }   ,       
    {
      path: "/galley",
      label: "Gallery",
      icon: <InsightsIcon sx={{ color: "#00695c" }} />,
    }          
     
  ];


  const rainbowPulse = {
    borderRadius: "50%",
    padding: "2px", // creates the ring
    background: "conic-gradient(red, orange, yellow, green, blue, indigo, violet, red)",
    animation: "rotate 4s linear infinite",
    "@keyframes rotate": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };




  return (
    <Box sx={{ display: "flex", bgcolor: "#f8f9fa" }}>
      <AppBar position="fixed" sx={{ backgroundColor: "#265774ff", boxShadow: "none", height: "64px", }}>
        <Toolbar ref={toolbarRef} sx={{ position: "relative" }}>
          <Box sx={{ ...rainbowPulse, mr: 2 }}>
            <IconButton
              color="inherit"
              onClick={toggleDrawer}
              sx={{
                borderRadius: "50%",
                backgroundColor: "#0d47a1",
                "&:hover": { backgroundColor: "#0d47a1" },
              }}
            >
              {open ? (
                <CloseIcon fontSize="medium" sx={{ color: "#fff" }} />
              ) : (
                <MenuIcon fontSize="medium" sx={{ color: "#fff" }} />
              )}
            </IconButton>
          </Box>

          {/* Left aligned "Gautam Solar" */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: 1,
              color: "#ffffff",
              userSelect: "none",
            }}
          >
            Gautam Solar
          </Typography>

          {/* Center aligned "Quality" */}
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontWeight: 600,
              letterSpacing: 1,
              color: "#ffffff",
              userSelect: "none",
            }}
          >
            Company Base
          </Typography>

          {/* Spacer to push avatar right */}
          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={`Hi, ${name}` || "Profile"}>
            <Avatar
              src={profileImg}
              onClick={handleProfileClick}
              sx={{ cursor: "pointer", border: "2px solid #fff" }}
            />
          </Tooltip>
        </Toolbar>


        <Box sx={{ position: "relative" }}>
          <Tooltip title={`Hi, ${name}` || "Profile"}>
            <Avatar
              src={profileImg}
              onClick={handleProfileClick}
              sx={{ cursor: "pointer", border: "2px solid #fff" }}
            />
          </Tooltip>

          {anchorEl && (
            <Paper
              sx={{
                position: "absolute",
                top: "1px",
                right: 0,
                borderRadius: 2,
                textAlign: "center",
                backgroundColor: "#ffffff",
                boxShadow: 3,
                p: 2,
                minWidth: 160,
              }}
            >
              <Avatar
                src={profileImg}
                sx={{ width: 60, height: 60, mb: 1, mx: "auto" }}
              />
              {name && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#333",
                    mb: 1,
                    wordBreak: "break-word",
                  }}
                >
                 Hii, {name}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleLogoutClick}
                startIcon={<LogoutIcon />}
                sx={{ textTransform: "none" }}
              >
                Logout
              </Button>
            </Paper>
          )}

        </Box>



      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            top: 64,
            bgcolor: "#ffffff",
            borderRight: "1px solid #e0e0e0",
            transition: "width 0.3s",
            p: 1,
          },
        }}
      >
        <List>
          {allLinks.map((item, index) => (
            <ListItemButton
              key={index}
              onClick={() => handleNavigation(item.path)}
              sx={{
                my: 0.5,
                borderRadius: 2,
                bgcolor: location.pathname === item.path ? "#e3f2fd" : "transparent",
                '&:hover': { bgcolor: "#f1f8e9" },
                display: "flex",
                alignItems: "center",
                justifyContent: open ? "flex-start" : "center",
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 0 }}>{item.icon}</ListItemIcon>
              {open && (
                <Tooltip title={item.label} arrow placement="right">
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: "#424242",
                      px: 1,
                      py: 0.5,
                      userSelect: "none",
                      cursor: "pointer",
                    }}
                    noWrap
                  >
                    {item.label}
                  </Typography>
                </Tooltip>
              )}

            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, mt: 8, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
        {children}
      </Box>
    </Box>
  );
};

export default Sidebar;