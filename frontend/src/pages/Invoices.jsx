import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);

  const [customerId, setCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState([{ productId: '', quantity: 1, unitPrice: 0, selectedSizes: [], bundleComponentSizes: {} }]);
  const [deliveryCharges, setDeliveryCharges] = useState(300);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const delayDebounce = setTimeout(() => { fetchInvoices(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => { if (showForm) loadData(); }, [showForm]);

  const fetchInvoices = async () => {
    try {
      const data = await api.invoices.getAll(search);
      setInvoices(data);
    } catch (err) { setError('Failed to load invoices'); } finally { setLoading(false); }
  };

  const loadData = async () => {
    try {
      const [cData, pData] = await Promise.all([api.customers.getAll(), api.products.getAll()]);
      setCustomers(cData);
      setProducts(pData);
    } catch (err) { setError('Failed to load customers/products'); }
  };

  const handleAddItemRow = () => setSelectedItems([...selectedItems, { productId: '', quantity: 1, unitPrice: 0, selectedSizes: [], bundleComponentSizes: {} }]);
  
  const handleItemFieldChange = (idx, field, value) => {
    const list = [...selectedItems];
    if (field === 'productId') {
      const p = products.find(item => item.id === parseInt(value));
      list[idx].productId = value;
      list[idx].unitPrice = p ? p.sellingPrice : 0;
      list[idx].selectedSizes = Array(list[idx].quantity || 1).fill(''); 
      list[idx].bundleComponentSizes = {}; 
    } else if (field === 'quantity') {
      const qty = parseInt(value) || 1;
      list[idx].quantity = qty;
      const newSizes = [...(list[idx].selectedSizes || [])];
      if (newSizes.length < qty) { while (newSizes.length < qty) newSizes.push(''); }
      else { newSizes.length = qty; }
      list[idx].selectedSizes = newSizes;
    }
    setSelectedItems(list);
  };

  const handleBundleSizeChange = (itemIdx, componentId, sizeIdx, val) => {
      const list = [...selectedItems];
      if (!list[itemIdx].bundleComponentSizes[componentId]) {
          list[itemIdx].bundleComponentSizes[componentId] = [];
      }
      list[itemIdx].bundleComponentSizes[componentId][sizeIdx] = val;
      setSelectedItems(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!customerId) return setError('Please select a customer');

    const payload = {
      customerId: parseInt(customerId),
      items: selectedItems.map(i => ({ 
        productId: parseInt(i.productId), 
        quantity: i.quantity, 
        unitPrice: parseFloat(i.unitPrice),
        selectedSizes: i.selectedSizes,
        bundleComponentSizes: i.bundleComponentSizes
      })),
      deliveryCharges: parseFloat(deliveryCharges),
      discount: parseFloat(discount)
    };

    try {
      if (isEditing) await api.invoices.update(currentInvoiceId, payload);
      else await api.invoices.create(payload);
      resetForm(); fetchInvoices();
    } catch (err) { setError(err.message); }
  };

  const handleEdit = (inv) => {
    setCustomerId(inv.customerId.toString());
    setDeliveryCharges(inv.deliveryCharges);
    setDiscount(inv.discount);
    setSelectedItems(inv.items.map(i => ({
      productId: i.productId.toString(),
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      selectedSizes: i.selectedSize ? i.selectedSize.split(', ') : [],
      bundleComponentSizes: {}
    })));
    setCurrentInvoiceId(inv.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setCustomerId(''); setSelectedItems([{ productId: '', quantity: 1, unitPrice: 0, selectedSizes: [], bundleComponentSizes: {} }]);
    setDeliveryCharges(300); setDiscount(0); setShowForm(false); setIsEditing(false); setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try { await api.invoices.delete(id); fetchInvoices(); } catch (err) { setError('Delete failed'); }
  };

  return (
    <Layout title="Invoices">
      {error && <div className="auth-error">{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <input type="text" className="search-input" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} style={{maxWidth:'400px'}} />
        {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Invoice</button>}
      </div>

      {showForm && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">{isEditing ? 'Edit Invoice' : 'New Invoice'}</h2>
            <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="invoice-creator">
            <div className="form-group" style={{maxWidth:'300px'}}>
              <label className="form-label">Customer *</label>
              <select className="form-input" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                <option value="">-- Choose Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
              </select>
            </div>

            <div style={{marginTop:'16px'}}>
              <h3 style={{fontSize:'15px', fontWeight:600, marginBottom:'12px'}}>Items Configuration</h3>
              {selectedItems.map((item, idx) => {
                const selectedProd = products.find(p => p.id === parseInt(item.productId));
                return (
                  <div key={idx} style={{background:'#f8fafc', padding:'15px', borderRadius:'12px', marginBottom:'15px', border:'1px solid #e2e8f0'}}>
                    <div className="invoice-item-row" style={{gridTemplateColumns: '2fr 1fr 1fr 1.2fr 0.5fr', marginBottom: '10px'}}>
                        <div className="form-group" style={{margin:0}}>
                        <label className="form-label">Product</label>
                        <select className="form-input" value={item.productId} onChange={e => handleItemFieldChange(idx, 'productId', e.target.value)} required>
                            <option value="">-- Select --</option>
                            {products.map(p => (
                            <option key={p.id} value={p.id} disabled={!p.isBundle && !p.hasVariants && p.stock <= 0}>
                                {p.name} {p.isBundle ? '(Pkg)' : p.hasVariants ? '(Sizes)' : `(${p.stock} left)`}
                            </option>
                            ))}
                        </select>
                        </div>
                        <div className="form-group" style={{margin:0}}>
                        <label className="form-label">Qty</label>
                        <input type="number" className="form-input" min="1" value={item.quantity} onChange={e => handleItemFieldChange(idx, 'quantity', e.target.value)} required />
                        </div>
                        <div className="form-group" style={{margin:0}}>
                        <label className="form-label">Price</label>
                        <input type="number" className="form-input" value={item.unitPrice} disabled />
                        </div>
                        <div className="form-group" style={{margin:0}}>
                        <label className="form-label">Total</label>
                        <input type="number" className="form-input" value={(item.quantity * item.unitPrice).toFixed(2)} disabled />
                        </div>
                        {selectedItems.length > 1 && (
                        <button type="button" className="btn btn-danger" style={{height:'40px'}} onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== idx))}>✕</button>
                        )}
                    </div>

                    {/* Standard Size-wise Product */}
                    {selectedProd?.hasVariants && !selectedProd.isBundle && (
                        <div style={{display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'10px', padding:'10px', background:'#fff', borderRadius:'8px', border:'1px dashed #cbd5e1'}}>
                            {Array.from({ length: item.quantity }).map((_, sIdx) => (
                                <div key={sIdx} style={{flex:'1', minWidth:'150px'}}>
                                    <label style={{fontSize:'11px', fontWeight:'700', color:'#64748b'}}>Size for Item {sIdx + 1}</label>
                                    <select className="form-input" value={item.selectedSizes[sIdx] || ''} onChange={e => {
                                        const newList = [...selectedItems];
                                        newList[idx].selectedSizes[sIdx] = e.target.value;
                                        setSelectedItems(newList);
                                    }} required >
                                        <option value="">-- Size --</option>
                                        {selectedProd.variants?.map(v => (
                                            <option key={v.id} value={v.size} disabled={v.stock <= 0}>{v.size} ({v.stock} left)</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Package with Size-wise Components */}
                    {selectedProd?.isBundle && (
                        <div style={{marginTop:'10px', padding:'10px', background:'#f1f5f9', borderRadius:'8px', border:'1px solid #cbd5e1'}}>
                            <p style={{fontSize:'12px', fontWeight:'800', color:'#1e293b', marginBottom:'8px'}}>Package Components Configuration:</p>
                            {selectedProd.bundleItems?.map(bi => {
                                const comp = bi.product; // bi.product nested data
                                if (!comp?.hasVariants) return null;
                                const totalExpected = item.quantity * bi.quantity;
                                return (
                                    <div key={comp.id} style={{marginBottom:'10px', padding:'8px', background:'#fff', borderRadius:'6px'}}>
                                        <label style={{fontSize:'12px', fontWeight:'600'}}>{comp.name} Sizes ({totalExpected} total):</label>
                                        <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'5px'}}>
                                            {Array.from({ length: totalExpected }).map((_, sIdx) => (
                                                <select key={sIdx} className="form-input" style={{width:'120px', fontSize:'12px'}} 
                                                    value={item.bundleComponentSizes?.[comp.id]?.[sIdx] || ''}
                                                    onChange={(e) => handleBundleSizeChange(idx, comp.id, sIdx, e.target.value)}
                                                    required
                                                >
                                                    <option value="">-- Size --</option>
                                                    {comp.variants?.map(v => <option key={v.id} value={v.size}>{v.size} ({v.stock})</option>)}
                                                </select>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                  </div>
                );
              })}
              <button type="button" className="btn btn-secondary" onClick={handleAddItemRow}>+ Add Item</button>
            </div>

            <div className="invoice-totals">
                <div className="total-row"><span>Delivery:</span><input type="number" className="form-input" value={deliveryCharges} onChange={e => setDeliveryCharges(e.target.value)} /></div>
                <div className="total-row"><span>Discount:</span><input type="number" className="form-input" value={discount} onChange={e => setDiscount(e.target.value)} /></div>
                <div className="total-row total-row-grand"><span>Grand Total:</span><span>Rs. {(selectedItems.reduce((s, i) => s + (i.quantity*i.unitPrice), 0) + parseFloat(deliveryCharges) - parseFloat(discount)).toFixed(2)}</span></div>
            </div>
            
            <div style={{marginTop:'20px', display:'flex', gap:'12px'}}>
              <button type="submit" className="btn btn-primary">{isEditing ? 'Update Invoice' : 'Save Invoice'}</button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="section-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Invoice No</th><th>Date</th><th>Customer</th><th>Amount</th><th className="no-print">Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="5" style={{textAlign:'center'}}>Loading...</td></tr> : 
               invoices.map((inv) => (
                <tr key={inv.id}>
                  <td><Link to={`/invoices/${inv.id}`} style={{fontWeight:600, color:'var(--primary-color)'}}>{inv.invoiceNumber}</Link></td>
                  <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td>{inv.customer?.name}</td>
                  <td>Rs. {inv.totalAmount.toFixed(2)}</td>
                  <td className="no-print">
                    <div className="action-buttons">
                        <button className="btn btn-secondary btn-icon" onClick={() => handleEdit(inv)}>✏️</button>
                        <Link to={`/invoices/${inv.id}/print`} className="btn btn-secondary btn-icon">🖨️</Link>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(inv.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Invoices;