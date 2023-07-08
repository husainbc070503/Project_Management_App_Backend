const FetchUser = require('../middleware/FetchUser');
const Project = require('../models/Projects');
const Team = require('../models/Team');
const router = require('express').Router();

/* Create Project */
router.post('/createProject', FetchUser, async (req, res) => {
    const { title, description, start, end, isTeamProject, team } = req.body;

    try {
        if (!title || !description)
            return res.status(400).json({ success: false, message: 'Please fill all the required fields' });

        let project = await Project.create({ user: req.user, title, description, start, end, isTeamProject, team });
        project = await Project.findById(project._id).populate('user', '-password').populate('team');

        project = await Team.populate(project, {
            path: "team.teamLeader",
            select: "-password"
        })

        project = await Team.populate(project, {
            path: "team.members",
            select: "-password"
        })

        res.status(200).json({ success: true, project });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateProject/:id', FetchUser, async (req, res) => {
    const { title, description, start, end } = req.body;

    try {
        let project = await Project.findByIdAndUpdate(req.params.id, { title, description, start, end }, { new: true })
            .populate('user', '-password')
            .populate('team');

        project = await Team.populate(project, {
            path: "team.teamLeader",
            select: "-password"
        })

        project = await Team.populate(project, {
            path: "team.members",
            select: "-password"
        })

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.delete('/deleteProject/:id', FetchUser, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/getAllProjects', FetchUser, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user._id, isTeamProject: false }).populate('user', '-pasword').sort({ start: 1 });
        res.status(200).json({ success: true, projects });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/getProject/:id', FetchUser, async (req, res) => {
    try {
        let project = await Project.findById(req.params.id)
            .populate('user', '-password')
            .populate('team')

        project = await Team.populate(project, {
            path: "team.teamLeader",
            select: "-password"
        })

        project = await Team.populate(project, {
            path: "team.members",
            select: "-password"
        })

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/getTeamProjects/:id', FetchUser, async (req, res) => {
    try {
        let projects = await Project.find({ team: req.params.id })
            .populate('user', '-password')
            .populate('team')
            .sort({ updatedAt: 1 });

        projects = await Team.populate(projects, {
            path: "team.teamLeader",
            select: "-password"
        })

        projects = await Team.populate(projects, {
            path: "team.members",
            select: "-password"
        })

        res.status(200).json({ success: true, projects });
    } catch (error) {
        res.status(400).json({ success: true, message: error.message });
    }
})

module.exports = router;