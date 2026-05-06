const express = require('express')
const router = express.Router()
const { creareTask, getTasks } = require('../controllers/taskController')
const { protejeazaRuta } = require('../middlewares/authMiddleware')

router.get('/', getTasks)

router.post('/', protejeazaRuta, creareTask)

module.exports = router