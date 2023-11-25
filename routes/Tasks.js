const FetchUser = require('../middleware/FetchUser');
const Task = require('../models/Tasks');
const router = require('express').Router();

router.post('/addTask', FetchUser, async (req, res) => {
    const { name, description, project } = req.body

    try {
        if (!name || !description)
            return res.status(400).json({ success: false, message: 'Please fill all the required fields.' });

        let task = await Task.create({ name, description, project });
        task = await Task.findById(task._id).populate('project');

        res.status(200).json({ success: true, task });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateTaskText/:id', FetchUser, async (req, res) => {
    const { name, description } = req.body;
    
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, { name, description }, { new: true }).populate('project');
        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateTaskStage/:id', FetchUser, async (req, res) => {
    const { stage } = req.body;

    try {
        const task = await Task.findByIdAndUpdate(req.params.id, { stage }, { new: true }).populate('project');
        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/deleteTask/:id', FetchUser, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/getAllTasks/:id', FetchUser, async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.id }).sort({ updatedAt: 1 });
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;