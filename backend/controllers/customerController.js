const prisma = require('../config/db');

const getCustomers = async (req, res) => {
  const { search } = req.query;
  try {
    let where = { userId: req.user.id };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    const customers = await prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      include: { invoices: { orderBy: { createdAt: 'desc' } } }
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCustomer = async (req, res) => {
  const { name, phone, email, address } = req.body;
  try {
    const customer = await prisma.customer.create({
      data: { name, phone, email: email || '', address: address || '', userId: req.user.id }
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.customer.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const customer = await prisma.customer.update({
      where: { id },
      data: req.body
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.customer.deleteMany({ where: { id, userId: req.user.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };