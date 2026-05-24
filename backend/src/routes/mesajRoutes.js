const express = require('express')
const router = express.Router()
const mesajController = require('../controllers/mesajController')
const { protejeazaRuta } = require('../middlewares/authMiddleware')

router.post('/', protejeazaRuta, mesajController.trimiteMesaj)
router.get('/conversatii', protejeazaRuta, mesajController.getConversatiiGlobale)
router.get('/task/:id_task', protejeazaRuta, mesajController.getMesajeTask)
router.put('/citite/:id_task', protejeazaRuta, mesajController.marcheazaCititeTask)

module.exports = router