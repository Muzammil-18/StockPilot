import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchCustomers = async () => {
    try {
      const data = await api.customers.getAll(search);
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Customer Name and Phone Number are required');
      return;
    }
    setError('');
    const payload = { name, phone, email, address };
    try {
      if (isEditing) {
        await api.customers.update(currentCustomerId, payload);
      } else {
        await api.customers.create(payload);
      }
      resetForm();
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email);
    setAddress(customer.address);
    setCurrentCustomerId(customer.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.customers.delete(id);
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to delete customer');
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsEditing(false);
    setCurrentCustomerId(null);
    setShowForm(false);
    setError('');
  };

  return (
    <Layout title="Customers">
      {error && <div className="auth-error">{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div className="search-bar-container" style={{ margin: 0, flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Customer
          </button>
        )}
      </div>

      {showForm && (
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
            <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
          </div>
          <form onSubmit={handleCreateOrUpdate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Address</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Customer' : 'Save Customer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="section-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No customers found</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <Link to={`/customers/${customer.id}`} style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                        {customer.name}
                      </Link>
                    </td>
                    <td>{customer.phone}</td>
                    <td>{customer.email || 'N/A'}</td>
                    <td>{customer.address || 'N/A'}</td>
                    <td className="no-print">
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-icon" onClick={() => handleEdit(customer)}>✏️</button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(customer.id)}>🗑️</button>
                      </div>
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

export default Customers;
