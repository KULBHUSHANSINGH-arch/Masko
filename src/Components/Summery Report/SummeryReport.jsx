import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import axios from 'axios';
import Select from 'react-select';
import { useRef } from 'react';
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { components } from 'react-select';
import { FiDownload } from "react-icons/fi";

const SummeryReport = () => {
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [FromDate, setFromDate] = useState('');
    const [ToDate, setToDate] = useState('');
    const [WorkLocation, setWorkLocation] = useState([]);
    const [WorkLocationList, setWorkLocationList] = useState([]);
    const [CurrentUser, setCurrentUser] = useState('');
    const [isDownloadVisible, setIsDownloadVisible] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState("")
    const [message, setMessage] = useState('');
    const [Shift, setShift] = useState({ value: 'ALL', label: 'ALL' });



    useEffect(() => {
        const CurrentUser = localStorage.getItem('user');
        setCurrentUser(CurrentUser);
        getWorkLocationListData();
    }, []);


    const ShiftList = [
        { value: 'DAY', label: 'DAY' },
        { value: 'NIGHT', label: 'NIGHT' },
        { value: 'ALL', label: 'ALL' },
    ];

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
        setShift('');
        setWorkLocation([]);
        setErrors({});
        setIsDownloadVisible(false);

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

    /** Tabel Data */
    const fetchData = async (e) => {
        e.preventDefault();
        const isValid = isValidation();
        if (!isValid) {
            return;
        }
        try {
            setLoading(true);
            setIsDownloadVisible(false); 

            const url = 'https://maintenance.umanerp.com/api/';
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

            const response = await axios.post(
                `${url}TestEquipmet/GetGradingSummaryReport`,
                payload
            );

            if (response.data?.URL) {
                setDownloadUrl(response.data.URL);
                setIsDownloadVisible(true);
                setMessage("");
                setFromDate('');
                setToDate('');
                setShift('');
                setWorkLocation([]);
            } else {
                // Show *only* what API sends in `msg`, else empty
                setMessage(response.data?.msg || "");
                setDownloadUrl("");
                setIsDownloadVisible(false);
            }

        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data.msg || "");
            } else {
                setMessage("");
            }

            setDownloadUrl("");
            setIsDownloadVisible(false);
        } finally {
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

    const getWorkLocationListData = async () => {
        try {
            const url = 'https://maintenance.umanerp.com/api/';
            const response = await axios.post(
                `${url}Employee/WorkLocationList`,
                {},
                { headers: { 'Content-Type': 'application/json; charset=UTF-8' } }
            );

            if (response.status === 200 && response.data?.data) {
                const workLocations = response.data.data.map(wl => ({
                    value: wl.workLocationId,
                    label: wl.workLocationName
                }));
                const allOption = { value: "", label: "All" };
                const finalList = [allOption, ...workLocations];
                setWorkLocationList(finalList);
                setWorkLocation([allOption]);
            }
        } catch (error) {
            console.error("❌ Error fetching WorkLocationList:", error);
        }
    };


    const CustomButton = ({
        children,
        onClick,
        bgColor,
        hoverColor,
        textColor = "#fff",
        minWidth = "120px",
        padding = "10px 20px",
        fontSize = "15px",
        icon = null,
    }) => {
        const [hover, setHover] = useState(false);

        return (
            <button
                onClick={onClick}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    background: hover ? hoverColor : bgColor,
                    color: textColor,
                    border: "none",
                    borderRadius: "50px",
                    minWidth,
                    padding,
                    fontSize,
                    fontWeight: "500",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                }}
            >
                {icon}
                {children}
            </button>
        );
    };


    const CheckboxOption = (props) => {
        return (
            <components.Option {...props}>
                <input
                    type="checkbox"
                    checked={props.isSelected}
                    onChange={() => null}
                    style={{ marginRight: 8 }}
                />
                {props.label}
            </components.Option>
        );
    };

    return (
        <div className="container-fluid py-4">
            <div className="text-center mb-3">
                <h1
                    style={{
                        
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#2c3e50",
                        borderBottom: "3px solid #3498db",
                        display: "inline-block",
                        paddingBottom: "8px",
                        textTransform: "uppercase",
                    }}
                >
                    FQC Summary Report
                </h1>
            </div>

            <div
                className="p-3"
                style={{
                    background: "#f9f9f9",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
            >
                <Row className="g-3 align-items-end justify-content-center">
                    {/* From Date */}
                    <Col md={3}>
                        <Form.Group controlId="FromDate">
                            <Form.Label>From Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="FromDate"
                                value={FromDate}
                                onChange={handleDateChange}
                                max={new Date().toISOString().split("T")[0]}
                            />
                            {errors.FromDate && (
                                <div style={{ fontSize: "13px" }} className="text-danger mt-1">
                                    {errors.FromDate}
                                </div>
                            )}
                        </Form.Group>
                    </Col>

                    {/* To Date */}
                    <Col md={3}>
                        <Form.Group controlId="ToDate">
                            <Form.Label>To Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="ToDate"
                                value={ToDate}
                                onChange={handleDateChange}
                                min={FromDate}
                                max={new Date().toISOString().split("T")[0]}
                            />
                            {errors.ToDate && (
                                <div style={{ fontSize: "13px" }} className="text-danger mt-1">
                                    {errors.ToDate}
                                </div>
                            )}
                        </Form.Group>
                    </Col>

                    {/* Work Location */}
                    <Col md={3}>
                        <Form.Label>Work Location</Form.Label>
                        <Select
                            value={WorkLocation}
                            onChange={(selected) => setWorkLocation(selected)}
                            options={WorkLocationList}
                            placeholder="Select Work Location"
                            closeMenuOnSelect={false}
                            isClearable
                            isMulti
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            components={{ Option: CheckboxOption }}
                            styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </Col>
                </Row>

                <Row className="g-3 align-items-end justify-content-left">

                    {/* Shift */}
                    <Col md={3}>
                        <Form.Label>Shift</Form.Label>
                        <Select
                            value={Shift}
                            onChange={(selected) => setShift(selected)}
                            options={ShiftList}
                            placeholder="Select Shift"
                            isClearable
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </Col>
                </Row>


                {/* Action Buttons */}
                <Row className="mt-4 justify-content-center" style={{ gap: "10px" }}>
                    <Col xs="auto">
                        <CustomButton
                            onClick={handleReset}
                            bgColor="#f39c12" 
                            hoverColor="#e67e22"
                            minWidth="110px"
                            padding="10px 16px"
                        >
                            🔄 Reset
                        </CustomButton>
                    </Col>
                    <Col xs="auto">
                        <CustomButton
                            onClick={fetchData}
                            bgColor="#2980b9" 
                            hoverColor="#1f618d"
                            minWidth="130px"
                            padding="10px 18px"
                        >
                            🚀 Click Here
                        </CustomButton>
                    </Col>
                </Row>

                {/* Download Button */}
                {isDownloadVisible && (
                    <Row className="mt-3 justify-content-center">
                        <Col xs="auto">
                            <CustomButton
                                onClick={handleDownload}
                                bgColor="#27ae60" 
                                hoverColor="#1e8449"
                                minWidth="180px"
                                padding="12px 22px"
                                fontSize="16px"
                                icon={<FiDownload size={18} />}
                            >
                                Download Report
                            </CustomButton>
                        </Col>
                    </Row>
                )}



                {message && (
                    <div className="text-center mt-3">
                        <span className="text-danger fw-semibold">{message}</span>
                    </div>
                )}
            </div>
        </div>
    );

};

export default SummeryReport;