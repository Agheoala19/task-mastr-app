const mongoose = require('mongoose');

const utilizatorSchema = new mongoose.Schema({
    nume: {
        type: String,
        required: [true, 'Numele este obligatoriu']
    },
    prenume: {
        type: String,
        required: [true, 'Prenumele este obligatoriu']
    },
    email: {
        type: String,
        required: [true, 'Email-ul este obligatoriu'],
        unique: true
    },
    parola: {
        type: String,
        required: [true, 'Parola este obligatorie']
    },
    telefon: {
        type: String
    },
    poza_profil: {
        type: String,
        default: 'default.jpg'
    },
    descriere_profil: {
        type: String
    },
    rating_mediu: {
        type: Number,
        default: 0
    },
    status_cont: {
        type: String,
        enum: ['activ', 'suspendat'],
        default: 'activ'
    },
    id_rol: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rol'
    },
    rol: {
        type: String,
        enum: ['beneficiar', 'prestator'],
        default: 'beneficiar'
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Utilizator || mongoose.model('Utilizator', utilizatorSchema);