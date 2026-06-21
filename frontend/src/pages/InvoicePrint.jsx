import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function InvoicePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await api.invoices.getById(id);
        setInvoice(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading || !invoice) return <div style={{padding:'50px', textAlign:'center', fontFamily: "'Inter', sans-serif"}}>Loading Invoice...</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }} className="print-wrapper">
      <div className="no-print" style={{ maxWidth: '850px', margin: '0 auto 20px', display: 'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={() => navigate(`/invoices/${id}`)} className="btn btn-secondary">← Back to Details</button>
        <button onClick={handlePrint} className="btn btn-primary" style={{padding:'12px 25px', fontSize:'15px', fontWeight:'700'}}>🖨️ Print Invoice</button>
      </div>

      <div style={{ 
          backgroundColor: '#fff', 
          maxWidth: '850px', 
          margin: '0 auto', 
          padding: '40px 60px', // Slightly reduced top/bottom padding
          borderRadius: '16px', 
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          fontFamily: "'Inter', sans-serif",
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          pageBreakInside: 'avoid', // Prevents splitting the invoice
          breakInside: 'avoid'
      }} id="printable-invoice">
        
        {/* Accent Bar */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'8px', background:'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)' }}></div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src="/stockpilotlogologin.png" alt="Logo" style={{ height: '70px', objectFit:'contain' }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background:'#eef2ff', color:'#4f46e5', padding:'8px 15px', borderRadius:'8px', display:'inline-block', fontWeight:'800', fontSize:'14px', marginBottom:'10px' }}>INVOICE</div>
            <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#111827' }}>#{invoice.invoiceNumber}</p>
            <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#6b7280', fontWeight:'500' }}>Issued: {new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric'})}</p>
          </div>
        </div>

        {/* Client & Info Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'40px', marginBottom: '30px', borderBottom:'1px solid #f1f5f9', paddingBottom:'20px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', marginBottom: '10px', letterSpacing:'1px' }}>Billed To:</p>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#1e1b4b' }}>{invoice.customer?.name}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>📞 {invoice.customer?.phone}</p>
                {invoice.customer?.address && <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>📍 {invoice.customer?.address}</p>}
            </div>
          </div>
        </div>

        {/* Professional Table */}
        <div style={{ flex: '1 0 auto' }}> {/* Allows table to grow but keep footer at bottom if possible */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
                <tr style={{ background: '#f8fafc' }}>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', borderRadius:'8px 0 0 8px' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Unit Price</th>
                <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', borderRadius:'0 8px 8px 0' }}>Total</th>
                </tr>
            </thead>
            <tbody>
                {invoice.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: '#1e1b4b', fontWeight: 600 }}>
                        {item.product?.name}
                        {item.selectedSize && (
                            <span style={{ display:'block', fontSize:'11px', color:'#6366f1', marginTop:'3px', fontWeight:'500' }}>
                                Sizes: ({item.selectedSize})
                            </span>
                        )}
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#4b5563', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '15px', fontSize: '14px', color: '#4b5563', textAlign: 'right' }}>Rs. {item.unitPrice.toLocaleString('en-PK', {minimumFractionDigits: 2})}</td>
                    <td style={{ padding: '15px 20px', fontSize: '14px', color: '#111827', textAlign: 'right', fontWeight: 700 }}>Rs. {item.totalPrice.toLocaleString('en-PK', {minimumFractionDigits: 2})}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* Totals Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', pageBreakInside: 'avoid' }}>
          <div style={{ width: '280px', background:'#f8fafc', padding:'20px', borderRadius:'12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Subtotal</span>
              <span style={{ fontSize: '13px', color: '#1e1b4b', fontWeight: '700' }}>Rs. {(invoice.totalAmount - (invoice.deliveryCharges || 0) + (invoice.discount || 0)).toLocaleString('en-PK', {minimumFractionDigits: 2})}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Shipping Fee</span>
              <span style={{ fontSize: '13px', color: '#1e1b4b', fontWeight: '700' }}>+ Rs. {(invoice.deliveryCharges || 0).toLocaleString('en-PK', {minimumFractionDigits: 2})}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom:'10px', borderBottom:'1px dashed #cbd5e1' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Promo Discount</span>
              <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700' }}>- Rs. {(invoice.discount || 0).toLocaleString('en-PK', {minimumFractionDigits: 2})}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b4b' }}>Grand Total</span>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#4f46e5' }}>Rs. {invoice.totalAmount.toLocaleString('en-PK', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div style={{ marginTop: '40px', textAlign: 'center', pageBreakInside: 'avoid' }}>
          <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
              <p style={{ margin: 0, fontSize: '15px', color: '#1e1b4b', fontWeight: 800, marginBottom:'5px' }}>Thank you for your Shopping with us!</p>
          </div>
          <div style={{ marginTop:'20px' }}>
             <span style={{ fontSize:'10px', color:'#cbd5e1', textTransform:'uppercase', letterSpacing:'1px' }}>Inventory Managed by StockPilot Elite v2.0</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          @page { size: portrait; margin: 10mm; }
          body { background-color: #fff !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-wrapper { background-color: #fff !important; padding: 0 !important; }
          #printable-invoice { 
            box-shadow: none !important; 
            border: none !important; 
            max-width: 100% !important; 
            padding: 20px 0 !important; 
            border-radius: 0 !important;
            height: auto !important;
          }
          /* This forces the content to stay together on one page if possible */
          #printable-invoice {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
export default InvoicePrint;