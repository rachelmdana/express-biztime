const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to parse JSON
router.use(express.json());

// GET /invoices
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, comp_code FROM invoices');
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /invoices/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = result.rows[0];
    const companyResult = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [invoice.comp_code]);
    const company = companyResult.rows[0];

    return res.json({ invoice: { ...invoice, company } });
  } catch (err) {
    return next(err);
  }
});

// POST /invoices
router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT /invoices/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;

    const currentDate = new Date().toISOString().split('T')[0]; // Get today's date

    const result = await db.query(
      'UPDATE invoices SET amt=$2, paid=$3, paid_date=CASE WHEN $3 = true THEN $4 ELSE null END WHERE id=$1 RETURNING *',
      [id, amt, paid, currentDate]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE /invoices/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;