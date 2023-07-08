const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    start: String,
    end: String,

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    isTeamProject: {
        type: Boolean,
        default: false,
    },

    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'team',
    }

}, { timestamps: true });

const Project = mongoose.model('project', ProjectSchema);

module.exports = Project;