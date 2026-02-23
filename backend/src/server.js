const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
const logger = require('./config/logger')

dotenv.config()

const app = express()

app.use(cors())

app.use(express.json())

app.use(morgan('dev', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}))

app.get('/api/status', (req, res) => {
    logger.info('Cineva a accesat ruta de status.')
    res.status(200).json({
        mesaj: 'Serverul functioneaza',
        arhitectura: '3-tier MVC'
    })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    logger.info(`Server pornit pe portul ${PORT}`)
})