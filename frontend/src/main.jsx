import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

function parseDeadline(date) {
  if (!date) return null;

  // PostgreSQL may return either YYYY-MM-DD
  // or a complete ISO timestamp.
  const datePart = String(date).split('T')[0];
  const parsedDate = new Date(`${datePart}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function formatDate(date) {
  const parsedDate = parseDeadline(date);

  if (!parsedDate) {
    return 'No deadline';
  }

  return parsedDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isOverdue(task) {
  if (task.completed) return false;

  const deadline = parseDeadline(task.deadline);

  if (!deadline) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return deadline < today;
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('Loading...');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '', 
    description: '', 
    subject: '', 
    taskType: 'assignment', 
    priority: 'normal', 
    deadline: '', 
  });

  async function loadTasks() {
    try {
      const res = await fetch(`${API_URL}/api/tasks`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setTasks(data);
      setStatus('Connected to backend and PostgreSQL');
    } catch (error) {
      setStatus('Backend is not reachable. Check VITE_API_URL and backend logs.');
    }
  }

  useEffect(() => { loadTasks(); }, []);

  async function addTask(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({  
      title: '',
      description: '',
      subject: '',
      taskType: 'assignment',
      priority: 'normal',
      deadline: '' });
    loadTasks();
  }

  async function toggleTask(id) {
    await fetch(`${API_URL}/api/tasks/${id}/toggle`, { method: 'PATCH' });
    loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${API_URL}/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const overdue = tasks.filter(isOverdue).length;
    return { total, pending, completed, high, overdue };
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'high') return task.priority === 'high' && !task.completed;
    if (filter === 'overdue') return isOverdue(task);
    return true;
  });

  return (
    <main className="page">
      <section className="hero">
        <div>
          <span className="badge">Full-Stack Cloud Application</span>
          <h1>Student Study Planner</h1>
          <p>
            Manage assignments, exams, projects and study deadlines. Data is stored in PostgreSQL,
            so it survives restarts and redeploys.
          </p>
        </div>
        <div className="heroCard">
          <strong>Cloud architecture</strong>
          <span>React frontend</span>
          <span>Node.js backend API</span>
          <span>PostgreSQL persistent database</span>
        </div>
      </section>

      <section className="stats">
        <article><span>Total tasks</span><strong>{stats.total}</strong></article>
        <article><span>Pending</span><strong>{stats.pending}</strong></article>
        <article><span>Completed</span><strong>{stats.completed}</strong></article>
        <article><span>High priority</span><strong>{stats.high}</strong></article>
        <article className={stats.overdue ? 'danger' : ''}><span>Overdue</span><strong>{stats.overdue}</strong></article>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>Add a study task</h2>
            <p>Create a clear plan for homework, exams and projects.</p>
          </div>
          <span className={status.includes('not') ? 'status error' : 'status ok'}>{status}</span>
        </div>

        <form onSubmit={addTask} className="taskForm">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title, e.g. Prepare Kubernetes defense" />
          <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject, e.g. Cloud Technologies" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Details or study notes" />
          <select  value={form.taskType} onChange={e => setForm({ ...form, taskType: e.target.value })}>
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
            <option value="reading">Reading</option>
            <option value="personal">Personal</option>
          </select>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low priority</option>
            <option value="normal">Normal priority</option>
            <option value="high">High priority</option>
          </select>
          <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          <button type="submit">Add task</button>
        </form>
      </section>

      <section className="toolbar">
        {['all', 'pending', 'completed', 'high', 'overdue'].map(item => (
          <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </section>

      <section className="taskList">
        {filteredTasks.length === 0 ? (
          <div className="empty">No tasks in this view. Add your first study task.</div>
        ) : filteredTasks.map(task => (
          <article key={task.id} className={`task ${task.completed ? 'done' : ''} priority-${task.priority}`}>
            <div className="taskTop">
              <div>
                <h3>{task.title}</h3>
                <p>{task.description || 'No details added.'}</p>
              </div>
              <span className={`pill ${task.priority}`}>{task.priority}</span>
            </div>
            <div className="meta">
              <span>Subject: <b>{task.subject || 'General'}</b></span>
              <span>Type: <b>{task.taskType}</b></span>
              <span className={isOverdue(task) ? 'overdue' : ''}>Deadline: <b>{formatDate(task.deadline)}</b></span>
            </div>
            <div className="actions">
              <button onClick={() => toggleTask(task.id)}>{task.completed ? 'Reopen' : 'Mark completed'}</button>
              <button className="delete" onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
