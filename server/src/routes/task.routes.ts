import express from 'express';

// Controllers
import { getAllTasks, createTask, updateTaskStatus, updateTask, deleteTask } from '../controllers/task.controller';

const router = express.Router();

// /task/ -> GET
router.get('/', getAllTasks);

// /task/ -> POST
router.post('/', createTask);

// /task/ -> PATCH
router.patch('/', updateTask);

// /task/:id/updateStatus -> PATCH
router.patch('/:id', updateTaskStatus);

// /task/ -> DELETE
router.delete('/:id', deleteTask);

export default router;