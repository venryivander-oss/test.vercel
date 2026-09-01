const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
require('./config/db');

// Routes
const suppliersRouter = require('./routes/suppliers');
const productsRouter = require('./routes/products');
const purchasesRouter = require('./routes/purchases');
const salesRouter = require('./routes/sales');
const reportsRouter = require('./routes/reports');
const opnamesRouter = require('./routes/opnames');
const categoriesRouter = require('./routes/categories');
const unitsRouter = require('./routes/units');

app.use('/api/suppliers', suppliersRouter);
app.use('/api/products', productsRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/opnames', opnamesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/units', unitsRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
}

module.exports = app;
