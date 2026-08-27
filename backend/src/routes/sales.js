const express = require('express');
const router = express.Router();
const db = require('../models/dbHelper');

// Get all sales
router.get('/', async (req, res, next) => {
  try {
    const sales = await db.all('SELECT * FROM sales ORDER BY id DESC');
    res.json(sales);
  } catch (err) {
    next(err);
  }
});

// Create sale (POS)
router.post('/', async (req, res, next) => {
  const { invoice_number, date, total_price, discount, paid_amount, change_amount, items } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart cannot be empty' });
  }

  try {
    await db.run('BEGIN TRANSACTION');

    // Check stock for all items first
    for (const item of items) {
      const product = await db.get('SELECT stock, name FROM products WHERE id = ?', [item.product_id]);
      if (!product) throw new Error(`Product ID ${item.product_id} not found`);
      if (product.stock < item.qty) {
        throw new Error(`Stok tidak mencukupi untuk ${product.name} (Sisa: ${product.stock})`);
      }
    }

    // 1. Insert Sale
    const saleResult = await db.run(
      'INSERT INTO sales (invoice_number, date, total_price, discount, paid_amount, change_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [invoice_number, date, total_price, discount, paid_amount, change_amount]
    );
    const saleId = saleResult.lastID;

    // 2. Insert Items & Update Stock & Insert Mutation
    for (const item of items) {
      await db.run(
        'INSERT INTO sale_items (sale_id, product_id, qty, price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [saleId, item.product_id, item.qty, item.price, item.subtotal]
      );

      await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.product_id]);

      await db.run(
        'INSERT INTO stock_mutations (product_id, type, qty, reference_id, description) VALUES (?, ?, ?, ?, ?)',
        [item.product_id, 'OUT', item.qty, saleId, `Sale Invoice ${invoice_number}`]
      );
    }

    await db.run('COMMIT');
    res.status(201).json({ message: 'Sale successful' });
  } catch (err) {
    await db.run('ROLLBACK');
    if (err.message.includes('Stok tidak mencukupi')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Invoice number must be unique' });
    }
    next(err);
  }
});

module.exports = router;
