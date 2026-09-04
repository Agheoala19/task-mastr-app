const Notificare = require('../models/notificare');

exports.getNotificari = async (req, res) => {
    try {
        const notificari = await Notificare.find({ id_utilizator: req.utilizator._id }).sort({ createdAt: -1 });
        res.status(200).json(notificari);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la preluarea notificarilor.', eroare: eroare.message });
    }
};

exports.marcheazaCitite = async (req, res) => {
    try {
        await Notificare.updateMany(
            { id_utilizator: req.utilizator._id, citita: false },
            { $set: { citita: true } }
        );
        res.status(200).json({ mesaj: 'Notificarile au fost marcate ca citite.' });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la actualizarea notificarilor.', eroare: eroare.message });
    }
};
