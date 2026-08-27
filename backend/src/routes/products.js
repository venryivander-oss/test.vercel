const express = require('express');
const router = express.Router();
const db = require('../models/dbHelper');

// Get all products (with supplier name and unit)
router.get('/', async (req, res, next) => {
  try {
    const products = await db.all(`
      SELECT p.*, s.name as supplier_name 
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.id DESC
    `);
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Search products by barcode or SKU
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const products = await db.all(`
      SELECT * FROM products 
      WHERE barcode = ? OR sku = ? OR name LIKE ?
    `, [q, q, `%${q}%`]);
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Create product (with unit, stock)
router.post('/', async (req, res, next) => {
  try {
    const { sku, barcode, name, category, unit, selling_price, min_stock, stock, supplier_id } = req.body;
    
    const safeUnit = unit ? unit.trim() : 'Pcs';
    const safeStock = Number(stock) || 0;
    const safeSellingPrice = Number(selling_price) || 0;
    const safeMinStock = Number(min_stock) || 0;
    const safeSupplierId = (supplier_id === "" || supplier_id === undefined || supplier_id === null) ? null : Number(supplier_id);

    const result = await db.run(
      `INSERT INTO products (sku, barcode, name, category, unit, purchase_price, selling_price, min_stock, stock, supplier_id) 
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [sku, barcode, name, category, safeUnit, safeSellingPrice, safeMinStock, safeStock, safeSupplierId]
    );

    // Record stock mutation if initial stock > 0
    if (safeStock > 0) {
      await db.run(
        'INSERT INTO stock_mutations (product_id, type, qty, reference_id, description) VALUES (?, ?, ?, ?, ?)',
        [result.lastID, 'IN', safeStock, result.lastID, 'Stok Awal Produk Baru']
      );
    }

    res.status(201).json({ id: result.lastID, message: 'Product created successfully' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'SKU atau Barcode sudah digunakan!' });
    }
    next(err);
  }
});

// Update product (includes unit, stock update & sanitization)
router.put('/:id', async (req, res, next) => {
  try {
    const { sku, barcode, name, category, unit, selling_price, min_stock, stock, supplier_id } = req.body;
    
    const safeUnit = unit ? unit.trim() : 'Pcs';
    const safeStock = Number(stock) || 0;
    const safeSellingPrice = Number(selling_price) || 0;
    const safeMinStock = Number(min_stock) || 0;
    const safeSupplierId = (supplier_id === "" || supplier_id === undefined || supplier_id === null) ? null : Number(supplier_id);

    const oldProduct = await db.get('SELECT stock FROM products WHERE id = ?', [req.params.id]);
    if (!oldProduct) return res.status(404).json({ error: 'Product not found' });

    await db.run(
      `UPDATE products SET sku = ?, barcode = ?, name = ?, category = ?, unit = ?,
       selling_price = ?, min_stock = ?, stock = ?, supplier_id = ? WHERE id = ?`,
      [sku, barcode, name, category, safeUnit, safeSellingPrice, safeMinStock, safeStock, safeSupplierId, req.params.id]
    );

    // If stock changed directly via edit, record a mutation
    const diff = safeStock - oldProduct.stock;
    if (diff !== 0) {
      await db.run(
        'INSERT INTO stock_mutations (product_id, type, qty, reference_id, description) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, 'ADJUST', Math.abs(diff), req.params.id, `Manual Edit Stok (${diff > 0 ? '+' : ''}${diff})`]
      );
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    next(err);
  }
});

// Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
