const prisma = require('../config/db');

const getInvoices = async (req, res) => {
  const { search } = req.query;
  try {
    let where = {};
    if (search) {
      where = {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }
    const invoices = await prisma.invoice.findMany({
      where,
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getInvoiceById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: { include: { variants: true } } } },
      },
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createInvoice = async (req, res) => {
  const { customerId, items, deliveryCharges, discount } = req.body;
  const result = await processInvoiceData(null, customerId, items, deliveryCharges, discount);
  if (result.error) return res.status(400).json({ message: result.error });
  res.status(201).json(result.data);
};

const updateInvoice = async (req, res) => {
  const id = parseInt(req.params.id);
  const { customerId, items, deliveryCharges, discount } = req.body;
  
  try {
    const existing = await prisma.invoice.findUnique({ 
        where: { id }, 
        include: { items: { include: { product: { include: { bundleItems: true, variants: true } } } } } 
    });
    if (!existing) return res.status(404).json({ message: "Invoice not found" });

    await prisma.$transaction(async (tx) => {
        for (const item of existing.items) {
            if (item.product.hasVariants && item.selectedSize) {
                const sizes = item.selectedSize.split(', ');
                for (const s of sizes) {
                    await tx.productVariant.updateMany({
                        where: { productId: item.productId, size: s },
                        data: { stock: { increment: 1 } }
                    });
                }
            } else if (item.product.isBundle) {
                for (const b of item.product.bundleItems) {
                    await tx.product.update({ where: { id: b.productId }, data: { stock: { increment: item.quantity * b.quantity } } });
                }
            } else {
                await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
            }
        }
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    });

    const result = await processInvoiceData(id, customerId, items, deliveryCharges, discount);
    if (result.error) throw new Error(result.error);
    
    res.json(result.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

async function processInvoiceData(invoiceId, customerId, items, deliveryCharges, discount) {
  const charges = parseFloat(deliveryCharges) || 0;
  const disc = parseFloat(discount) || 0;

  try {
    const data = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const verifiedItems = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: parseInt(item.productId) },
          include: { bundleItems: { include: { product: { include: { variants: true } } } }, variants: true }
        });

        if (!product) throw new Error(`Product ${item.productId} not found`);
        const requestedQty = parseInt(item.quantity);
        let finalSizeString = "";

        if (product.isBundle) {
            const allBundleSizes = [];
            for (const b of product.bundleItems) {
                const comp = b.product;
                const totalNeeded = requestedQty * b.quantity;
                const componentSizes = item.bundleComponentSizes?.[comp.id] || [];

                if (comp.hasVariants) {
                    if (componentSizes.length !== totalNeeded) throw new Error(`Select ${totalNeeded} sizes for ${comp.name}`);
                    const sizeCounts = {};
                    componentSizes.forEach(s => sizeCounts[s] = (sizeCounts[s] || 0) + 1);
                    for (const size in sizeCounts) {
                        const variant = comp.variants.find(v => v.size === size);
                        if (!variant || variant.stock < sizeCounts[size]) throw new Error(`Stock low for ${comp.name} size ${size}`);
                        await tx.productVariant.updateMany({ where: { productId: comp.id, size: size }, data: { stock: { decrement: sizeCounts[size] } } });
                    }
                    allBundleSizes.push(...componentSizes);
                } else {
                    if (comp.stock < totalNeeded) throw new Error(`Stock low for component ${comp.name}`);
                    await tx.product.update({ where: { id: comp.id }, data: { stock: { decrement: totalNeeded } } });
                }
            }
            finalSizeString = allBundleSizes.join(', ');
        } 
        else if (product.hasVariants) {
            const sizesArr = item.selectedSizes || [];
            if (sizesArr.length !== requestedQty) throw new Error(`Select ${requestedQty} sizes for ${product.name}`);
            const sizeCounts = {};
            sizesArr.forEach(s => sizeCounts[s] = (sizeCounts[s] || 0) + 1);
            for (const size in sizeCounts) {
                const variant = product.variants.find(v => v.size === size);
                if (!variant || variant.stock < sizeCounts[size]) throw new Error(`Stock low for ${product.name} size ${size}`);
                await tx.productVariant.updateMany({ where: { productId: product.id, size: size }, data: { stock: { decrement: sizeCounts[size] } } });
            }
            finalSizeString = sizesArr.join(', ');
        }
        else {
            if (product.stock < requestedQty) throw new Error(`Insufficient stock for ${product.name}`);
            await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: requestedQty } } });
        }

        const unitPrice = parseFloat(item.unitPrice || product.sellingPrice);
        totalAmount += (requestedQty * unitPrice);
        verifiedItems.push({ ...item, unitPrice, totalPrice: requestedQty * unitPrice, selectedSize: finalSizeString });
      }

      const invoiceData = {
        customerId: parseInt(customerId),
        totalAmount: totalAmount + charges - disc,
        deliveryCharges: charges,
        discount: disc,
        items: {
          create: verifiedItems.map(vi => ({
            productId: parseInt(vi.productId),
            quantity: vi.quantity,
            unitPrice: vi.unitPrice,
            totalPrice: vi.totalPrice,
            selectedSize: vi.selectedSize
          }))
        }
      };

      return invoiceId 
        ? await tx.invoice.update({ where: { id: invoiceId }, data: invoiceData })
        : await tx.invoice.create({ data: { ...invoiceData, invoiceNumber: `INV-${Date.now()}` } });
    });
    return { data };
  } catch (e) {
    return { error: e.message };
  }
}

const deleteInvoice = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const inv = await prisma.invoice.findUnique({ where: { id }, include: { items: { include: { product: { include: { bundleItems: true, variants: true } } } } } });
      if (!inv) return res.status(404).json({ message: 'Not found' });
  
      await prisma.$transaction(async (tx) => {
        for (const item of inv.items) {
            if (item.product.hasVariants && item.selectedSize) {
                const sizes = item.selectedSize.split(', ');
                for (const s of sizes) {
                    await tx.productVariant.updateMany({ where: { productId: item.productId, size: s }, data: { stock: { increment: 1 } } });
                }
            } else if (item.product.isBundle) {
                for (const b of item.product.bundleItems) {
                    await tx.product.update({ where: { id: b.productId }, data: { stock: { increment: item.quantity * b.quantity } } });
                }
            } else {
                await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
            }
        }
        await tx.invoice.delete({ where: { id } });
      });
      res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

module.exports = { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice };