const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');

const app = express();


const DATABASE_URL = process.env.DATABASE_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const allowedOrigins = CORS_ORIGIN
  .split(',')
  .map((origin) => origin.trim());

const allowAllOrigins = allowedOrigins.includes('*');

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS not allowed for origin: ${origin}`));
      }
    },
  })
);

app.use(express.json());
app.use(morgan('combined'));

const useSsl = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT DEFAULT '',
      subject VARCHAR(120) DEFAULT '',
      task_type VARCHAR(50) DEFAULT 'assignment',
      priority VARCHAR(20) DEFAULT 'normal',
      deadline DATE,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function normalizeTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    subject: row.subject || '',
    taskType: row.task_type || 'assignment',
    priority: row.priority || 'normal',
    deadline: row.deadline,
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      app: 'Student Study Planner',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
    });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM tasks
      ORDER BY completed ASC, deadline ASC NULLS LAST, created_at DESC;
    `);

    res.json(result.rows.map(normalizeTask));
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: 'Error getting tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const {
      title,
      description = '',
      subject = '',
      taskType = 'assignment',
      priority = 'normal',
      deadline = null,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks
        (title, description, subject, task_type, priority, deadline)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [
        title.trim(),
        description,
        subject,
        taskType,
        priority,
        deadline || null,
      ]
    );

    res.status(201).json(normalizeTask(result.rows[0]));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

app.patch('/api/tasks/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE tasks
      SET completed = NOT completed,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(normalizeTask(result.rows[0]));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING *;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task deleted',
      task: normalizeTask(result.rows[0]),
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = {
  app,
  pool,
  initDb,
};