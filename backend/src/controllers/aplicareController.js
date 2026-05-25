const Aplicare = require('../models/Aplicare');
const Task = require('../models/Task');
const Notificare = require('../models/Notificare');
const logger = require('../config/logger');

exports.creareAplicare = async (req, res) => {
    try {
        const { id_task, mesaj_oferta, pret_propus } = req.body;

        const task = await Task.findById(id_task);
        if (!task) {
            return res.status(404).json({ mesaj: 'Task-ul nu a fost găsit!' });
        }

        const aplicareExistenta = await Aplicare.findOne({
            id_task: id_task,
            id_prestator: req.utilizator._id
        });

        if (aplicareExistenta) {
            return res.status(400).json({ mesaj: 'Ai aplicat deja la acest task!' });
        }

        const aplicareNoua = new Aplicare({
            id_task,
            id_prestator: req.utilizator._id,
            mesaj_oferta,
            pret_propus
        });

        const aplicareSalvata = await aplicareNoua.save();

        const notificareNoua = new Notificare({
            id_utilizator: task.id_beneficiar,
            id_task: task._id,
            mesaj: `Ai primit o oferta noua de la un mester pentru anuntul "${task.titlu}".`
        });
        await notificareNoua.save();
        logger.info(`Aplicare nouă de la ${req.utilizator.email} pentru task-ul ${id_task}`);

        res.status(201).json({ mesaj: 'Ai aplicat cu succes!', aplicare: aplicareSalvata });
    } catch (eroare) {
        logger.error(`Eroare la aplicare: ${eroare.message}`);
        res.status(500).json({ mesaj: 'Eroare la server' });
    }
};

exports.getAplicariPentruTask = async (req, res) => {
    try {
        const { id_task } = req.params;

        const aplicari = await Aplicare.find({ id_task }).populate('id_prestator', 'nume prenume telefon email rating_mediu');

        res.status(200).json(aplicari);
    } catch (eroare) {
        logger.error(`Eroare la preluarea aplicărilor: ${eroare.message}`);
        res.status(500).json({ mesaj: 'Eroare la server' });
    }
};

exports.acceptaOferta = async (req, res) => {
    try {
        const aplicare = await Aplicare.findById(req.params.id_aplicare);

        if (!aplicare) return res.status(404).json({ mesaj: 'Oferta nu a fost gasita.' });

        const task = await Task.findById(aplicare.id_task);
        if (task.id_beneficiar.toString() !== req.utilizator._id.toString()) {
            return res.status(403).json({ mesaj: 'Nu ai permisiunea de a accepta oferte pentru acest anunt.' });
        }

        aplicare.status_aplicare = 'acceptat';
        await aplicare.save();

        await Aplicare.updateMany(
            { id_task: task._id, _id: { $ne: aplicare._id } },
            { $set: { status_aplicare: 'respins' } }
        );

        task.status_task = 'in desfasurare';
        task.id_prestator_selectat = aplicare.id_prestator;
        await task.save();

        const Notificare = require('../models/Notificare');
        const notificareNoua = new Notificare({
            id_utilizator: aplicare.id_prestator,
            id_task: task._id,
            mesaj: `Felicitari! Oferta ta pentru anuntul "${task.titlu}" a fost acceptata. Poti incepe lucrarea.`
        });
        await notificareNoua.save();

        res.status(200).json({ mesaj: 'Oferta acceptata. Restul au fost respinse automat.' });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la acceptarea ofertei.', eroare: eroare.message });
    }
};

exports.getAplicariPrestator = async (req, res) => {
    try {
        const aplicari = await Aplicare.find({ id_prestator: req.utilizator._id }).populate('id_task', 'titlu descriere status_task');
        res.status(200).json(aplicari);
    } catch (eroare) {
        logger.error(`Eroare la preluarea aplicarilor prestatorului: ${eroare.message}`);
        res.status(500).json({ mesaj: 'Eroare la server' });
    }
};