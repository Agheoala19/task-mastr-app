const express = require('express')
const router = express.Router()
const { inregistrare, logare, getProfilUtilizator, actualizareProfil } = require('../controllers/authController')
const { protejeazaRuta } = require('../middlewares/authMiddleware')

const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadDir); },
    filename: function (req, file, cb) {
        cb(null, 'avatar-' + Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
    }
})
const upload = multer({ storage: storage })

router.post('/inregistrare', inregistrare)

router.post('/logare', logare)

router.get('/me', protejeazaRuta, getProfilUtilizator);

router.put('/me', protejeazaRuta, upload.single('avatar'), actualizareProfil);

module.exports = router

