const jwt = require('jsonwebtoken')
const Utilizator = require('../models/Utilizator')

const protejeazaRuta = async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decodat = jwt.verify(token, process.env.JWT_SECRET)

            req.utilizator = await Utilizator.findById(decodat.id).select('-parola')

            next()
        } catch (eroare) {
            return res.status(401).json({ mesaj: 'Neautorizat, token invalid sau expirat!' })
        }
    }

    if (!token) {
        return res.status(401).json({ mesaj: 'Neautorizat, nu ai furnizat niciun token!' })
    }
}

module.exports = { protejeazaRuta }