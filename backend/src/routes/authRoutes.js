const express = require('express')
const router = express.Router()
const { inregistrare, logare, getProfilUtilizator } = require('../controllers/authController')
const { protejeazaRuta } = require('../middlewares/authMiddleware');

router.post('/inregistrare', inregistrare)

router.post('/logare', logare)

router.get('/me', protejeazaRuta, getProfilUtilizator);

module.exports = router

