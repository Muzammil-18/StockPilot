import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function InventoryPrint() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.products.getAll();
        // Filter out bundles and sort alphabetically
        const filtered = data
          .filter(p => !p.isBundle)
          .sort((a, b) => a.name.localeCompare(b.name));
        setProducts(filtered);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handlePrint = () => window.print();

  if (loading) return <div style={{padding:'50px', textAlign:'center', fontFamily: "'Inter', sans-serif"}}>Loading Inventory Data...</div>;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }} className="print-wrapper">
      <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 20px', display: 'flex', justifyContent:'space-between' }}>
        <button onClick={() => navigate('/products')} className="btn btn-secondary">← Back to Products</button>
        <button onClick={handlePrint} className="btn btn-primary" style={{ fontWeight: '700' }}>🖨️ Print Inventory Report</button>
      </div>

      <div style={{ 
          backgroundColor: '#fff', maxWidth: '800px', margin: '0 auto', padding: '60px', 
          borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontFamily: "'Inter', sans-serif",
          textAlign: 'center'
      }} id="printable-inventory">
        
        {/* Logo Centered */}
        <div style={{ marginBottom: '20px' }}>
            <img src="/stockpilotlogologin.png" alt="Logo" style={{ height: '80px', objectFit:'contain' }} />
        </div>

        {/* Heading Centered */}
        <div style={{ borderBottom: '3px solid #1e1b4b', paddingBottom: '15px', marginBottom: '40px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#1e1b4b', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Inventory Report
            </h1>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '14px' }}>Generated on: {new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</p>
        </div>

        {/* 2-Column Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#1e1b4b' }}>
              <th style={{ padding: '15px 25px', fontSize: '14px', color: '#fff', textTransform:'uppercase', fontWeight: '800', borderRadius: '8px 0 0 0' }}>Product Name</th>
              <th style={{ padding: '15px 25px', fontSize: '14px', color: '#fff', textTransform:'uppercase', fontWeight: '800', textAlign: 'right', borderRadius: '0 8px 0 0' }}>Stock Left</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <React.Fragment key={p.id}>
                {/* Case 1: Product with Variants (Sizes) */}
                {p.hasVariants ? (
                  p.variants.map((v, idx) => (
                    <tr key={`${p.id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 25px', fontSize: '15px', color: '#1e1b4b', fontWeight: '500' }}>
                        {p.name} <span style={{ color: '#6366f1', fontWeight: '700' }}>(Size: {v.size})</span>
                      </td>
                      <td style={{ padding: '12px 25px', fontSize: '16px', textAlign: 'right', fontWeight: '800', color: v.stock <= 5 ? '#ef4444' : '#1e1b4b' }}>
                        {v.stock}
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Case 2: Simple Product */
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 25px', fontSize: '15px', color: '#1e1b4b', fontWeight: '500' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '15px 25px', fontSize: '16px', textAlign: 'right', fontWeight: '800', color: p.stock <= 5 ? '#ef4444' : '#1e1b4b' }}>
                      {p.stock}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: '60px', borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
           <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
             Inventory Managed by <strong>StockPilot Elite System v2.0</strong>
           </p>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 10mm; }
          body { background-color: #fff !important; }
          .no-print { display: none !important; }
          .print-wrapper { background-color: #fff !important; padding: 0 !important; }
          #printable-inventory { box-shadow: none !important; border: none !important; max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

export default InventoryPrint;