const express = require('express');
const router = express.Router();
const db = require('../models/dbHelper');

// Dashboard summary
router.get('/summary', async (req, res, next) => {
  try {
    const totalSales = await db.get('SELECT SUM(total_price) as total FROM sales');
    const totalPurchases = await db.get('SELECT SUM(total_price) as total FROM purchases');
    const lowStockCount = await db.get('SELECT COUNT(*) as count FROM products WHERE stock <= min_stock');
    
    res.json({
      sales: totalSales.total || 0,
      purchases: totalPurchases.total || 0,
      lowStock: lowStockCount.count || 0
    });
  } catch (err) {
    next(err);
  }
});

// Laporan Penjualan per Tanggal
router.get('/sales', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = 'SELECT * FROM sales WHERE 1=1';
    const params = [];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY id DESC';

    const salesList = await db.all(sql, params);
    const totalRevenue = salesList.reduce((sum, s) => sum + (s.total_price || 0), 0);
    const totalTransactions = salesList.length;

    res.json({
      sales: salesList,
      totalRevenue,
      totalTransactions
    });
  } catch (err) {
    next(err);
  }
});

// Laporan Pembelian per Tanggal
router.get('/purchases', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = `
      SELECT p.*, s.name as supplier_name 
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      sql += ' AND p.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND p.date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY p.id DESC';

    const purchasesList = await db.all(sql, params);
    const totalExpenditure = purchasesList.reduce((sum, p) => sum + (p.total_price || 0), 0);
    const totalRestocks = purchasesList.length;

    res.json({
      purchases: purchasesList,
      totalExpenditure,
      totalRestocks
    });
  } catch (err) {
    next(err);
  }
});

// Stock mutations
router.get('/mutations', async (req, res, next) => {
  try {
    const mutations = await db.all(`
      SELECT m.*, p.name as product_name 
      FROM stock_mutations m
      JOIN products p ON m.product_id = p.id
      ORDER BY m.id DESC LIMIT 50
    `);
    res.json(mutations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
