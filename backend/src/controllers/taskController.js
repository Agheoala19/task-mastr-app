const Task = require('../models/Task')
const logger = require('../config/logger')

exports.creareTask = async (req, res) => {
    try {
        const { titlu, descriere, buget_estimativ, data_limita, id_categorie, id_oras } = req.body

        const taskNou = new Task({
            titlu,
            descriere,
            buget_estimativ,
            data_limita,
            id_categorie,
            id_oras,
            id_beneficiar: req.utilizator._id
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