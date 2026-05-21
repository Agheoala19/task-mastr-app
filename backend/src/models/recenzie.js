const mongoose = require('mongoose');

const recenzieSchema = new mongoose.Schema({
    id_task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    id_beneficiar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilizator',
        required: true
    },
    id_prestator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilizator',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comentariu: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.models.Recenzie || mongoose.model('Recenzie', recenzieSchema);