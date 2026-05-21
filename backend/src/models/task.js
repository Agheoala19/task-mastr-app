const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    titlu: {
        type: String,
        required: [true, 'Titlul este obligatoriu']
    },
    descriere: {
        type: String,
        required: [true, 'Descrierea este obligatorie']
    },
    imagine: {
        type: String,
        default: null
    },
    buget_estimativ: {
        type: Number,
        required: [true, 'Bugetul este obligatoriu']
    },
    data_limita: {
        type: Date
    },
    status_task: {
        type: String,
        enum: ['deschis', 'in desfasurare', 'finalizat', 'anulat'],
        default: 'deschis'
    },
    id_beneficiar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilizator',
        required: true
    },
    id_categorie: {
        type: String
    },
    id_oras: {
        type: String
    },
    id_prestator_selectat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilizator',
        default: null
    },
}, {
    timestamps: true
})

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);