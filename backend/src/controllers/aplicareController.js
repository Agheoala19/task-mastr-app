const Aplicare = require('../models/Aplicare');
const Task = require('../models/Task');
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

        const aplicari = await Aplicare.find({ id_task }).populate('id_prestator', 'nume prenume telefon email');

        res.status(200).json(aplicari);
    } catch (eroare) {
        logger.error(`Eroare la preluarea aplicărilor: ${eroare.message}`);
        res.status(500).json({ mesaj: 'Eroare la server' });
    }
};

exports.acceptaOferta = async (req, res) => {
    try {
        const { id_aplicare } = req.params;

        const aplicare = await Aplicare.findById(id_aplicare);
        if (!aplicare) {
            return res.status(404).json({ mesaj: 'Oferta nu a fost gasita!' });
        }

        const task = await Task.findById(aplicare.id_task);
        if (!task) {
            return res.status(404).json({ mesaj: 'Task-ul nu mai exista!' });
        }

        if (task.id_beneficiar.toString() !== req.utilizator._id.toString()) {
            return res.status(403).json({ mesaj: 'Eroare: Doar proprietarul anuntului poate accepta oferte!' });
        }

        task.status_task = 'in desfasurare';
        task.id_prestator_selectat = aplicare.id_prestator;
        await task.save();

        aplicare.status_aplicare = 'acceptat';
        await aplicare.save();

        await Aplicare.updateMany(
            { id_task: task._id, _id: { $ne: id_aplicare } },
            { $set: { status_aplicare: 'respins' } }
        );

        logger.info(`Oferta ${id_aplicare} a fost acceptata pentru task-ul ${task._id}`);
        res.status(200).json({ mesaj: 'Oferta a fost acceptata cu succes!', task });

    } catch (eroare) {
        logger.error(`Eroare la acceptarea ofertei: ${eroare.message}`);
        res.status(500).json({ mesaj: 'Eroare la server' });
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