const mongoose = require('mongoose')

const aplicareSchema = new mongoose.Schema({
    id_task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    id_prestator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilizator',
        required: true
    },
    mesaj_oferta: {
        type: String,
        required: [true, 'Mesajul ofertei este obligatoriu']
    },
    pret_propus: {
        type: Number,
        required: [true, 'Pretul propus este obligatoriu']
    },
    status_aplicare: {
        type: String,
        enum: ['in așteptare', 'acceptat', 'respins'],
        default: 'in așteptare'
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Aplicare || mongoose.model('Aplicare', aplicareSchema);