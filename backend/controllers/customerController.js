const prisma = require('../config/db');

const getCustomers = async (req, res) => {
  const { search } = req.query;
  try {
    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCustomerById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCustomer = async (req, res) => {
  const { name, phone, email, address } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: 'Customer Name and Phone Number are required' });
  }
  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || '',
        address: address || '',
      },
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCustomer = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, phone, email, address } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: 'Customer Name and Phone Number are required' });
  }
  try {
    const existingCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!existingCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        phone,
        email: email || '',
        address: address || '',
      },
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCustomer = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const existingCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!existingCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await prisma.customer.delete({ where: { id } });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
