const prisma = require('../config/db');

const getDashboardStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const productsCount = await prisma.product.count({ where: { userId } });
    const customersCount = await prisma.customer.count({ where: { userId } });
    const invoicesCount = await prisma.invoice.count({ where: { userId } });
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      select: { totalAmount: true },
    });
    const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const recentProducts = await prisma.product.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    const recentInvoices = await prisma.invoice.findMany({
      where: { userId },
      take: 5,
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ productsCount, customersCount, invoicesCount, totalSales, recentProducts, recentInvoices });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getDashboardStats };