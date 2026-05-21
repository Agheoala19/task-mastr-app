const mongoose = require('mongoose');

const notificareSchema = new mongoose.Schema({
    id_utilizator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilizator',
        required: true
    },
    mesaj: {
        type: String,
        required: true
    },
    citita: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.models.Notificare || mongoose.model('Notificare', notificareSchema);