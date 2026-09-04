const Task = require('../models/task')
const logger = require('../config/logger')
const Utilizator = require('../models/utilizator')
const Recenzie = require('../models/recenzie')
const Notificare = require('../models/notificare')
const Aplicare = require('../models/aplicare')

exports.creareTask = async (req, res) => {
    try {
        const { titlu, descriere, buget_estimativ, data_limita, locatie } = req.body

        let imaginePath = null;
        if (req.file) {
            imaginePath = '/uploads/' + req.file.filename;
        }

        const taskNou = new Task({
            titlu,
            descriere,
            buget_estimativ,
            data_limita,
            locatie,
            id_beneficiar: req.utilizator._id,
            imagine: imaginePath
        })

        const taskSalvat = await taskNou.save()
        logger.info(`Task nou creat: ${titlu} de catre utilizatorul ${req.utilizator.email}`)

        res.status(201).json(taskSalvat)
    } catch (eroare) {
        logger.error(`Eroare la crearea task-ului: ${eroare.message}`)
        res.status(500).json({ mesaj: 'Eroare la server' })
    }
}

exports.getTasks = async (req, res) => {
    try {
        const taskuri = await Task.find().populate('id_beneficiar', 'nume prenume email')
        res.status(200).json(taskuri)
    } catch (eroare) {
        logger.error(`Eroare la preluarea task-urilor: ${eroare.message}`)
        res.status(500).json({ mesaj: 'Eroare la server' })
    }
}

exports.stergeTask = async (req, res) => {
    try {
        const idTask = req.params.id;

        const task = await Task.findById(idTask);
        if (!task) {
            return res.status(404).json({ mesaj: 'Anuntul nu a fost gasit.' });
        }

        if (task.id_beneficiar.toString() !== req.utilizator._id.toString() && req.utilizator.rol !== 'administrator') {
            return res.status(403).json({ mesaj: 'Nu ai permisiunea de a sterge acest anunt.' });
        }

        await Task.findByIdAndDelete(idTask);

        await Aplicare.deleteMany({ id_task: idTask });

        res.status(200).json({ mesaj: 'Anuntul si toate ofertele asociate au fost sterse cu succes!' });
    } catch (eroare) {
        console.error("Eroare la stergere task:", eroare);
        res.status(500).json({ mesaj: 'Eroare la stergerea anuntului.', eroare: eroare.message });
    }
};

exports.editeazaTask = async (req, res) => {
    try {
        const idTask = req.params.id;
        const { titlu, descriere, buget_estimativ, locatie } = req.body;

        const task = await Task.findById(idTask);
        if (!task) {
            return res.status(404).json({ mesaj: 'Task-ul nu a fost gasit.' });
        }

        if (task.id_beneficiar.toString() !== req.utilizator._id.toString()) {
            return res.status(403).json({ mesaj: 'Nu ai permisiunea de a edita acest anunt.' });
        }

        if (task.status_task !== 'deschis') {
            return res.status(400).json({ mesaj: 'Doar anunturile deschise pot fi editate.' });
        }

        task.titlu = titlu || task.titlu;
        task.descriere = descriere || task.descriere;
        task.buget_estimativ = buget_estimativ || task.buget_estimativ;
        task.locatie = locatie || task.locatie;

        if (req.file) {
            task.imagine = '/uploads/' + req.file.filename;
        }

        await task.save();
        res.status(200).json({ mesaj: 'Anunt actualizat cu succes!', task });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la editarea task-ului.', eroare: eroare.message });
    }
};

exports.finalizeazaTask = async (req, res) => {
    try {
        const idTask = req.params.id;
        const { rating, comentariu } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ mesaj: "Te rugam sa introduci o nota intre 1 si 5." });
        }

        const task = await Task.findById(idTask);
        if (!task) {
            return res.status(404).json({ mesaj: "Task-ul nu a fost gasit." });
        }

        if (task.id_beneficiar.toString() !== req.utilizator._id.toString()) {
            return res.status(403).json({ mesaj: "Doar proprietarul poate finaliza task-ul." });
        }

        if (!task.id_prestator_selectat) {
            return res.status(400).json({ mesaj: "Nu poti finaliza un task care nu are un mester acceptat." });
        }

        task.status_task = 'finalizat';
        await task.save();

        const recenzieNoua = new Recenzie({
            id_task: task._id,
            id_beneficiar: task.id_beneficiar,
            id_prestator: task.id_prestator_selectat,
            rating: Number(rating),
            comentariu: comentariu
        });
        await recenzieNoua.save();

        const toateRecenziile = await Recenzie.find({ id_prestator: task.id_prestator_selectat });
        const sumaRating = toateRecenziile.reduce((acc, rec) => acc + rec.rating, 0);
        const medieNoua = sumaRating / toateRecenziile.length;

        await Utilizator.findByIdAndUpdate(task.id_prestator_selectat, {
            rating_mediu: medieNoua.toFixed(1)
        });

        const notificareNoua = new Notificare({
            id_utilizator: task.id_prestator_selectat,
            id_task: task._id,
            mesaj: `Clientul a finalizat task-ul "${task.titlu}" si ti-a acordat o nota de ${rating} stele.`
        })
        await notificareNoua.save();

        res.status(200).json({ mesaj: "Task finalizat si recenzie salvata!", medie: medieNoua });
    } catch (eroare) {
        res.status(500).json({ mesaj: "Eroare la finalizare.", eroare: eroare.message });
    }
};

exports.getTaskuriPaginate = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const totalAnunturi = await Task.countDocuments({ status_task: 'deschis' });
        const totalPages = Math.ceil(totalAnunturi / limit);

        const taskuri = await Task.find({ status_task: 'deschis' })
            .populate('id_beneficiar', 'nume prenume avatar rating_mediu')
            .sort({ createdAt: -1 }) // Cele mai noi primele
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            taskuri,
            totalPages,
            currentPage: page
        });
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la preluarea anunturilor.', eroare: eroare.message });
    }
};
