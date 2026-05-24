const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan')
const logger = require('./config/logger')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const aplicareRoutes = require('./routes/aplicareRoutes')
const notificareRoutes = require('./routes/notificareRoutes')
const mesajRoutes = require('./routes/mesajRoutes')
const path = require('path')

dotenv.config()

connectDB()

const app = express()

app.use(cors())

app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(morgan('dev', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}))

app.use('/api/auth', authRoutes)
app.use('/api/taskuri', taskRoutes)
app.use('/api/aplicari', aplicareRoutes);
app.use('/api/notificari', notificareRoutes)
app.use('/api/mesaje', mesajRoutes)

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