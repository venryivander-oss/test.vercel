const express = require('express');
const router = express.Router();
const db = require('../models/dbHelper');

// Get all units
router.get('/', async (req, res, next) => {
  try {
    const units = await db.all('SELECT * FROM units ORDER BY name ASC');
    res.json(units);
  } catch (err) {
    next(err);
  }
});

// Create new unit
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nama satuan wajib diisi!' });
    }
    const cleanName = name.trim();

    const result = await db.run('INSERT INTO units (name) VALUES (?)', [cleanName]);
    res.status(201).json({ id: result.lastID, name: cleanName, message: 'Satuan berhasil ditambahkan' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Nama satuan sudah ada!' });
    }
    next(err);
  }
});

module.exports = router;
