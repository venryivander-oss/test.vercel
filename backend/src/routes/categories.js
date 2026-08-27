const express = require('express');
const router = express.Router();
const db = require('../models/dbHelper');

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await db.all('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// Create new category
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi!' });
    }
    const cleanName = name.trim().toUpperCase();

    const result = await db.run('INSERT INTO categories (name) VALUES (?)', [cleanName]);
    res.status(201).json({ id: result.lastID, name: cleanName, message: 'Kategori berhasil ditambahkan' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Nama kategori sudah ada!' });
    }
    next(err);
  }
});

// Delete category
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
