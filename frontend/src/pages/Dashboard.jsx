import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.dashboard.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div>Loading dashboard data...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="auth-error">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-icon-container card-icon-products">📦</div>
          <div className="card-info">
            <span className="card-title">Total Products</span>
            <span className="card-value">{stats?.productsCount || 0}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-icon-container card-icon-customers">👥</div>
          <div className="card-info">
            <span className="card-title">Total Customers</span>
            <span className="card-value">{stats?.customersCount || 0}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-icon-container card-icon-invoices">📄</div>
          <div className="card-info">
            <span className="card-title">Total Invoices</span>
            <span className="card-value">{stats?.invoicesCount || 0}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-icon-container card-icon-sales">💰</div>
          <div className="card-info">
            <span className="card-title">Total Sales</span>
            <span className="card-value">Rs. {stats?.totalSales?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Recent Products</h2>
            <Link to="/products" className="btn btn-secondary">View All</Link>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentProducts?.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No products found</td>
                  </tr>
                ) : (
                  stats?.recentProducts?.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <Link to={`/products/${product.id}`} style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                          {product.name}
                        </Link>
                      </td>
                      <td>{product.sku}</td>
                      <td>Rs. {product.sellingPrice?.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                          {product.stock} in stock
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Recent Invoices</h2>
            <Link to="/invoices" className="btn btn-secondary">View All</Link>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentInvoices?.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No invoices found</td>
                  </tr>
                ) : (
                  stats?.recentInvoices?.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <Link to={`/invoices/${invoice.id}`} style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td>{invoice.customer?.name}</td>
                      <td>Rs. {invoice.totalAmount?.toFixed(2)}</td>
                      <td>
                        <Link to={`/invoices/${invoice.id}`} className="btn btn-secondary btn-icon">👁️</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
