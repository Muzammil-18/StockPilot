import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';

function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await api.customers.getById(id);
        setCustomer(data);
      } catch (err) {
        setError(err.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  return (
    <Layout title="Customer Details">
      <div style={{ marginBottom: '16px' }}>
        <Link to="/customers" className="btn btn-secondary">← Back to Customers</Link>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <div>Loading customer details...</div>
      ) : customer ? (
        <>
          <div className="section-card">
            <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h2 className="section-title">{customer.name}</h2>
            </div>

            <div className="details-grid">
              <div className="details-group">
                <span className="details-label">Name</span>
                <span className="details-value">{customer.name}</span>
              </div>
              <div className="details-group">
                <span className="details-label">Phone</span>
                <span className="details-value">{customer.phone}</span>
              </div>
              <div className="details-group">
                <span className="details-label">Email</span>
                <span className="details-value">{customer.email || 'N/A'}</span>
              </div>
              <div className="details-group" style={{ gridColumn: 'span 3' }}>
                <span className="details-label">Address</span>
                <span className="details-value">{customer.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Invoice History</h2>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.invoices?.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>No invoices found for this customer</td>
                    </tr>
                  ) : (
                    customer.invoices?.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <Link to={`/invoices/${invoice.id}`} style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                            {invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
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
        </>
      ) : (
        <div>Customer not found</div>
      )}
    </Layout>
  );
}

export default CustomerDetails;
