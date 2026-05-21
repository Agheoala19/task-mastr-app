const express = require('express')
const router = express.Router()
const { creareTask, getTasks } = require('../controllers/taskController')
const { protejeazaRuta } = require('../middlewares/authMiddleware')
const { finalizeazaTask, stergeTask, editeazaTask } = require("../controllers/taskController")
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

router.get('/', getTasks)

router.post('/', protejeazaRuta, upload.single('imagine'), creareTask)

router.put('/:id/finalizeaza', protejeazaRuta, finalizeazaTask);

router.delete('/:id', protejeazaRuta, stergeTask);

router.put('/:id', protejeazaRuta, upload.single('imagine'), editeazaTask);

module.exports = router