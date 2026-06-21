import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('');
  
  const [isBundle, setIsBundle] = useState(false);
  const [selectedBundleItems, setSelectedBundleItems] = useState([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([{ size: '', stock: 0 }]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => { fetchProducts(); }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchProducts = async () => {
    try {
      const data = await api.products.getAll(search);
      setProducts(data);
      const allData = await api.products.getAll('');
      setAllProducts(allData.filter(p => !p.isBundle));
    } catch (err) { setError('Failed to load products'); } finally { setLoading(false); }
  };

  const handleAddVariant = () => setVariants([...variants, { size: '', stock: 0 }]);
  const handleRemoveVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, val) => {
    const newV = [...variants];
    newV[i][field] = val;
    setVariants(newV);
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    const isPkg = val.toLowerCase() === 'package' || val.toLowerCase() === 'pkg';
    setIsBundle(isPkg);
    if (isPkg) setHasVariants(false);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      name, category, sku, 
      sellingPrice: parseFloat(sellingPrice),
      costPrice: parseFloat(costPrice) || 0,
      stock: hasVariants ? 0 : parseInt(stock) || 0,
      isBundle, 
      bundleProductIds: isBundle ? selectedBundleItems : [],
      hasVariants, 
      variants: hasVariants ? variants : []
    };
    try {
      if (isEditing) await api.products.update(currentProductId, payload);
      else await api.products.create(payload);
      resetForm(); fetchProducts();
    } catch (err) { setError(err.message); }
  };

  const handleEdit = (p) => {
    setName(p.name); setCategory(p.category); setSku(p.sku); 
    setSellingPrice(p.sellingPrice); setCostPrice(p.costPrice);
    setStock(p.stock); setHasVariants(p.hasVariants); setIsBundle(p.isBundle);
    setVariants(p.variants?.length > 0 ? p.variants : [{ size: '', stock: 0 }]);
    setSelectedBundleItems(p.bundleItems?.map(bi => bi.productId) || []);
    setCurrentProductId(p.id); setIsEditing(true); setShowForm(true);
  };

  const resetForm = () => {
    setName(''); setCategory(''); setSku(''); setCostPrice(''); setSellingPrice(''); setStock('');
    setHasVariants(false); setVariants([{ size: '', stock: 0 }]); setIsBundle(false);
    setSelectedBundleItems([]); setIsEditing(false); setShowForm(false); setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try { await api.products.delete(id); fetchProducts(); } catch (err) { setError(err.message); }
  };

  return (
    <Layout title="Products Inventory">
      {error && <div className="auth-error">{error}</div>}
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'24px', alignItems:'center'}}>
        <input type="text" className="search-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{maxWidth:'350px'}} />
        <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/inventory/print')}>
               📦 Inventory Report
            </button>
            {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Product</button>}
        </div>
      </div>

      {showForm && (
        <div className="section-card">
          <div className="section-header">
             <h2 className="section-title">{isEditing ? 'Edit' : 'Add New'} Product</h2>
             <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
          </div>
          <form onSubmit={handleCreateOrUpdate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input type="text" className="form-input" value={sku} onChange={e => setSku(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input type="text" className="form-input" placeholder="Type 'package' for bundles" value={category} onChange={e => handleCategoryChange(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price *</label>
                <input type="number" step="0.01" className="form-input" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} required />
              </div>
              {!hasVariants && !isBundle && (
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-input" value={stock} onChange={e => setStock(e.target.value)} />
                </div>
              )}
            </div>

            {!isBundle && (
              <div style={{marginTop:'20px'}}>
                 <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontWeight:'600'}}>
                   <input type="checkbox" checked={hasVariants} onChange={e => setHasVariants(e.target.checked)} /> 
                   This product has different sizes?
                 </label>
              </div>
            )}

            {hasVariants && (
              <div style={{marginTop:'15px', padding:'20px', background:'#f8fafc', borderRadius:'12px', border:'1px solid var(--border-color)'}}>
                <h4 style={{marginBottom:'15px', fontSize:'14px'}}>Add Sizes & Their Stock</h4>
                {variants.map((v, i) => (
                  <div key={i} style={{display:'flex', gap:'12px', marginBottom:'10px', alignItems:'center'}}>
                    <input type="text" className="form-input" placeholder="Size (e.g. 8)" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} required />
                    <input type="number" className="form-input" placeholder="Stock" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} required />
                    {variants.length > 1 && <button type="button" className="btn btn-danger btn-icon" onClick={() => handleRemoveVariant(i)}>✕</button>}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" style={{marginTop:'5px'}} onClick={handleAddVariant}>+ Add Another Size</button>
              </div>
            )}

            {isBundle && (
               <div style={{marginTop:'15px', padding:'20px', background:'#f9fafb', borderRadius:'12px', border:'1px solid #ddd'}}>
                  <h4 style={{marginBottom:'10px', fontSize:'14px'}}>Select Products for this Package:</h4>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxHeight:'200px', overflowY:'auto'}}>
                    {allProducts.map(p => (
                      <label key={p.id} style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer'}}>
                        <input type="checkbox" checked={selectedBundleItems.includes(p.id)} onChange={() => setSelectedBundleItems(prev => prev.includes(p.id) ? prev.filter(x => x!==p.id) : [...prev, p.id])} /> 
                        {p.name} (SKU: {p.sku})
                      </label>
                    ))}
                  </div>
               </div>
            )}

            <div style={{marginTop:'25px', display:'flex', gap:'12px'}}>
              <button type="submit" className="btn btn-primary">{isEditing ? 'Update Product' : 'Save Product'}</button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="section-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock / Info</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{textAlign:'center'}}>Loading...</td></tr> : 
               products.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center'}}>No products found</td></tr> :
               products.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/products/${p.id}`} style={{fontWeight:600, color:'var(--primary-color)'}}>{p.name}</Link></td>
                  <td>{p.sku}</td>
                  <td>{p.category || 'N/A'}</td>
                  <td>Rs. {p.sellingPrice.toFixed(2)}</td>
                  <td>
                    {p.isBundle ? <span className="badge badge-info">Package</span> : 
                     p.hasVariants ? p.variants.map(v => <span key={v.id} className="badge badge-warning" style={{marginRight:'4px', marginBottom:'4px'}}>{v.size}: {v.stock}</span>) : 
                     <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>{p.stock}</span>}
                  </td>
                  <td className="no-print">
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-icon" onClick={() => handleEdit(p)}>✏️</button>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDelete(p.id)}>🗑️</button>
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

export default Products;