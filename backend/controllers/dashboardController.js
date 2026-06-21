const prisma = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const productsCount = await prisma.product.count();
    const customersCount = await prisma.customer.count();
    const invoicesCount = await prisma.invoice.count();
    const invoices = await prisma.invoice.findMany({
      select: { totalAmount: true },
    });
    const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      productsCount,
      customersCount,
      invoicesCount,
      totalSales,
      recentProducts,
      recentInvoices,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getDashboardStats };
