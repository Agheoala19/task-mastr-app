const Utilizator = require('../models/utilizator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const logger = require('../config/logger')

exports.inregistrare = async (req, res) => {
    try {
        const { nume, prenume, email, parola, telefon, rol } = req.body

        let utilizatorExistent = await Utilizator.findOne({ email })
        if (utilizatorExistent) {
            return res.status(400).json({ mesaj: 'Exista deja un cont cu acest email!' });
        }

        const salt = await bcrypt.genSalt(10);
        const parolaCriptata = await bcrypt.hash(parola, salt)

        const utilizatorNou = new Utilizator({
            nume,
            prenume,
            email,
            parola: parolaCriptata,
            telefon,
            rol
        })

        await utilizatorNou.save()
        logger.info(`Utilizator nou inregistrat: ${email}`)

        const token = jwt.sign(
            { id: utilizatorNou._id, rol: utilizatorNou.rol },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        )

        res.status(201).json({
            mesaj: "Cont creat cu succes!",
            token,
            utilizator: {
                id: utilizatorNou._id,
                nume: utilizatorNou.nume,
                email: utilizatorNou.email
            }
        })
    } catch (eroare) {
        logger.error(`Eroare la inregistrare: ${eroare.message}`)
        res.status(500).json({ mesaj: 'Eroare la server' })
    }
}

exports.logare = async (req, res) => {
    try {
        const { email, parola } = req.body

        const utilizator = await Utilizator.findOne({ email })
        if (!utilizator) {
            return res.status(400).json({ mesaj: 'Email sau parola incorecta!' })
        }

        const parolaCorecta = await bcrypt.compare(parola, utilizator.parola)
        if (!parolaCorecta) {
            return res.status(400).json({ mesaj: 'Email sau parola incorecta!' })
        }

        const token = jwt.sign(
            { id: utilizator._id, rol: utilizator.rol },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        )

        logger.info(`Utilizator logat cu succes: ${email}`)

        res.status(200).json({
            mesaj: 'Logare reusita!',
            token,
            utilizator: {
                id: utilizator._id,
                nume: utilizator.nume,
                email: utilizator.email
            }
        })
    } catch (eroare) {
        logger.error(`Eroare la logare: ${eroare.message}`)
        res.status(500).json({ mesaj: 'Eroare la server!' })
    }
}

exports.getProfilUtilizator = async (req, res) => {
    try {
        const utilizator = await Utilizator.findById(req.utilizator._id).select('-parola');
        res.status(200).json(utilizator);
    } catch (eroare) {
        res.status(500).json({ mesaj: 'Eroare la preluarea profilului.' });
    }
};