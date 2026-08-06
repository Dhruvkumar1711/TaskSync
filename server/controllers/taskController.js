const db = require('../models/connection');

const getTasks = async (req, res) => {
    const projectId = req.params.id;
    try{
        const tasksQuery = `
        SELECT * FROM tasks 
        WHERE project_id = $1
        `;
        const result = await db.query(tasksQuery, [projectId]);

        res.json({
            status: 'success',
            data: result.rows
        });
    }catch(err){
        res.status(500).json({
            status: 'error',
            error: 'Failed to fetch tasks'
        });
    }
}

const createTask = async (req, res) => {
    const projectId = req.params.id;
    const { title, description, assigned_to, due_date } = req.body;

    try {
        const createTaskQuery = `
        INSERT INTO tasks (project_id, title, description, assigned_to, due_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `;
        const result = await db.query(createTaskQuery, [projectId, title, description, assigned_to, due_date]);

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to create task'
        });
    }
}

const updateTask = async (req, res) => {
    const taskId = req.params.taskId;
    const { status, assigned_to } = req.body;

    try {
        const updateTaskQuery = `
        UPDATE tasks
        SET status = COALESCE($1, status),
            assigned_to = COALESCE($2, assigned_to)
        WHERE id = $3
        RETURNING *
        `;
        const result = await db.query(updateTaskQuery, [status, assigned_to, taskId]);
        res.json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to update task'
        });
    }
}

module.exports = { getTasks, createTask, updateTask };
