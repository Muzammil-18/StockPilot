const prisma = require('../config/db');

const getProducts = async (req, res) => {
  const { search } = req.query;
  try {
    let where = { userId: req.user.id };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    const products = await prisma.product.findMany({
      where,
      include: { 
        variants: true, 
        bundleItems: { include: { product: { include: { variants: true } } } } 
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      include: { variants: true, bundleItems: { include: { product: { include: { variants: true } } } } }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createProduct = async (req, res) => {
  const { name, category, sku, costPrice, sellingPrice, stock, isBundle, bundleProductIds, hasVariants, variants } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name, category: category || '', sku,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice),
        stock: hasVariants ? 0 : (parseInt(stock) || 0),
        isBundle: !!isBundle,
        hasVariants: !!hasVariants,
        userId: req.user.id,
        variants: hasVariants && variants ? {
          create: variants.map(v => ({ size: v.size, stock: parseInt(v.stock) || 0 }))
        } : undefined,
        bundleItems: isBundle && bundleProductIds ? {
          create: bundleProductIds.map(id => ({ productId: parseInt(id), quantity: 1 }))
        } : undefined
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, category, sku, costPrice, sellingPrice, stock, isBundle, bundleProductIds, hasVariants, variants } = req.body;

  try {
    const existing = await prisma.product.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.bundleItem.deleteMany({ where: { bundleId: id } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name, category, sku, costPrice: parseFloat(costPrice), sellingPrice: parseFloat(sellingPrice),
        stock: hasVariants ? 0 : parseInt(stock), isBundle: !!isBundle, hasVariants: !!hasVariants,
        variants: hasVariants && variants ? {
          create: variants.map(v => ({ size: v.size, stock: parseInt(v.stock) }))
        } : undefined,
        bundleItems: isBundle && bundleProductIds ? {
          create: bundleProductIds.map(pid => ({ productId: parseInt(pid), quantity: 1 }))
        } : undefined
      },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.deleteMany({ where: { id, userId: req.user.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };