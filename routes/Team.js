const FetchUser = require('../middleware/FetchUser');
const Team = require('../models/Team');
const router = require('express').Router();

router.post('/createTeam', FetchUser, async (req, res) => {
    const { name, members } = req.body;

    try {
        let tempMembers = JSON.parse(members);
        if (!name)
            return res.status(400).json({ success: false, message: 'Please add name.' });

        tempMembers.unshift(req.user);

        let team = await Team.create({ name, members: tempMembers, teamLeader: req.user });
        team = await Team.findById(team._id)
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        res.status(200).json({ success: true, team });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/addToTeam/:id', FetchUser, async (req, res) => {
    const { user } = req.body;

    try {
        const team = await Team.findByIdAndUpdate(req.params.id, { $push: { members: user } }, { new: true })
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        res.status(200).json({ success: true, team });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/removeFromTeam/:id', FetchUser, async (req, res) => {
    const { user } = req.body;

    try {
        const team = await Team.findByIdAndUpdate(req.params.id, { $pull: { members: user } }, { new: true })
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        res.status(200).json({ success: true, team });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put('/updateTeam/:id', FetchUser, async (req, res) => {
    const { name } = req.body;

    try {
        const team = await Team.findByIdAndUpdate(req.params.id, { name }, { new: true });
        res.status(200).json({ success: true, team });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/getTeams', FetchUser, async (req, res) => {
    try {
        const teams = await Team.find({ members: { _id: req.user._id } })
            .populate('members', '-password')
            .populate('teamLeader', '-password');

        res.status(200).json({ success: true, teams })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
})

module.exports = router;