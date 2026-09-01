const path = require('path');
require('dotenv').config();

let db;
let isTurso = false;

if (process.env.TURSO_DATABASE_URL) {
  isTurso = true;
  const { createClient } = require('@libsql/client');
  db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  console.log('Connected to Turso Cloud SQLite database.');
  initTursoTables(db);
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.resolve(__dirname, '../../database.sqlite');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening local SQLite database:', err.message);
    } else {
      console.log('Connected to local SQLite database.');
      createLocalTables(db);
    }
  });
}

async function initTursoTables(client) {
  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      contact TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.execute(`INSERT OR IGNORE INTO categories (name) VALUES ('ALAT TULIS'), ('Makanan'), ('Minuman'), ('Umum')`);

    await client.execute(`CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.execute(`INSERT OR IGNORE INTO units (name) VALUES ('Pcs'), ('Box'), ('Kg'), ('Liter'), ('Pack'), ('Botol'), ('Dus'), ('Sachet'), ('Renceng'), ('Lusin')`);

    await client.execute(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT DEFAULT 'Pcs',
      purchase_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 0,
      supplier_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      supplier_id INTEGER,
      total_price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER,
      product_id INTEGER,
      qty INTEGER DEFAULT 1,
      price REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      FOREIGN KEY (purchase_id) REFERENCES purchases(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      total_price REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      change_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      product_id INTEGER,
      qty INTEGER DEFAULT 1,
      price REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS stock_opnames (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      product_id INTEGER,
      system_stock INTEGER,
      physical_stock INTEGER,
      difference INTEGER,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    await client.execute(`CREATE TABLE IF NOT EXISTS stock_mutations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      type TEXT CHECK(type IN ('IN', 'OUT', 'ADJUST')),
      qty INTEGER NOT NULL,
      reference_id INTEGER,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    console.log('Turso Cloud database tables verified/created successfully.');
  } catch (err) {
    console.error('Error initializing Turso tables:', err.message);
  }
}

function createLocalTables(sqliteDb) {
  sqliteDb.serialize(() => {
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      contact TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, () => {
      sqliteDb.run(`INSERT OR IGNORE INTO categories (name) VALUES ('ALAT TULIS'), ('Makanan'), ('Minuman'), ('Umum')`);
    });

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, () => {
      sqliteDb.run(`INSERT OR IGNORE INTO units (name) VALUES ('Pcs'), ('Box'), ('Kg'), ('Liter'), ('Pack'), ('Botol'), ('Dus'), ('Sachet'), ('Renceng'), ('Lusin')`);
    });

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT DEFAULT 'Pcs',
      purchase_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 0,
      supplier_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      supplier_id INTEGER,
      total_price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER,
      product_id INTEGER,
      qty INTEGER DEFAULT 1,
      price REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      FOREIGN KEY (purchase_id) REFERENCES purchases(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      total_price REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      change_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      product_id INTEGER,
      qty INTEGER DEFAULT 1,
      price REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS stock_opnames (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      product_id INTEGER,
      system_stock INTEGER,
      physical_stock INTEGER,
      difference INTEGER,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS stock_mutations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      type TEXT CHECK(type IN ('IN', 'OUT', 'ADJUST')),
      qty INTEGER NOT NULL,
      reference_id INTEGER,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    console.log('Local SQLite database tables verified/created successfully.');
  });
}

module.exports = { db, isTurso };
