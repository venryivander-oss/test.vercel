const express = require('express');
const router = express.Router();
const db = require('../models/dbHelper');

// Get all purchases
router.get('/', async (req, res, next) => {
  try {
    const purchases = await db.all(`
      SELECT p.*, s.name as supplier_name 
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.id DESC
    `);
    res.json(purchases);
  } catch (err) {
    next(err);
  }
});

// Create purchase (Restock)
router.post('/', async (req, res, next) => {
  const { invoice_number, date, supplier_id, total_price, items } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Items cannot be empty' });
  }

  try {
    await db.run('BEGIN TRANSACTION');

    // 1. Insert Purchase
    const purchaseResult = await db.run(
      'INSERT INTO purchases (invoice_number, date, supplier_id, total_price) VALUES (?, ?, ?, ?)',
      [invoice_number, date, supplier_id, total_price]
    );
    const purchaseId = purchaseResult.lastID;

    // 2. Insert Items & Update Stock & Insert Mutation
    for (const item of items) {
      await db.run(
        'INSERT INTO purchase_items (purchase_id, product_id, qty, price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [purchaseId, item.product_id, item.qty, item.price, item.subtotal]
      );

      await db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.qty, item.product_id]);

      await db.run(
        'INSERT INTO stock_mutations (product_id, type, qty, reference_id, description) VALUES (?, ?, ?, ?, ?)',
        [item.product_id, 'IN', item.qty, purchaseId, `Restock from Invoice ${invoice_number}`]
      );
    }

    await db.run('COMMIT');
    res.status(201).json({ message: 'Purchase successful' });
  } catch (err) {
    await db.run('ROLLBACK');
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Invoice number must be unique' });
    }
    next(err);
  }
});

module.exports = router;
