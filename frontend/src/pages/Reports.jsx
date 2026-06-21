import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';

function Reports() {
  const navigate = useNavigate();
  const [allInvoices, setAllInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const data = await api.invoices.getAll();
      // Sorting: Oldest to Newest (Ascending) takay order sahi ho
      const sortedData = data.sort((a, b) => new Date(a.invoiceDate) - new Date(b.invoiceDate));
      setAllInvoices(sortedData);
      setFilteredInvoices(sortedData);
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...allInvoices];
    if (fromDate || toDate) {
      filtered = allInvoices.filter((inv) => {
        const invDate = new Date(inv.invoiceDate).setHours(0,0,0,0);
        const start = fromDate ? new Date(fromDate).setHours(0,0,0,0) : -Infinity;
        const end = toDate ? new Date(toDate).setHours(0,0,0,0) : Infinity;
        return invDate >= start && invDate <= end;
      });
    }
    setFilteredInvoices(filtered);
  }, [fromDate, toDate, allInvoices]);

  const totalSalesAmount = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const handlePrintReport = () => {
    navigate(`/reports/print?from=${fromDate}&to=${toDate}`);
  };

  if (loading) return <Layout title="Reports"><div>Loading...</div></Layout>;

  return (
    <Layout title="Sales Reports">
      {/* Filters Section */}
      <div className="section-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">From Date</label>
              <input type="date" className="form-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">To Date</label>
              <input type="date" className="form-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handlePrintReport} disabled={filteredInvoices.length === 0}>
            📊 Generate & Print Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', gridColumn: 'span 2' }}>
           <div className="card-info">
              <span className="card-title" style={{ color: '#e0e7ff' }}>Total Sale Summary</span>
              <span className="card-value" style={{ fontSize: '32px' }}>Rs. {totalSalesAmount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
           </div>
        </div>
        <div className="card">
           <div className="card-info">
              <span className="card-title">Invoices Found</span>
              <span className="card-value">{filteredInvoices.length}</span>
           </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="section-card">
        <h2 className="section-title" style={{ marginBottom: '15px' }}>Detailed Sales Table</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>S.No</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th style={{ width: '40%' }}>Items (Sizes)</th>
                <th>Total</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No records found</td></tr>
              ) : (
                filteredInvoices.map((inv, index) => (
                  <tr key={inv.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: '600' }}>{inv.customer?.name}</td>
                    <td>{new Date(inv.invoiceDate).toLocaleDateString('en-GB')}</td>
                    <td style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>
                        {inv.items?.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '2px' }}>
                                • {item.product?.name} 
                                {item.selectedSize && (
                                    <span style={{ fontWeight: '700', color: '#6366f1' }}> ({item.selectedSize})</span>
                                )}
                            </div>
                        ))}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--text-dark)' }}>
                        Rs. {inv.totalAmount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="no-print">
                      <button 
                        className="btn btn-secondary btn-icon" 
                        title="Print Invoice"
                        onClick={() => navigate(`/invoices/${inv.id}/print`)}
                        style={{ fontSize: '16px' }}
                      >
                        🖨️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Reports;