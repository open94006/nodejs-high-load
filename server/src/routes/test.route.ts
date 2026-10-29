import express from 'express';
import { pool } from '../database/db.js';

const app = express.Router();

app.get('/api/hello', async (req, res) => {
    res.json({ message: 'Hello from Express + TS backend!' });
});

export default app;
