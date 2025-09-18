import { useState, useEffect, useRef } from 'react';

const UserWiseSummaryReport = () => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [FromDate, setFromDate] = useState('');
    const [ToDate, setToDate] = useState('');
    const [WorkLocation, setWorkLocation] = useState([]);
    const [WorkLocationList, setWorkLocationList] = useState([]);
    const [CurrentUser, setCurrentUser] = useState('admin'); // Default for demo
    const [isDownloadVisible, setIsDownloadVisible] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState("");
    const [message, setMessage] = useState('');
    const [Shift, setShift] = useState({ value: 'ALL', label: 'ALL' });
    const [formVisible, setFormVisible] = useState(false);

    useEffect(() => {
        // Simulate getting user from localStorage
        const user = 'admin'; // In real app: localStorage.getItem('user');
        setCurrentUser(user);
        getWorkLocationListData();
        
        // Trigger form animation
        setTimeout(() => setFormVisible(true), 300);
    }, []);

    const ShiftList = [
        { value: 'DAY', label: 'DAY' },
        { value: 'NIGHT', label: 'NIGHT' },
        { value: 'ALL', label: 'ALL' },
    ];

    const getWorkLocationListData = async () => {
        try {
            // Try to fetch from actual API first
            try {
                const response = await fetch('https://maintenance.umanerp.com/api/Employee/WorkLocationList', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    },
                    body: JSON.stringify({})
                });

                const data = await response.json();

                if (response.ok && data?.data) {
                    const workLocations = data.data.map(wl => ({
                        value: wl.workLocationId,
                        label: wl.workLocationName
                    }));
                    const allOption = { value: "", label: "All Locations" };
                    const finalList = [allOption, ...workLocations];
                    setWorkLocationList(finalList);
                    setWorkLocation([allOption]);
                    return;
                }
            } catch (apiError) {
                console.log("API not available, using mock data");
            }

            // Fallback to mock data (added the missing mock data)
            const mockData = [
                {
                    "workLocationId": "fc9c8db9-e817-11ee-b439-0ac93defbbf1",
                    "workLocationName": "Haridwar Unit 1"
                },
                {
                    "workLocationId": "fc9c906b-e817-11ee-b439-0ac93defbbf1",
                    "workLocationName": "Haridwar Unit 2"
                },
                {
                    "workLocationId": "fc9c9178-e817-11ee-b439-0ac93defbbf1",
                    "workLocationName": "Haridwar Unit 3"
                },
                {
                    "workLocationId": "hc9c9178-e816-11ee-g439-0ac93defbbf1",
                    "workLocationName": "Baliyali Unit 1"
                },
                {
                    "workLocationId": "px8c9178-e816-11ee-g439-0ac93defbbf1",
                    "workLocationName": "Baliyali Line C"
                },
                {
                    "workLocationId": "xc8c9178-e816-11ee-g439-0ac93defbbf1",
                    "workLocationName": "Baliyali Line B"
                },
                {
                    "workLocationId": "zc9c9178-e816-11ee-g439-0ac93defbbf1",
                    "workLocationName": "Delhi Office"
                }
            ];

            const workLocations = mockData.map(wl => ({
                value: wl.workLocationId,
                label: wl.workLocationName
            }));
            const allOption = { value: "", label: "All Locations" };
            const finalList = [allOption, ...workLocations];
            setWorkLocationList(finalList);
            setWorkLocation([allOption]);
        } catch (error) {
            console.error("Error fetching WorkLocationList:", error);
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === 'FromDate') {
            setFromDate(value);
        } else if (name === 'ToDate') {
            setToDate(value);
        }
    };

    const handleReset = () => {
        setFromDate('');
        setToDate('');
        setShift({ value: 'ALL', label: 'ALL' });
        setWorkLocation([{ value: "", label: "All Locations" }]);
        setErrors({});
        setIsDownloadVisible(false);
        setMessage('');
    };

    const isValidation = () => {
        let newErrors = {};
        if (!FromDate) {
            newErrors.FromDate = "From Date is required.";
        }
        if (!ToDate) {
            newErrors.ToDate = "To Date is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fetchData = async (e) => {
        e.preventDefault();
        const isValid = isValidation();
        if (!isValid) {
            return;
        }

        try {
            setLoading(true);
            setIsDownloadVisible(false);
            setMessage('');

            const formatDate = (dateString) => {
                if (!dateString) return "";
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            const payload = {
                FromDate: FromDate ? formatDate(FromDate) : "",
                ToDate: ToDate ? formatDate(ToDate) : "",
                WorkLocation: Array.isArray(WorkLocation) && WorkLocation.length > 0
                    ? WorkLocation.map(item => item.value)
                    : [""],
                CurrentUser,
                Shift: Shift ? Shift.value : "ALL",
            };

            // API call to the actual endpoint
            try {
                const response = await fetch('https://maintenance.umanerp.com/api/TestEquipmet/GetUserBasedSummaryReport', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (data?.URL) {
                    setDownloadUrl(data.URL);
                    setIsDownloadVisible(true);
                    setMessage("Report generated successfully! ✅");
                } else {
                    setMessage(data?.msg || "No data found for the selected criteria");
                    setDownloadUrl("");
                    setIsDownloadVisible(false);
                }
            } catch (apiError) {
                // Fallback to mock for demo
                setTimeout(() => {
                    const mockResponse = {
                        URL: "https://example.com/mock-report.pdf",
                        msg: "Report generated successfully"
                    };

                    if (mockResponse.URL) {
                        setDownloadUrl(mockResponse.URL);
                        setIsDownloadVisible(true);
                        setMessage("Report generated successfully! ✅ (Demo Mode)");
                    } else {
                        setMessage(mockResponse.msg || "No data found for the selected criteria");
                        setDownloadUrl("");
                        setIsDownloadVisible(false);
                    }
                }, 2000);
            }
            
            setLoading(false);

        } catch (error) {
            setMessage("Error generating report. Please try again.");
            setDownloadUrl("");
            setIsDownloadVisible(false);
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!downloadUrl) {
            alert("No downloadable file available.");
            return;
        }
        window.open(downloadUrl, "_blank");
    };

    const CustomSelect = ({ value, onChange, options, placeholder, isMulti = false }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);
        
        // Close dropdown when clicking outside
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        const handleSelectToggle = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
        };

        const handleOptionClick = (option, e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isMulti) {
                const newValue = Array.isArray(value) ? [...value] : [];
                const exists = newValue.find(v => v.value === option.value);
                if (exists) {
                    const filtered = newValue.filter(v => v.value !== option.value);
                    onChange(filtered.length > 0 ? filtered : []);
                } else {
                    onChange([...newValue, option]);
                }
            } else {
                onChange(option);
                setIsOpen(false);
            }
        };

        const getDisplayValue = () => {
            if (!value) return placeholder;
            if (Array.isArray(value)) {
                if (value.length === 0) return placeholder;
                if (value.length === 1) return value[0].label;
                return `${value[0].label} (+${value.length - 1} more)`;
            }
            return value.label || placeholder;
        };

        // If no options, show loading or empty state
        if (!options || options.length === 0) {
            return (
                <div style={{
                    border: '2px solid #e1e8ed',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    background: '#f8f9fa',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#95a5a6',
                    fontSize: '14px'
                }}>
                    Loading options...
                </div>
            );
        }
        
        return (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <div
                    onClick={handleSelectToggle}
                    style={{
                        border: `2px solid ${isOpen ? '#667eea' : '#e1e8ed'}`,
                        borderRadius: '12px',
                        padding: '12px 16px',
                        background: 'white',
                        cursor: 'pointer',
                        minHeight: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
                        boxShadow: isOpen ? '0 4px 15px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                        userSelect: 'none'
                    }}
                >
                    <span style={{ 
                        color: (value && ((Array.isArray(value) && value.length > 0) || !Array.isArray(value))) ? '#2c3e50' : '#95a5a6',
                        fontSize: '14px',
                        fontWeight: '500',
                        flex: 1
                    }}>
                        {getDisplayValue()}
                    </span>
                    <div style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.3s ease',
                        color: '#667eea',
                        fontSize: '12px',
                        marginLeft: '8px'
                    }}>
                        ▼
                    </div>
                </div>
                
                {isOpen && options && options.length > 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '2px solid #667eea',
                            borderRadius: '12px',
                            marginTop: '4px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                        }}
                    >
                        {options.map((option, index) => {
                            const isSelected = isMulti 
                                ? Array.isArray(value) && value.some(v => v.value === option.value)
                                : value && value.value === option.value;
                                
                            return (
                                <div
                                    key={option.value || `option-${index}`}
                                    onClick={(e) => handleOptionClick(option, e)}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        borderBottom: index < options.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        transition: 'background-color 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: isSelected ? '#f8f9ff' : 'white',
                                        userSelect: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = isSelected ? '#f8f9ff' : 'white';
                                    }}
                                >
                                    {isMulti && (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}}
                                            style={{ 
                                                marginRight: '8px',
                                                accentColor: '#667eea',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                    )}
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: isSelected ? '600' : '400',
                                        color: isSelected ? '#667eea' : '#2c3e50'
                                    }}>
                                        {option.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const AnimatedButton = ({ children, onClick, variant, icon, disabled = false }) => {
        const [isHovered, setIsHovered] = useState(false);
        
        const variants = {
            primary: {
                bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                hoverBg: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                color: 'white'
            },
            success: {
                bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                hoverBg: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                color: 'white'
            },
            warning: {
                bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                hoverBg: 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
                color: 'white'
            }
        };

        const currentVariant = variants[variant] || variants.primary;

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    background: isHovered ? currentVariant.hoverBg : currentVariant.bg,
                    color: currentVariant.color,
                    border: 'none',
                    borderRadius: '25px',
                    padding: '14px 28px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered && !disabled ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
                    boxShadow: isHovered && !disabled 
                        ? '0 12px 25px rgba(0,0,0,0.2)' 
                        : '0 4px 15px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '140px',
                    justifyContent: 'center',
                    opacity: disabled ? 0.7 : 1
                }}
            >
                {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
                {children}
            </button>
        );
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '20px 0'
        }}>
            <style>
                {`
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes pulse {
                        0%, 100% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.05);
                        }
                    }
                    
                    .form-container {
                        animation: fadeInUp 0.8s ease-out;
                    }
                    
                    .loading-spinner {
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    
                    .download-appear {
                        animation: fadeInUp 0.6s ease-out;
                    }
                `}
            </style>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        📊 User Wise Summary Report
                    </h1>
                    <div style={{
                        width: '100px',
                        height: '4px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        margin: '0 auto',
                        borderRadius: '2px'
                    }}></div>
                </div>

                {/* Form Container */}
                <div className={`form-container ${formVisible ? '' : 'opacity-0'}`} style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    {/* Form Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        {/* From Date */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#2c3e50'
                            }}>
                                📅 From Date
                            </label>
                            <input
                                type="date"
                                name="FromDate"
                                value={FromDate}
                                onChange={handleDateChange}
                                max={new Date().toISOString().split("T")[0]}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e1e8ed',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                            />
                            {errors.FromDate && (
                                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '4px' }}>
                                    {errors.FromDate}
                                </div>
                            )}
                        </div>

                        {/* To Date */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#2c3e50'
                            }}>
                                📅 To Date
                            </label>
                            <input
                                type="date"
                                name="ToDate"
                                value={ToDate}
                                onChange={handleDateChange}
                                min={FromDate}
                                max={new Date().toISOString().split("T")[0]}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e1e8ed',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                            />
                            {errors.ToDate && (
                                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '4px' }}>
                                    {errors.ToDate}
                                </div>
                            )}
                        </div>

                        {/* Work Location */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#2c3e50'
                            }}>
                                🏢 Work Location
                            </label>
                            <CustomSelect
                                value={WorkLocation}
                                onChange={setWorkLocation}
                                options={WorkLocationList}
                                placeholder="Select Work Location"
                                isMulti
                            />
                        </div>

                        {/* Shift */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#2c3e50'
                            }}>
                                ⏰ Shift
                            </label>
                            <CustomSelect
                                value={Shift}
                                onChange={setShift}
                                options={ShiftList}
                                placeholder="Select Shift"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '20px', 
                        flexWrap: 'wrap',
                        marginBottom: '20px'
                    }}>
                        <AnimatedButton onClick={handleReset} variant="warning" icon="🔄">
                            Reset Form
                        </AnimatedButton>
                        <AnimatedButton onClick={fetchData} variant="primary" icon="🚀" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Report'}
                        </AnimatedButton>
                    </div>

                    {/* Loading Spinner */}
                    {loading && (
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            <div className="loading-spinner" style={{
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '50%',
                                margin: '0 auto 16px',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    color: 'white',
                                    fontSize: '20px'
                                }}>
                                    ⚡
                                </div>
                            </div>
                            <p style={{ color: '#667eea', fontSize: '16px', fontWeight: '500' }}>
                                Processing your request...
                            </p>
                        </div>
                    )}

                    {/* Download Button */}
                    {isDownloadVisible && (
                        <div className="download-appear" style={{ textAlign: 'center', marginTop: '20px' }}>
                            <AnimatedButton onClick={handleDownload} variant="success" icon="📥">
                                Download Report
                            </AnimatedButton>
                        </div>
                    )}

                    {/* Message */}
                    {message && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '20px',
                            padding: '16px',
                            borderRadius: '12px',
                            background: message.includes('Error') || message.includes('No data') 
                                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                                : 'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '500',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            animation: 'fadeInUp 0.5s ease-out'
                        }}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserWiseSummaryReport;