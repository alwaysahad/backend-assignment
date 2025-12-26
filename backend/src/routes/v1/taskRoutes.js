const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTask, updateTask, deleteTask, getTaskStats } = require('../../controllers/taskController');
const { protect } = require('../../middleware/auth');
const { createTaskValidation, updateTaskValidation, taskIdValidation, listTasksValidation } = require('../../validators/taskValidator');

router.use(protect);

router.get('/stats', getTaskStats);
router.route('/').get(listTasksValidation, getTasks).post(createTaskValidation, createTask);
router.route('/:id').get(taskIdValidation, getTask).put(updateTaskValidation, updateTask).delete(taskIdValidation, deleteTask);

module.exports = router;
