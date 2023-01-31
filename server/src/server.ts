import express from 'express';
import { pool } from './db';

const PORT = process.env.PORT || 3001;

const app = express();

// get all todos
app.get('/task', async (req, res) => {
  try {
    const tasks = await pool.query('SELECT * FROM todo');
    res.json(tasks.rows);
  }
  catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
