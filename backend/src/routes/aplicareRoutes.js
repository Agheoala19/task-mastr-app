const express = require('express');
const router = express.Router();
const { creareAplicare, getAplicariPentruTask, acceptaOferta } = require('../controllers/aplicareController');
const { protejeazaRuta } = require('../middlewares/authMiddleware');

router.post('/', protejeazaRuta, creareAplicare);

router.get('/task/:id_task', getAplicariPentruTask);

router.put('/:id_aplicare/accepta', protejeazaRuta, acceptaOferta);

module.exports = router;