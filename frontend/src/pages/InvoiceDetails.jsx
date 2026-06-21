import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';

function InvoiceDetails() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await api.invoices.getById(id);
        setInvoice(data);
      } catch (err) {
        setError(err.message || 'Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const getItemsSubtotal = () => {
    if (!invoice?.items) return 0;
    return invoice.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <Layout title="Invoice Details">
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <Link to="/invoices" className="btn btn-secondary">← Back to Invoices</Link>
        {invoice && (
          <Link to={`/invoices/${id}/print`} className="btn btn-primary">
            🖨️ Print Invoice
          </Link>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading invoice details...</div>
      ) : invoice ? (
        <div className="invoice-details-wrapper">
          <div className="invoice-details-header">
            <div className="invoice-details-brand">
              <div className="invoice-brand-logo">🚀</div>
              <div>
                <h1 className="invoice-brand-name">StockPilot</h1>
                <p className="invoice-brand-sub">Inventory & Invoice Management</p>
              </div>
            </div>
            <div className="invoice-details-meta">
              <div className="invoice-number-badge">INVOICE</div>
              <p className="invoice-meta-row"><span>Invoice No:</span><strong>{invoice.invoiceNumber}</strong></p>
              <p className="invoice-meta-row"><span>Date:</span><strong>{new Date(invoice.invoiceDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
            </div>
          </div>

          <div className="invoice-parties-grid">
            <div className="invoice-party-card">
              <div className="invoice-party-label">👤 Billed To</div>
              <p className="invoice-party-name">{invoice.customer?.name}</p>
              <p className="invoice-party-detail">📞 {invoice.customer?.phone}</p>
              {invoice.customer?.email && <p className="invoice-party-detail">✉️ {invoice.customer?.email}</p>}
              {invoice.customer?.address && <p className="invoice-party-detail">📍 {invoice.customer?.address}</p>}
            </div>
            <div className="invoice-summary-card">
              <div className="invoice-party-label">📋 Invoice Summary</div>
              <div className="invoice-summary-row">
                <span>Items</span>
                <strong>{invoice.items?.length}</strong>
              </div>
              <div className="invoice-summary-total">
                <span>Grand Total</span>
                <span>Rs. {invoice.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h3 className="invoice-section-heading">🛒 Line Items</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>{index + 1}</td>
                      <td style={{ fontWeight: 600 }}>{item.product?.name}</td>
                      <td>
                        <span className="badge badge-info">{item.quantity}</span>
                      </td>
                      <td>Rs. {item.unitPrice?.toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>Rs. {item.totalPrice?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="invoice-totals-card">
              <div className="invoice-total-line">
                <span>Items Subtotal</span>
                <span>Rs. {getItemsSubtotal().toFixed(2)}</span>
              </div>
              <div className="invoice-total-line delivery-line">
                <span>🚚 Delivery Charges</span>
                <span>+ Rs. {invoice.deliveryCharges?.toFixed(2) ?? '300.00'}</span>
              </div>
              <div className="invoice-total-line discount-line">
                <span>🏷️ Discount</span>
                <span>- Rs. {invoice.discount?.toFixed(2) ?? '0.00'}</span>
              </div>
              <div className="invoice-total-line grand-total-line">
                <span>💰 Grand Total</span>
                <span>Rs. {invoice.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>Invoice not found</div>
      )}
    </Layout>
  );
}

export default InvoiceDetails;