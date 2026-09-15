const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection (Replaced with a local URI; use your Atlas connection string here)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27012/todo_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected securely to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Task Schema and Model
const taskSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

// REST API Routes
// 1. Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 2. Add a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const newTask = new Task({ text: req.body.text });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

// 3. Update task status (Toggle Completed)
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    task.completed = !task.completed;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task' });
  }
});

// 4. Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running smoothly on http://localhost:${PORT}`);
});
