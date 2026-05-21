const express = require('express');
const router = express.Router();
const notificareController = require('../controllers/notificareController');
const { protejeazaRuta } = require('../middlewares/authMiddleware');

router.get('/', protejeazaRuta, notificareController.getNotificari);
router.put('/citite', protejeazaRuta, notificareController.marcheazaCitite);

module.exports = router;