const mongoose = require('mongoose')
const logger = require("./logger")

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        logger.info(`MongoDB Conectat: ${conn.connection.host}`)
    } catch (error) {
        logger.error(`Eroare la conectare la MongoDB: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB