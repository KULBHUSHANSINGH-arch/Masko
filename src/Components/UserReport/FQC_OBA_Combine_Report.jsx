// import React, { useState, useEffect } from 'react';
// import {Info, Filter, Download, Search, RefreshCw, RotateCcw } from 'lucide-react';
// import X from '@mui/icons-material/Close';


// import React, { useState, useEffect } from 'react';
// import { Filter, Search, Download, RotateCcw, RefreshCw, Info, X, BarChart3, Users, FileText, TrendingUp } from 'lucide-react';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  RotateCcw, 
  FileText, 
  Users, 
  BarChart3, 
  Info, 
  X,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { url } from '../URL/url';

const FQC_OBA_Combine_Report = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeIssueFilter, setActiveIssueFilter] = useState(null);
  
  // New filters
  const [fqcStatus, setFqcStatus] = useState('');
  const [obaPlace, setObaPlace] = useState('');
  
  // Mode selection
  const [reportMode, setReportMode] = useState('summary'); // 'summary' or 'userwise'

  // Image modal state
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchData = async (from = '', to = '') => {
    setLoading(true);
    try {
      const res = await fetch(`${url}/TestEquipmet/getOKBarcodesInOBA`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromDate: from,
          toDate: to,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const response = await res.json();
      
      // Handle different data structures for IN SIDE vs OUT SIDE
      const cleaned = response.data.map(item => {
        // For OUT SIDE data structure
        if (item.inOutType === 'OUT SIDE') {
          return {
            fqcnewid: item.fqcnewid,
            currentuser: item.currentuser,
            pallateType: item.packType || 'Full Pack',
            issueStatus: item.status || item.issueStatus,
            productBarcode: item.productBarcode || '',
            line: item.selectedParty || '',
            fqcperson: item.fqcperson,
            fqcDate: item.fqcDate,
            Remark: item.Remark || item.remarks,
            party: item.selectedParty,
            obaCreatedOn: item.obaCreatedOn || item.createdOn,
            obaIssueNames: item.obaIssueNames || '',
            obaPerson: item.obaPerson,
            inOutType: item.inOutType,
            
            // Additional fields for OUT SIDE
            selectedPallateNo: item.selectedPallateNo,
            corner: item.corner,
            belt: item.belt,
            palletModel: item.palletModel,
            packing: item.packing,
            mrpSticker: item.mrpSticker,
            packType: item.packType,
            palletPicture1: item.palletPicture1,
            palletPicture2: item.palletPicture2,
            modulePicture1: item.modulePicture1,
            modulePicture2: item.modulePicture2
          };
        } else {
          // For IN SIDE data structure (original)
          return {
            fqcnewid: item.fqcnewid,
            currentuser: item.currentuser,
            pallateType: item.pallateType,
            issueStatus: item.issueStatus,
            productBarcode: item.productBarcode,
            line: item.line,
            fqcperson: item.fqcperson,
            fqcDate: item.fqcDate,
            Remark: item.Remark,
            party: item.party,
            obaCreatedOn: item.obaCreatedOn,
            obaIssueNames: item.obaIssueNames,
            obaPerson: item.obaPerson,
            inOutType: item.inOutType,
          };
        }
      });

      // Remove duplicates for IN SIDE only (based on productBarcode)
      const uniqueData = [];
      const seenBarcodes = new Set();
      
      cleaned.forEach(item => {
        if (item.inOutType === 'OUT SIDE') {
          // For OUT SIDE, don't filter by barcode as they might be empty
          uniqueData.push(item);
        } else {
          // For IN SIDE, filter by unique barcode
          if (item.productBarcode && !seenBarcodes.has(item.productBarcode)) {
            seenBarcodes.add(item.productBarcode);
            uniqueData.push(item);
          } else if (!item.productBarcode) {
            uniqueData.push(item);
          }
        }
      });

      setData(uniqueData);
      setFiltered(uniqueData);
      setActiveIssueFilter(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setData([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return new Date(dateString);
    }
    
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const [datePart, timePart] = dateString.split(', ');
      const [day, month, year] = datePart.split('/');
      const dateObj = new Date(year, month - 1, day);
      
      if (timePart) {
        const [hours, minutes, seconds] = timePart.split(':');
        dateObj.setHours(hours, minutes, seconds);
      }
      
      return dateObj;
    }
    
    return new Date(dateString);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = parseDate(dateString);
      if (!date || isNaN(date.getTime())) return dateString;
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleFilter = () => {
    let result = [...data];

    // Apply FQC Status filter
    if (fqcStatus) {
      result = result.filter(item => item.issueStatus === fqcStatus);
    }

    // Apply OBA Place filter
    if (obaPlace) {
      result = result.filter(item => item.inOutType === obaPlace);
    }

    // Apply active issue filter if set
    if (activeIssueFilter) {
    const { key, value } = activeIssueFilter;
          // result = result.filter(item => item.obaIssueNames === activeIssueFilter);
           if (isOutSideMode) {
            console.log("outside mode")
              result = result.filter(item => item?.[key] === value);
            } else {
              console.log("not outSideMode")
              // IN SIDE filters based on OBA issue name
              result = result.filter(item => item.obaIssueNames === value);
            }
    }

    // Apply client-side search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter(item => {
        const searchableFields = [
          item.productBarcode,
          item.fqcperson,
          item.line,
          item.party,
          item.obaIssueNames,
          item.obaPerson,
          item.pallateType,
          item.issueStatus,
          item.Remark,
          item.inOutType,
          item.selectedPallateNo
        ];
        
        return searchableFields.some(field => {
          if (field === null || field === undefined) return false;
          return field.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    setFiltered(result);
    setCurrentPage(1);

    // Trigger API call with date range if dates are provided
    if (fromDate || toDate) {
      fetchData(fromDate, toDate);
    }
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setFqcStatus('');
    setObaPlace('');
    setActiveIssueFilter(null);
    setCurrentPage(1);
    fetchData();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.length > 0) {
        let result = [...data];
        
        // Apply FQC Status filter
        if (fqcStatus) {
          result = result.filter(item => item.issueStatus === fqcStatus);
        }

        // Apply OBA Place filter
        if (obaPlace) {
          result = result.filter(item => item.inOutType === obaPlace);
        }
        
        // Apply active issue filter if set
        if (activeIssueFilter) {
          const { key, value } = activeIssueFilter;
          // result = result.filter(item => item.obaIssueNames === activeIssueFilter);
           if (isOutSideMode) {
            console.log("outside mode")
              result = result.filter(item => item?.[key] === value);
            } else {
              console.log("inside mode");
              // IN SIDE filters based on OBA issue name
              result = result.filter(item => item.obaIssueNames === value);
            }
        };
        
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          result = result.filter(item => {
            const searchableFields = [
              item.productBarcode,
              item.fqcperson,
              item.line,
              item.party,
              item.obaIssueNames,
              item.obaPerson,
              item.pallateType,
              item.issueStatus,
              item.Remark,
              item.inOutType,
              item.selectedPallateNo
            ];
            
            return searchableFields.some(field => {
              if (field === null || field === undefined) return false;
              return field.toString().toLowerCase().includes(searchLower);
            });
          });
        }
        
        setFiltered(result);
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, data, activeIssueFilter, fqcStatus, obaPlace]);

  const getIssueStats = () => {
    const issueStats = {};
    
    if (obaPlace === 'OUT SIDE') {
      // For OUT SIDE, count by quality parameters
      const qualityParams = ['corner', 'belt', 'palletModel', 'packing', 'mrpSticker'];
      
      qualityParams.forEach(param => {
        const okCount = filtered.filter(item => item[param] === 'OK').length;
        const notOkCount = filtered.filter(item => item[param] === 'NOT OK').length;
        
        if (okCount > 0) issueStats[`${param} - OK`] = okCount;
        if (notOkCount > 0) issueStats[`${param} - NOT OK`] = notOkCount;
      });
    } else {
      // Original logic for IN SIDE
      filtered.forEach(item => {
        const issue = item.obaIssueNames || 'No Issue';
        issueStats[issue] = (issueStats[issue] || 0) + 1;
      });
    }
    
    return issueStats;
  };

  const getUserWiseData = () => {
    const userStats = {};
    
    filtered.forEach(item => {
      const user = item.obaPerson || 'Unknown';
      if (!userStats[user]) {
        userStats[user] = {};
      }
      
      if (obaPlace === 'OUT SIDE') {
        // For OUT SIDE, group by quality parameters
        const qualityParams = ['corner', 'belt', 'palletModel', 'packing', 'mrpSticker'];
        
        qualityParams.forEach(param => {
          const status = item[param] || 'Unknown';
          const key = `${param} - ${status}`;
          userStats[user][key] = (userStats[user][key] || 0) + 1;
        });
      } else {
        // Original logic for IN SIDE
        const issue = item.obaIssueNames || 'No Issue';
        userStats[user][issue] = (userStats[user][issue] || 0) + 1;
      }
    });
    
    return userStats;
  };

 const handleExport = () => {
  if (filtered.length === 0) return;
  
  const timestamp = new Date().toISOString().slice(0, 10);
  
  if (reportMode === 'userwise') {
    const userWiseData = getUserWiseData();
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
            th { 
              background-color: #B91C1C; 
              color: white; 
              padding: 10px 6px; 
              text-align: center; 
              font-weight: bold; 
              border: 1px solid #8B0000;
            }
            td { 
              padding: 7px 5px; 
              border: 1px solid #CCCCCC; 
              text-align: center;
            }
            tr:nth-child(even) { background-color: #F9F9F9; }
            .user-section { margin-bottom: 30px; }
            .user-title { 
              background-color: #DC2626; 
              color: white; 
              padding: 12px; 
              font-weight: bold; 
              font-size: 14px;
              text-align: center;
            }
            .title-row { 
              background-color: #B91C1C; 
              color: white; 
              font-size: 16px; 
              font-weight: bold; 
              padding: 15px; 
              text-align: center; 
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th colspan="2" class="title-row">
                  User-wise OBA Report
                  ${(fromDate || toDate) ? `<br>Date Filter: ${fromDate || 'Start'} to ${toDate || 'End'}` : ''}
                </th>
              </tr>
            </thead>
          </table>
          
          ${Object.entries(userWiseData).map(([user, issues]) => `
            <div class="user-section">
              <table>
                <thead>
                  <tr>
                    <th colspan="2" class="user-title">${user}</th>
                  </tr>
                  <tr>
                    <th>${obaPlace === 'OUT SIDE' ? 'Quality Parameter' : 'Issue Type'}</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(issues).map(([issue, count]) => `
                    <tr>
                      <td>${issue}</td>
                      <td>${count}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `User_Wise_OBA_Report_${timestamp}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Summary report export
    const isOutSide = obaPlace === 'OUT SIDE';
    
    const tableHeaders = isOutSide ? [
      'SR.', 'Pallet No.', 'Pack Type', 'FQC Status', 'Party', 'FQC Person', 'FQC Date', 
      'OBA Date', 'OBA Person', 'Corner', 'Belt', 'Pallet Model', 'Packing', 'MRP Sticker', 'Remark'
    ] : [
  'SR', 'Product Barcode', 'Pallet Type', 'FQC Status', 'Line', 'FQC Person', 'FQC Date',
  'Party', 'OBA Date', 'OBA Issues', 'OBA Person', 'OBA Place', 'Remark'
];
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { 
              background-color: #B91C1C; 
              color: white; 
              padding: 10px 6px; 
              text-align: center; 
              font-weight: bold; 
              border: 1px solid #8B0000;
            }
            td { 
              padding: 7px 5px; 
              border: 1px solid #CCCCCC; 
              text-align: center;
            }
            tr:nth-child(even) { background-color: #F9F9F9; }
            .barcode { font-family: monospace; background-color: #F0F0F0; font-weight: bold; }
            .status-ok { background-color: #dcfce7; color: #166534; }
            .status-not-ok { background-color: #fee2e2; color: #dc2626; }
            .title-row { 
              background-color: #B91C1C; 
              color: white; 
              font-size: 16px; 
              font-weight: bold; 
              padding: 15px; 
              text-align: center; 
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th colspan="${tableHeaders.length}" class="title-row">
                  FQC OBA ${isOutSide ? 'OUT SIDE' : 'Summary'} Report
                  ${(fromDate || toDate) ? `<br>Date Filter: ${fromDate || 'Start'} to ${toDate || 'End'}` : ''}
                </th>
              </tr>
              <tr>
                ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filtered.map((item, index) => {
                if (isOutSide) {
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.selectedPallateNo || '-'}</td>
                      <td>${item.packType || '-'}</td>
                      <td class="${item.issueStatus === 'OK' ? 'status-ok' : 'status-not-ok'}">${item.issueStatus || 'OK'}</td>
                      <td>${item.party || '-'}</td>
                      <td>${item.fqcperson || '-'}</td>
                      <td>${item.fqcDate ? formatDate(item.fqcDate) : '-'}</td>
                      <td>${item.obaCreatedOn ? formatDate(item.obaCreatedOn) : '-'}</td>
                      <td>${item.obaPerson || '-'}</td>
                      <td class="${item.corner === 'OK' ? 'status-ok' : 'status-not-ok'}">${item.corner || '-'}</td>
                      <td class="${item.belt === 'OK' ? 'status-ok' : 'status-not-ok'}">${item.belt || '-'}</td>
                      <td class="${item.palletModel === 'OK' ? 'status-ok' : 'status-not-ok'}">${item.palletModel || '-'}</td>
                      <td class="${item.packing === 'OK' ? 'status-ok' : 'status-not-ok'}">${item.packing || '-'}</td>
                      <td class="${item.mrpSticker === 'OK' ? 'status-ok' : 'status-not-ok'}">${item.mrpSticker || '-'}</td>
                      <td>${item.Remark || '-'}</td>
                    </tr>
                  `;
                } else {
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td class="barcode">${item.productBarcode || ''}</td>
                      <td>${item.pallateType || '-'}</td>
                      <td class="${item.issueStatus === 'OK' ? 'status-ok' : 'status-not-ok'}">${item.issueStatus || 'OK'}</td>
                      <td>${item.line || '-'}</td>
                      <td>${item.fqcperson || '-'}</td>
                      <td>${item.fqcDate ? formatDate(item.fqcDate) : '-'}</td>
                      <td>${item.party || '-'}</td>
                      <td>${item.obaCreatedOn ? formatDate(item.obaCreatedOn) : '-'}</td>
                      <td>${item.obaIssueNames || '-'}</td>
                      <td>${item.obaPerson || '-'}</td>
                      <td>${item.inOutType || '-'}</td>
                      <td>${item.Remark || '-'}</td>
                    </tr>
                  `;
                }
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `FQC_OBA_${isOutSide ? 'OutSide' : 'Summary'}_Report_${timestamp}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

  const getIssueStatusColor = (issueStatus) => {
    const colors = {
      'ok': { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
      'not ok': { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
    };
    
    const statusKey = issueStatus?.toLowerCase() || 'ok';
    return colors[statusKey] || { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
  };

  // Image Modal Component
  const ImageModal = ({ src, onClose }) => {
    if (!src) return null;
    
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={onClose}
      >
        <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '-40px',
              right: '0px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
          <img 
            src={src} 
            alt="Preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);
  const issueStats = getIssueStats();
  const userWiseData = getUserWiseData();

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const isOutSideMode = obaPlace === 'OUT SIDE';

  const renderSummaryReport = () => (
    <>
      {/* Enhanced Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <h3 style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Records</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{filtered.length}</p>
        </div>
        
        {Object.entries(issueStats).map(([issue, count], index) => {
          const colors = [
            { bg: '#10b981', light: '#dcfce7' },
            { bg: '#f59e0b', light: '#fef3c7' },
            { bg: '#ef4444', light: '#fee2e2' },
            { bg: '#8b5cf6', light: '#f3e8ff' },
            { bg: '#06b6d4', light: '#cffafe' },
            { bg: '#84cc16', light: '#ecfccb' }
          ];
          const color = colors[index % colors.length];
          const isActive = activeIssueFilter?.value === issue;
          console.log("activeIssueFilter", activeIssueFilter);
          return (
            <div 
              key={issue} 
              onClick={() => {
                const [key, value] = issue.split(" - "); // e.g., "corner - NOT OK"
                const newFilter = isOutSideMode ? { key, value } : {key, value: key};

                if (activeIssueFilter?.key === key && activeIssueFilter?.value === value) {
                  setActiveIssueFilter(null); // unselect if already selected
                } else {
                  setActiveIssueFilter(newFilter); // set new filter
                }
                setCurrentPage(1);
              }}
              style={{ 
                backgroundColor: isActive ? color.light : 'white', 
                padding: '20px', 
                borderRadius: '12px',
                boxShadow: isActive ? `0 4px 6px -1px rgba(0, 0, 0, 0.1)` : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                borderLeft: `4px solid ${color.bg}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: isActive ? 'translateY(-2px)' : 'none'
              }}
            >
              <h3 style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                margin: '0 0 4px 0',
                textTransform: 'capitalize'
              }}>
                {issue}
              </h3>
              <p style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: color.bg, 
                margin: 0 
              }}>
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Data Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'hidden' 
      }}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '60px' 
          }}>
            <RefreshCw size={24} style={{ marginRight: '12px', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '18px', color: '#6b7280' }}>Loading data...</span>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    {(isOutSideMode ? [
                      'SR.',
                      'Pallet No.',
                      'Pack Type', 
                      // 'FQC Status',
                      'Party',
                      // 'FQC Person',
                      // 'FQC Date',
                      'OBA Date',
                      'OBA Person',
                      'Corner',
                      'Belt',
                      'Pallet Model',
                      'Packing',
                      'MRP Sticker',
                      'Images',
                      'Remark'
                    ] : [
                      'SR.',
                      'Product Barcode',
                      'Pallet Type',
                      'FQC Status',
                      'Line',
                      'FQC Person',
                      'FQC Date',
                      'Party',
                      'OBA Date',
                      'OBA Issues',
                      'OBA Person',
                      'OBA Place',
                      'Remark'
                    ]).map((header, index, array) => (
                      <th key={index} style={{ 
                        padding: '16px 12px', 
                        textAlign: 'left', 
                        fontSize: '12px', 
                        fontWeight: '700', 
                        color: 'white', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        borderRight: index < array.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={isOutSideMode ? "15" : "13"} style={{ 
                        padding: '60px', 
                        textAlign: 'center', 
                        color: '#6b7280' 
                      }}>
                        <Search size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
                        <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>No records found</p>
                        <p style={{ fontSize: '14px', margin: 0 }}>Try adjusting your search or filter criteria</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, index) => (
                      <tr 
                        key={item.productBarcode || index} 
                        style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        {isOutSideMode ? (
                          <>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                              {startIndex + index + 1}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                              {item.selectedPallateNo || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151' }}>
                              {item.packType || '-'}
                            </td>
                            {/* <td style={{ padding: '16px 12px' }}>
                              <span style={{
                                padding: '6px 12px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                ...getIssueStatusColor(item.issueStatus)
                              }}>
                                {item.issueStatus || 'OK'}
                              </span>
                            </td> */}
                            <td style={{ padding: '16px 12px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                              {item.party || '-'}
                            </td>
                            {/* <td style={{ padding: '16px 12px', fontSize: '14px', color: '#1e40af', fontWeight: '600' }}>
                              {item.fqcperson || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '13px', color: '#6b7280' }}>
                              {formatDate(item.fqcDate)}
                            </td> */}
                            <td style={{ padding: '16px 12px', fontSize: '13px', color: '#6b7280' }}>
                              {formatDate(item.obaCreatedOn)}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#059669', fontWeight: '600' }}>
                              {item.obaPerson || '-'}
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                ...getIssueStatusColor(item.corner)
                              }}>
                                {item.corner || '-'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                ...getIssueStatusColor(item.belt)
                              }}>
                                {item.belt || '-'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                ...getIssueStatusColor(item.palletModel)
                              }}>
                                {item.palletModel || '-'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                ...getIssueStatusColor(item.packing)
                              }}>
                                {item.packing || '-'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                ...getIssueStatusColor(item.mrpSticker)
                              }}>
                                {item.mrpSticker || '-'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {[
                                  { src: item.palletPicture1, label: 'P1' },
                                  { src: item.palletPicture2, label: 'P2' },
                                  { src: item.modulePicture1, label: 'M1' },
                                  { src: item.modulePicture2, label: 'M2' }
                                ].map((img, imgIndex) => (
                                  img.src ? (
                                    <button
                                      key={imgIndex}
                                      onClick={() => setSelectedImage(img.src)}
                                      style={{
                                        padding: '4px 6px',
                                        fontSize: '10px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px'
                                      }}
                                      title={`View ${img.label}`}
                                    >
                                      <Eye size={10} />
                                      {img.label}
                                    </button>
                                  ) : null
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151' }}>
                              {item.Remark || '-'}
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                              {startIndex + index + 1}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '13px', color: '#374151', fontFamily: 'monospace', backgroundColor: '#f8fafc' }}>
                              {item.productBarcode || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151' }}>
                              {item.pallateType || '-'}
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              <span style={{
                                padding: '6px 12px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                ...getIssueStatusColor(item.issueStatus)
                              }}>
                                {item.issueStatus || 'OK'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                              {item.line || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#1e40af', fontWeight: '600' }}>
                              {item.fqcperson || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '13px', color: '#6b7280' }}>
                              {formatDate(item.fqcDate)}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                              {item.party || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '13px', color: '#6b7280' }}>
                              {formatDate(item.obaCreatedOn)}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>
                              {item.obaIssueNames || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#059669', fontWeight: '600' }}>
                              {item.obaPerson || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#7c3aed', fontWeight: '500' }}>
                              {item.inOutType || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151' }}>
                              {item.Remark || '-'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ 
                backgroundColor: '#f8fafc', 
                padding: '20px 24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                  Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} results
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '10px 16px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          padding: '10px 16px',
                          fontSize: '14px',
                          backgroundColor: isCurrentPage ? '#3b82f6' : 'white',
                          color: isCurrentPage ? 'white' : '#374151',
                          border: `2px solid ${isCurrentPage ? '#3b82f6' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          minWidth: '44px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '10px 16px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  const renderUserWiseReport = () => (
    <div style={{ 
      display: 'grid',
      gap: '20px'
    }}>
      {Object.entries(userWiseData).length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '60px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <Users size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
          <p style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#6b7280' }}>No user data found</p>
          <p style={{ fontSize: '14px', margin: 0, color: '#9ca3af' }}>Try adjusting your filters</p>
        </div>
      ) : (
        Object.entries(userWiseData).map(([user, issues]) => (
          <div key={user} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '20px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={24} />
                <div>
                  <h3 style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '20px', 
                    fontWeight: 'bold' 
                  }}>
                    {user}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    opacity: 0.9 
                  }}>
                    Total Issues: {Object.values(issues).reduce((sum, count) => sum + count, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {Object.entries(issues).map(([issue, count], index) => {
                  const colors = [
                    { bg: '#10b981', light: '#dcfce7', text: '#065f46' },
                    { bg: '#f59e0b', light: '#fef3c7', text: '#92400e' },
                    { bg: '#ef4444', light: '#fee2e2', text: '#dc2626' },
                    { bg: '#8b5cf6', light: '#f3e8ff', text: '#7c3aed' },
                    { bg: '#06b6d4', light: '#cffafe', text: '#0891b2' },
                    { bg: '#84cc16', light: '#ecfccb', text: '#65a30d' }
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={issue} style={{
                      backgroundColor: color.light,
                      padding: '16px',
                      borderRadius: '8px',
                      border: `2px solid ${color.bg}20`,
                      transition: 'all 0.2s'
                    }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: color.text,
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {issue}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: color.bg
                      }}>
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Image Modal */}
        <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
        
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1e40af', 
            marginBottom: '8px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            FQC OBA Analytics Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Quality control and barcode analysis with comprehensive reporting modes
          </p>
        </div>

        {/* Mode Selection */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BarChart3 size={20} />
            Report Mode
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button
              onClick={() => setReportMode('summary')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                backgroundColor: reportMode === 'summary' ? '#3b82f6' : '#f3f4f6',
                color: reportMode === 'summary' ? 'white' : '#374151',
                boxShadow: reportMode === 'summary' ? '0 2px 4px rgba(59, 130, 246, 0.2)' : 'none'
              }}
            >
              <FileText size={16} />
              Summary Report
            </button>
            
            <button
              onClick={() => setReportMode('userwise')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                backgroundColor: reportMode === 'userwise' ? '#3b82f6' : '#f3f4f6',
                color: reportMode === 'userwise' ? 'white' : '#374151',
                boxShadow: reportMode === 'userwise' ? '0 2px 4px rgba(59, 130, 246, 0.2)' : 'none'
              }}
            >
              <Users size={16} />
              User-wise Report
            </button>
          </div>
        </div>

        {/* Enhanced Filter Controls */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Filter size={20} />
            Filter & Search Controls
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '16px', 
            alignItems: 'end',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '6px' 
              }}>
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '6px' 
              }}>
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '6px' 
              }}>
                FQC Status
              </label>
              <select
                value={fqcStatus}
                onChange={e => setFqcStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: 'white'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">All Status</option>
                <option value="OK">OK</option>
                <option value="Not OK">NOT OK</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '6px' 
              }}>
                OBA Place
              </label>
              <select
                value={obaPlace}
                onChange={e => setObaPlace(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: 'white'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              >
                {/* <option value="">All Places</option> */}
                <option value="IN SIDE">IN SIDE</option>
                <option value="OUT SIDE">OUT SIDE</option>
              </select>
            </div>

            <button
              onClick={handleFilter}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
              }}
              onMouseOver={e => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Filter size={16} />
              Apply Filter
            </button>

            <button
              onClick={handleReset}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.target.style.backgroundColor = '#4b5563';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = '#6b7280';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              style={{
                backgroundColor: filtered.length === 0 ? '#9ca3af' : '#10b981',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: filtered.length === 0 ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)'
              }}
              onMouseOver={e => {
                if (filtered.length > 0) {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={e => {
                if (filtered.length > 0) {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <Download size={16} />
              Export Excel
            </button>
          </div>

          {/* Enhanced Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af' 
              }} 
            />
            <input
              type="text"
              placeholder={isOutSideMode ? "Search by pallet no, person, party, remark..." : "Search by barcode, person, line, party, OBA issue names..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '48px',
                paddingRight: '16px',
                paddingTop: '14px',
                paddingBottom: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(activeIssueFilter || fqcStatus || obaPlace) && (
          <div style={{ 
            backgroundColor: '#e0f2fe',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Info size={18} color="#0369a1" />
              <span style={{ color: '#0369a1', fontWeight: '500' }}>
                Active filters: 
              </span>
              {activeIssueFilter && (
                <span style={{ 
                  backgroundColor: '#0369a1', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Issue: {isOutSideMode ? `${activeIssueFilter.key} - ${activeIssueFilter.value}` : activeIssueFilter.value}
                </span>
              )}
              {fqcStatus && (
                <span style={{ 
                  backgroundColor: '#0369a1', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  FQC: {fqcStatus}
                </span>
              )}
              {obaPlace && (
                <span style={{ 
                  backgroundColor: '#0369a1', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Place: {obaPlace}
                </span>
              )}
            </div>
            <button 
              onClick={() => {
                setActiveIssueFilter(null);
                setFqcStatus('');
                setObaPlace('');
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#0369a1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '600'
              }}
            >
              <X size={16} />
              Clear all filters
            </button>
          </div>
        )}

        {/* Special Notice for OUT SIDE Mode */}
        {isOutSideMode && (
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ImageIcon size={20} color="#0ea5e9" />
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#0c4a6e', fontSize: '14px', fontWeight: '600' }}>
                OUT SIDE Mode Active
              </h4>
              <p style={{ margin: 0, color: '#075985', fontSize: '13px' }}>
                Showing quality parameters (Corner, Belt, Pallet Model, Packing, MRP Sticker) with image gallery. Click image buttons to view pictures.
              </p>
            </div>
          </div>
        )}

        {/* Report Content Based on Mode */}
        {reportMode === 'summary' ? renderSummaryReport() : renderUserWiseReport()}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FQC_OBA_Combine_Report;