const express = require('express');
const router = express.Router();
const db = require('../models/dbHelper');

// Get all suppliers
router.get('/', async (req, res, next) => {
  try {
    const suppliers = await db.all('SELECT * FROM suppliers ORDER BY id DESC');
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
});

// Get supplier by ID
router.get('/:id', async (req, res, next) => {
  try {
    const supplier = await db.get('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    next(err);
  }
});

// Create supplier
router.post('/', async (req, res, next) => {
  try {
    const { code, name, contact, address } = req.body;
    const result = await db.run(
      'INSERT INTO suppliers (code, name, contact, address) VALUES (?, ?, ?, ?)',
      [code, name, contact, address]
    );
    res.status(201).json({ id: result.lastID, message: 'Supplier created successfully' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Supplier code must be unique' });
    }
    next(err);
  }
});

// Update supplier
router.put('/:id', async (req, res, next) => {
  try {
    const { code, name, contact, address } = req.body;
    const result = await db.run(
      'UPDATE suppliers SET code = ?, name = ?, contact = ?, address = ? WHERE id = ?',
      [code, name, contact, address, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier updated successfully' });
  } catch (err) {
    next(err);
  }
});

// Delete supplier
router.delete('/:id', async (req, res, next) => {
  try {
    // Check if supplier is used in products
    const product = await db.get('SELECT id FROM products WHERE supplier_id = ? LIMIT 1', [req.params.id]);
    if (product) return res.status(400).json({ error: 'Cannot delete supplier because it is referenced by products' });

    const result = await db.run('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
