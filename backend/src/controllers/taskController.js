import mongoose from 'mongoose';
import Task from '../models/Task.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const taskData = {
      user: req.user.id,
      title: title.trim(),
      completed: false,
    };

    if (description) taskData.description = description.trim();
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      taskData.priority = priority;
    }
    if (dueDate) taskData.dueDate = new Date(dueDate);
    if (category) taskData.category = category.trim();

    const task = await Task.create(taskData);

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create task.' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ order: 1, createdAt: -1 });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const updates = {};
    if (typeof req.body.title === 'string') {
      updates.title = req.body.title.trim();
    }
    if (typeof req.body.description === 'string') {
      updates.description = req.body.description.trim();
    }
    if (typeof req.body.completed === 'boolean') {
      updates.completed = req.body.completed;
      updates.completedAt = req.body.completed ? new Date() : null;
    }
    if (req.body.priority && ['low', 'medium', 'high'].includes(req.body.priority)) {
      updates.priority = req.body.priority;
    }
    if (req.body.dueDate !== undefined) {
      updates.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }
    if (typeof req.body.category === 'string') {
      updates.category = req.body.category.trim();
    }
    if (typeof req.body.order === 'number') {
      updates.order = req.body.order;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json(updatedTask);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update task.' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    await Task.deleteOne({ _id: id });

    return res.json({ message: 'Task deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task.' });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { taskOrders } = req.body;

    if (!Array.isArray(taskOrders)) {
      return res.status(400).json({ message: 'Invalid task orders.' });
    }

    const bulkOps = taskOrders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id, user: req.user.id },
        update: { order },
      },
    }));

    await Task.bulkWrite(bulkOps);

    return res.json({ message: 'Tasks reordered successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reorder tasks.' });
  }
};
