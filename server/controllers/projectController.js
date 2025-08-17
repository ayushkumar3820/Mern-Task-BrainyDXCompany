import Project from '../models/Project.js';


export const createProject = async (req, res) => {
    const { title, description, employees } = req.body;
    try {
        const project = new Project({
            title,
            description,
            manager: req.user.id,
            employees,
        });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error });
    }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('manager', 'name')
            .populate('employees', 'name');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
};