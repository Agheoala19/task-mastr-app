const Mesaj = require('../models/Mesaj');
const Task = require('../models/Task');

exports.trimiteMesaj = async (req, res) => {
    try {
        const { id_task, id_destinatar, continut } = req.body;
        if (!continut || continut.trim() === '') return res.status(400).json({ mesaj: 'Mesajul nu poate fi gol.' });

        const mesajNou = new Mesaj({ id_task, id_expeditor: req.utilizator._id, id_destinatar, continut });
        await mesajNou.save();
        res.status(201).json(mesajNou);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la trimiterea mesajului.', eroare: eroare.message });
    }
};

exports.getMesajeTask = async (req, res) => {
    try {
        const { id_task } = req.params;
        const mesaje = await Mesaj.find({ id_task }).populate('id_expeditor', 'nume prenume').sort({ createdAt: 1 });
        res.status(200).json(mesaje);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la preluarea mesajelor.', eroare: eroare.message });
    }
};


exports.getConversatiiGlobale = async (req, res) => {
    try {
        const userId = req.utilizator._id;

        const taskuri = await Task.find({
            $or: [{ id_beneficiar: userId }, { id_prestator_selectat: userId }],
            status_task: { $in: ['in desfasurare', 'finalizat'] }
        }).populate('id_beneficiar id_prestator_selectat', 'nume prenume');

        const conversatii = [];

        for (let task of taskuri) {
            const esteBeneficiar = task.id_beneficiar._id.toString() === userId.toString();
            const partener = esteBeneficiar ? task.id_prestator_selectat : task.id_beneficiar;

            if (!partener) continue;

            const necitite = await Mesaj.countDocuments({
                id_task: task._id,
                id_destinatar: userId,
                citit: false
            });

            conversatii.push({ task, partener, necitite });
        }

        res.status(200).json(conversatii);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la preluarea conversatiilor.', eroare: eroare.message });
    }
};

exports.marcheazaCititeTask = async (req, res) => {
    try {
        const { id_task } = req.params;
        await Mesaj.updateMany(
            { id_task, id_destinatar: req.utilizator._id, citit: false },
            { $set: { citit: true } }
        );
        res.status(200).json({ mesaj: 'Marcate ca citite' });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare', eroare: eroare.message });
    }
};