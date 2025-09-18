import { useState, useEffect, useContext, useCallback } from "react";
import { FaEnvelope, FaLock, FaUsers, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from "../ContextAPI";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useContext(AppContext);

  const versionNo = "V1.0.20250802.1510"; 
  const path = "https://maintenance.umanerp.com/api/";

  // Load saved data and fetch employees on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Load previously selected employees from localStorage
    const savedPersonIds = localStorage.getItem("personids");
    if (savedPersonIds) {
      try {
        const personIdsArray = JSON.parse(savedPersonIds);
        console.log("Loaded person IDs from localStorage:", personIdsArray);
      } catch (error) {
        console.error("Error parsing saved person IDs:", error);
        localStorage.removeItem("personids");
      }
    }
    
    fetchEmployeeList();
  }, []);

  const fetchEmployeeList = useCallback(async () => {
    try {
      const response = await axios.post(`${path}Employee/GetList`, {
        Department: "849684af-e816-11ee-b439-0ac93defbbf1"
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data?.status === true) {
        const employees = response.data.data || [];
        setEmployeeList(employees);
        
        // Restore previously selected employees if they exist in localStorage
        const savedPersonIds = localStorage.getItem("personids");
        if (savedPersonIds) {
          try {
            const personIdsArray = JSON.parse(savedPersonIds);
            const previouslySelected = employees.filter(emp => 
              personIdsArray.includes(emp.PersonID)
            );
            setSelectedEmployees(previouslySelected);
          } catch (error) {
            console.error("Error restoring selected employees:", error);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching employee list:", err);
      toast.error("Failed to load employee list.");
      setEmployeeList([]);
    }
  }, [path]);

  // Handle dropdown toggle
  const handleDropdownToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(prev => {
      if (!prev) {
        setSearchQuery("");
      }
      return !prev;
    });
  }, []);

  // Handle employee selection
  const handleEmployeeToggle = useCallback((e, employee) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedEmployees(prev => {
      const isSelected = prev.some(emp => emp.PersonID === employee.PersonID);
      let updatedSelection;
      
      if (isSelected) {
        updatedSelection = prev.filter(emp => emp.PersonID !== employee.PersonID);
      } else {
        updatedSelection = [...prev, employee];
      }
      
      // Store updated selection in localStorage immediately
      const personIds = updatedSelection.map(emp => emp.PersonID);
      localStorage.setItem("personids", JSON.stringify(personIds));
      
      return updatedSelection;
    });
  }, []);

  // Handle login
  const handleLogin = useCallback(async () => {
    setError('');
    setIsLoading(true);
    
    // Validation
    if (!email.trim()) {
      toast.error("Email is required.");
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required.");
      setIsLoading(false);
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one involved person.");
      setIsLoading(false);
      return;
    }

    const params = {
      loginid: email,
      password: password,
      versionName: versionNo,
    };
    
    try {
      const response = await axios.post(`${path}Employee/fqcLogin`, params, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      if (response.status === 200 && data.status === true) {
        // Store user data
        localStorage.setItem("islogin", "true");
        localStorage.setItem("site", path);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", data.PersonData[0].PersonID);
        localStorage.setItem("designation", data.PersonData[0].Designation || '');
        localStorage.setItem("workLocation", data.PersonData[0].WorkLocation || '');
        localStorage.setItem("WorkLocationName", data.PersonData[0].WorkLocationName || '');
        localStorage.setItem("fullname", data.PersonData[0].Name || '');
        localStorage.setItem("department", data.PersonData[0].Department || '');
        localStorage.setItem("versionNo", versionNo);
        localStorage.setItem("pic", data.PersonData[0].ProfileImg || '');
        
        // Store selected employee IDs
        const personIds = selectedEmployees.map(emp => emp.PersonID);
        localStorage.setItem("personids", JSON.stringify(personIds));
        
        setToken(data.token);
        // navigate("/fqcList");
        navigate("/dashboard");
      }

    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          if (data.msg === "Wrong Password") {
            toast.error("Password is not valid.");
          } else if (data.msg === "No active user found with this Login ID.") {
            toast.error("No active user found with this Login ID.");
          } else if (data.msg === "Wrong EmployeeId") {
            toast.error("Login ID is not valid.");
          } else {
            toast.error("Invalid credentials.");
          }
        } else if (status === 401) {
          toast.error("Login ID is not registered.");
        } else if (status === 403) {
          toast.error("A new version is available. Please update your app.");
        } else {
          toast.error("Something went wrong.");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, selectedEmployees, versionNo, path, setToken, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Filter employees based on search query
  const filteredEmployees = Array.isArray(employeeList) 
    ? employeeList.filter(employee =>
        employee.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.Designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.Department?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Clear all selected employees
  const clearAllSelections = useCallback((e) => {
    e.stopPropagation();
    setSelectedEmployees([]);
    localStorage.setItem("personids", JSON.stringify([]));
  }, []);

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Logo */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              background: '#7DD3FC',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              fontWeight: 'bold',
              position: 'relative'
            }}>
              QC
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                left: '10px',
                fontSize: '20px',
                transform: 'rotate(-20deg)'
              }}>🌿</div>
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                right: '10px',
                fontSize: '20px',
                transform: 'rotate(20deg) scaleX(-1)'
              }}>🌿</div>
            </div>
          </div>
          
          <h2 style={{
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '28px',
            fontWeight: '600',
            color: '#667eea',
            margin: '0 0 32px 0'
          }}>
            Welcome Back
          </h2>

          {/* Email Input */}
          <div style={{
            position: 'relative',
            marginBottom: '20px'
          }}>
            <div style={{
              position: 'relative',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <FaEnvelope style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '16px'
              }} />
              <input
                type="text"
                placeholder="Please Eneter Your ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: 'transparent',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{
            position: 'relative',
            marginBottom: '20px'
          }}>
            <div style={{
              position: 'relative',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <FaLock style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '16px'
              }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Please Eneter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 48px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: 'transparent',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Employee Dropdown */}
          <div style={{
            position: 'relative',
            marginBottom: isDropdownOpen ? '280px' : '32px',
            transition: 'margin-bottom 0.3s ease'
          }}>
            <div style={{
              position: 'relative',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <FaUsers style={{
                position: 'absolute',
                left: '16px',
                top: '18px',
                color: '#94a3b8',
                fontSize: '16px'
              }} />
              
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <button 
                  type="button"
                  onClick={handleDropdownToggle}
                  style={{ 
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: 'transparent',
                    outline: 'none',
                    color: selectedEmployees.length === 0 ? '#94a3b8' : '#1e293b',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                    boxSizing: 'border-box'
                  }}
                >
                  <span>
                    {selectedEmployees.length === 0 ? "Select Involved Persons" : `${selectedEmployees.length} selected`}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#667eea',
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}>
                    ▲
                  </span>
                </button>
                
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '0',
                    right: '0',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    zIndex: 9999,
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}>
                    {/* Search bar */}
                    <div style={{ padding: '12px' }}>
                      <input
                        type="text"
                        placeholder="🔍 Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          background: '#f8fafc',
                          boxSizing: 'border-box'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    {/* Employee list */}
                    {filteredEmployees.map((employee, index) => {
                      const isSelected = selectedEmployees.some(emp => emp.PersonID === employee.PersonID);
                      return (
                        <div
                          key={employee.PersonID}
                          style={{
                            padding: '12px',
                            cursor: 'pointer',
                            borderBottom: index === filteredEmployees.length - 1 ? 'none' : '1px solid #f1f5f9',
                            background: isSelected ? '#f0f9ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={(e) => handleEmployeeToggle(e, employee)}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.target.style.background = '#f8fafc';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = isSelected ? '#f0f9ff' : 'transparent';
                          }}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: isSelected ? '2px solid #667eea' : '2px solid #cbd5e1',
                            background: isSelected ? '#667eea' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isSelected && (
                              <span style={{ 
                                color: 'white', 
                                fontSize: '12px', 
                                fontWeight: 'bold'
                              }}>✓</span>
                            )}
                          </div>
                          
                          {/* Employee avatar */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {employee.ProfileImg ? (
                              <img
                                src={employee.ProfileImg}
                                alt={employee.Name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <span style={{
                                color: '#667eea',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}>
                                {employee.Name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          
                          {/* Employee details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '15px',
                              fontWeight: '500',
                              color: '#1e293b',
                              marginBottom: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {employee.Name}
                            </div>
                            <div style={{
                              fontSize: '13px',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {employee.Designation} • {employee.Department}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {filteredEmployees.length === 0 && searchQuery && (
                      <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        No employees found
                      </div>
                    )}
                    
                    {(!Array.isArray(employeeList) || employeeList.length === 0) && (
                      <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        No employees available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button 
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: isLoading ? '#94a3b8' : '#667eea',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.background = '#5a67d8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.background = '#667eea';
              }
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Continue'}
          </button>

          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Login;