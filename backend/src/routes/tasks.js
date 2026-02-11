import express from 'express';
import auth from '../middleware/auth.js';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(auth);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/reorder', reorderTasks);

export default router;
