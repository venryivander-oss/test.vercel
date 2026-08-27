const express = require('express');
const router = express.Router();
const db = require('../models/dbHelper');

// Get all opnames
router.get('/', async (req, res, next) => {
  try {
    const opnames = await db.all(`
      SELECT o.*, p.name as product_name 
      FROM stock_opnames o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.id DESC
    `);
    res.json(opnames);
  } catch (err) {
    next(err);
  }
});

// Create stock opname
router.post('/', async (req, res, next) => {
  const { date, product_id, physical_stock, reason } = req.body;
  
  try {
    await db.run('BEGIN TRANSACTION');

    const product = await db.get('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (!product) throw new Error('Product not found');
    
    const system_stock = product.stock;
    const difference = physical_stock - system_stock;

    if (difference === 0) {
       await db.run('ROLLBACK');
       return res.status(400).json({ error: 'Fisik dan Sistem sama, tidak ada penyesuaian.' });
    }

    const opnameResult = await db.run(
      'INSERT INTO stock_opnames (date, product_id, system_stock, physical_stock, difference, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [date, product_id, system_stock, physical_stock, difference, reason]
    );

    await db.run('UPDATE products SET stock = ? WHERE id = ?', [physical_stock, product_id]);

    await db.run(
      'INSERT INTO stock_mutations (product_id, type, qty, reference_id, description) VALUES (?, ?, ?, ?, ?)',
      [product_id, 'ADJUST', Math.abs(difference), opnameResult.lastID, `Opname: ${reason}`]
    );

    await db.run('COMMIT');
    res.status(201).json({ message: 'Stock Opname saved successfully' });
  } catch (err) {
    await db.run('ROLLBACK');
    next(err);
  }
});

module.exports = router;
