const { db, isTurso } = require('../config/db');

const dbHelper = {
  async all(sql, params = []) {
    if (isTurso) {
      const result = await db.execute({ sql, args: params });
      return result.rows;
    }
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  async get(sql, params = []) {
    if (isTurso) {
      const result = await db.execute({ sql, args: params });
      return result.rows[0] || null;
    }
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  async run(sql, params = []) {
    if (isTurso) {
      const result = await db.execute({ sql, args: params });
      return {
        lastID: Number(result.lastInsertRowid),
        changes: result.rowsAffected,
      };
    }
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this); // contains lastID and changes
      });
    });
  }
};

module.exports = dbHelper;
