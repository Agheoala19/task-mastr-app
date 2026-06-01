const express = require('express');
const router = express.Router();
const Utilizator = require('../models/Utilizator');
const Task = require('../models/Task');
const { protejeazaRuta } = require('../middlewares/authMiddleware');

const isAdmin = (req, res, next) => {
    if (req.utilizator.rol !== 'administrator') {
        return res.status(403).json({ mesaj: 'Acces interzis. Doar administratorii pot accesa această resursă.' });
    }
    next();
};

router.get('/utilizatori', protejeazaRuta, isAdmin, async (req, res) => {
    try {
        const utilizatori = await Utilizator.find().select('-parola').sort({ createdAt: -1 });
        res.json(utilizatori);
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare la preluarea utilizatorilor.' });
    }
});

router.delete('/utilizatori/:id', protejeazaRuta, isAdmin, async (req, res) => {
    try {
        await Utilizator.findByIdAndDelete(req.params.id);
        res.json({ mesaj: 'Utilizator șters cu succes.' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Eroare la ștergerea utilizatorului.' });
    }
});

module.exports = router;