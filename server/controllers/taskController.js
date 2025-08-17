import Task from '../models/Task.js';


export const createTask = async (req, res) => {
    const { title, description, projectId, employeeId, priority, deadline } = req.body;
    try {
        const task = new Task({
            title,
            description,
            project: projectId,
            assignedTo: employeeId,
            priority,
            deadline,
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
};

export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
        req.io.emit('taskUpdated', task);
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
};

export const getTasks = async (req, res) => {
    const { search, status, priority, employee } = req.query;
    try {
        const query = {};
        if (search) query.title = { $regex: search, $options: 'i' };
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (employee) query.assignedTo = employee;

        const tasks = await Task.find(query)
            .populate('project', 'title')
            .populate('assignedTo', 'name');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};