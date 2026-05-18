const express = require('express')
const router = express.Router()
const { creareTask, getTasks } = require('../controllers/taskController')
const { protejeazaRuta } = require('../middlewares/authMiddleware')
const { finalizeazaTask } = require("../controllers/taskController")

router.get('/', getTasks)

router.post('/', protejeazaRuta, creareTask)

router.put('/:id/finalizeaza', protejeazaRuta, finalizeazaTask);

module.exports = router