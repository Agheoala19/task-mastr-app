const express = require('express')
const router = express.Router()
const { inregistrare, logare } = require('../controllers/authController')

router.post('/inregistrare', inregistrare)

router.post('/logare', logare)

module.exports = router

