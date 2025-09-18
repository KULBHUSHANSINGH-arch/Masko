import { useState } from "react";
import {
  TextField, Button, Select, MenuItem, InputLabel, FormControl,
  IconButton, Box, Typography, Paper, Grid
} from "@mui/material";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const RoleList = [
  { key: "Teacher", value: "Teacher" },
  { key: "Student", value: "Student" },
  { key: "Institute", value: "Institute" },
];

const Registration = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let tempErrors = {};
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name) tempErrors.name = "Name is required";
    if (!emailRegex.test(formData.email)) tempErrors.email = "Invalid email format";
    if (formData.mobile.length > 10) tempErrors.mobile = "Mobile number cannot exceed 10 digits";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const response = await axios.post("https://your-api-endpoint.com/register", formData);
      alert("Registration Successful!");
      setFormData({ name: "", email: "", mobile: "", password: "", role: "" });
      setErrors({});
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Registration Failed!");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #121212, #1c1c1c)"
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 5,
          width: "90vw",
          maxWidth: 600,
          backgroundColor: "#a2a2a2",
          color: "#fff",
          borderRadius: 3,
          border: "2px solid #fff",
          boxShadow: "0px 0px 20px rgba(255, 255, 255, 0.2)",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#ffcc00" }}>
          Register
        </Typography>

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Name & Email */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                InputProps={{ startAdornment: <FaUser style={{ marginRight: 8, color: "#ffcc00" }} /> }}
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{ startAdornment: <FaEnvelope style={{ marginRight: 8, color: "#ffcc00" }} /> }}
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
          </Grid>

          {/* Mobile & Password */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile"
                type="number"
                value={formData.mobile}
                onChange={handleChange}
                InputProps={{ startAdornment: <FaPhone style={{ marginRight: 8, color: "#ffcc00" }} /> }}
                variant="outlined"
                error={!!errors.mobile}
                helperText={errors.mobile}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Create Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <FaLock style={{ marginRight: 8, color: "#ffcc00" }} />,
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: "#ffcc00" }}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                  ),
                }}
                variant="outlined"
              />
            </Grid>
          </Grid>

          {/* Role Selection */}
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select name="role" value={formData.role} onChange={handleChange} label="Role">
              {RoleList.map((role) => (
                <MenuItem key={role.key} value={role.value}>
                  {role.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Register Button */}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, backgroundColor: "#fef2c2", color: "#121212", fontWeight: "bold" }}>
            Register
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Registration;