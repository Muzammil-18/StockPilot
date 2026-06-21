import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.products.getById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  return (
    <Layout title="Product Details">
      <div style={{ marginBottom: '16px' }}>
        <Link to="/products" className="btn btn-secondary">← Back to Products</Link>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <div>Loading product details...</div>
      ) : product ? (
        <div className="section-card">
          <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h2 className="section-title">{product.name}</h2>
            <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
              {product.stock} Units In Stock
            </span>
          </div>

          <div className="details-grid">
            <div className="details-group">
              <span className="details-label">Product Name</span>
              <span className="details-value">{product.name}</span>
            </div>
            <div className="details-group">
              <span className="details-label">SKU Code</span>
              <span className="details-value">{product.sku}</span>
            </div>
            <div className="details-group">
              <span className="details-label">Category</span>
              <span className="details-value">{product.category || 'N/A'}</span>
            </div>
            <div className="details-group">
              <span className="details-label">Cost Price</span>
              <span className="details-value">Rs. {product.costPrice?.toFixed(2)}</span>
            </div>
            <div className="details-group">
              <span className="details-label">Selling Price</span>
              <span className="details-value">Rs. {product.sellingPrice?.toFixed(2)}</span>
            </div>
            <div className="details-group">
              <span className="details-label">Stock Quantity</span>
              <span className="details-value">{product.stock}</span>
            </div>
          </div>
        </div>
      ) : (
        <div>Product not found</div>
      )}
    </Layout>
  );
}

export default ProductDetails;
