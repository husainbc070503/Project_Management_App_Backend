const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
    },
    
    stage: {
        type: String,
        enum: ['todo', 'inProgress', 'completed'],
        default: 'todo',
    },

    dueDate: String,

}, { timestamps: true });

const Task = mongoose.model('task', TaskSchema);

module.exports = Task;