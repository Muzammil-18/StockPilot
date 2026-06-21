import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function ReportPrint() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const from = query.get('from');
  const to = query.get('to');

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.invoices.getAll();
        const filtered = data.filter((inv) => {
          const invDate = new Date(inv.invoiceDate).setHours(0,0,0,0);
          const start = from ? new Date(from).setHours(0,0,0,0) : -Infinity;
          const end = to ? new Date(to).setHours(0,0,0,0) : Infinity;
          return invDate >= start && invDate <= end;
        });
        
        // Sorting: Ascending (Oldest to Newest)
        const sorted = filtered.sort((a, b) => new Date(a.invoiceDate) - new Date(b.invoiceDate));
        setInvoices(sorted);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [from, to]);

  const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  if (loading) return <div style={{padding:'50px', textAlign:'center', fontFamily: "'Inter', sans-serif"}}>Generating Report...</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }} className="print-wrapper">
      <div className="no-print" style={{ maxWidth: '1000px', margin: '0 auto 20px', display: 'flex', justifyContent:'space-between' }}>
        <button onClick={() => navigate('/reports')} className="btn btn-secondary">← Back to Reports</button>
        <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: '700' }}>🖨️ Print Final Report</button>
      </div>

      <div style={{ 
          backgroundColor: '#fff', maxWidth: '1000px', margin: '0 auto', padding: '50px', 
          borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: "'Inter', sans-serif" 
      }} id="printable-report">
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #1e1b4b', paddingBottom: '20px', marginBottom: '30px' }}>
           <div>
             <img src="/stockpilotlogologin.png" alt="Logo" style={{ height: '70px' }} />
             <h1 style={{ margin: '15px 0 0', fontSize: '28px', fontWeight: '900', color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '1px' }}>Sales Summary Report</h1>
           </div>
           <div style={{ textAlign: 'right' }}>
             <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '600' }}>REPORT PERIOD</p>
             <p style={{ margin: '5px 0 0', fontSize: '16px', fontWeight: '800', color: '#4f46e5' }}>
                {from ? new Date(from).toLocaleDateString('en-GB') : 'Start'} — {to ? new Date(to).toLocaleDateString('en-GB') : 'Present'}
             </p>
           </div>
        </div>

        {/* Highlight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px', marginBottom: '40px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)', padding: '25px', borderRadius: '12px', border: '1px solid #e0e7ff' }}>
                <span style={{ fontSize: '12px', color: '#6366f1', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Total Revenue Generated</span>
                <h2 style={{ margin: '8px 0 0', color: '#1e1b4b', fontSize: '32px', fontWeight: '900' }}>Rs. {totalSales.toLocaleString('en-PK', {minimumFractionDigits: 2})}</h2>
            </div>
            <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border:'1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>Invoices Count</span>
                <h2 style={{ margin: '8px 0 0', color: '#1e1b4b', fontSize: '32px', fontWeight: '900' }}>{invoices.length}</h2>
            </div>
        </div>

        {/* Detailed Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1e1b4b' }}>
              <th style={{ textAlign: 'left', padding: '14px 15px', fontSize: '12px', color: '#fff', textTransform:'uppercase', fontWeight: '800', borderRadius: '8px 0 0 0' }}>S.No</th>
              <th style={{ textAlign: 'left', padding: '14px 15px', fontSize: '12px', color: '#fff', textTransform:'uppercase', fontWeight: '800' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '14px 15px', fontSize: '12px', color: '#fff', textTransform:'uppercase', fontWeight: '800' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '14px 15px', fontSize: '12px', color: '#fff', textTransform:'uppercase', fontWeight: '800', width: '35%' }}>Items (Sizes)</th>
              <th style={{ textAlign: 'right', padding: '14px 15px', fontSize: '12px', color: '#fff', textTransform:'uppercase', fontWeight: '800', borderRadius: '0 8px 0 0' }}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>{idx + 1}</td>
                <td style={{ padding: '15px', fontSize: '15px', fontWeight: '700', color: '#1e1b4b' }}>{inv.customer?.name}</td>
                <td style={{ padding: '15px', fontSize: '14px', color: '#4b5563' }}>{new Date(inv.invoiceDate).toLocaleDateString('en-GB')}</td>
                <td style={{ padding: '15px', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                    {inv.items?.map((item, i) => (
                        <div key={i} style={{ marginBottom: '2px' }}>
                            • {item.product?.name}
                            {item.selectedSize && (
                                <span style={{ color: '#4f46e5', fontWeight: '700' }}> ({item.selectedSize})</span>
                            )}
                        </div>
                    ))}
                </td>
                <td style={{ padding: '15px', fontSize: '15px', textAlign: 'right', fontWeight: '800', color: '#111827' }}>
                    Rs. {inv.totalAmount.toLocaleString('en-PK', {minimumFractionDigits: 2})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Report Footer */}
        <div style={{ marginTop: '60px', borderTop: '2px solid #f1f5f9', paddingTop: '30px', textAlign: 'center' }}>
           <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
             This summary report is generated by <strong>StockPilot Elite System</strong>
           </p>
           <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#cbd5e1' }}>Generated On: {new Date().toLocaleString()}</p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 10mm; size: auto; }
          body { background-color: #fff !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-wrapper { background-color: #fff !important; padding: 0 !important; }
          #printable-report { box-shadow: none !important; border: none !important; max-width: 100% !important; padding: 20px !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
        }
      `}</style>
    </div>
  );
}

export default ReportPrint;