const API_URL = 'https://stockpilot-87fh.onrender.com/api';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const api = {
  auth: {
    login: (credentials) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => fetchWithAuth('/auth/me'),
  },
  products: {
    getAll: (search = '') => fetchWithAuth(`/products?search=${encodeURIComponent(search)}`),
    getById: (id) => fetchWithAuth(`/products/${id}`),
    create: (data) => fetchWithAuth('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchWithAuth(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchWithAuth(`/products/${id}`, { method: 'DELETE' }),
  },
  customers: {
    getAll: (search = '') => fetchWithAuth(`/customers?search=${encodeURIComponent(search)}`),
    getById: (id) => fetchWithAuth(`/customers/${id}`),
    create: (data) => fetchWithAuth('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchWithAuth(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchWithAuth(`/customers/${id}`, { method: 'DELETE' }),
  },
  invoices: {
    getAll: (search = '') => fetchWithAuth(`/invoices?search=${encodeURIComponent(search)}`),
    getById: (id) => fetchWithAuth(`/invoices/${id}`),
    create: (data) => fetchWithAuth('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    // YE LINE MISSING THI JIS SE ERROR AA RAHA THA:
    update: (id, data) => fetchWithAuth(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }), 
    delete: (id) => fetchWithAuth(`/invoices/${id}`, { method: 'DELETE' }),
  },
  dashboard: {
    getStats: () => fetchWithAuth('/dashboard'),
  },
};