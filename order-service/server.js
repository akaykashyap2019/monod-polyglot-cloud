const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'monod_user',
  password: process.env.DB_PASSWORD || 'monod_password',
  database: process.env.DB_NAME || 'monod_db'
});

app.use(express.json());

// Initialize Table
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('DB Init Error:', err.message);
  }
};
initDB();

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { item_name, price } = req.body;
  if (!item_name || !price) return res.status(400).json({ error: 'item_name and price are required' });
  try {
    const result = await pool.query(
      'INSERT INTO orders (item_name, price) VALUES ($1, $2) RETURNING *',
      [item_name, parseFloat(price)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));