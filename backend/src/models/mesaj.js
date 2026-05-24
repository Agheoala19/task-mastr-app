const mongoose = require('mongoose')

const mesajSchema = new mongoose.Schema({
    id_task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    id_expeditor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilizator',
        required: true
    },
    id_destinatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilizator',
        required: true
    },
    continut: {
        type: String,
        required: true
    },
    citit: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.models.Mesaj || mongoose.model('Mesaj', mesajSchema);