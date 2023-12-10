require('dotenv').config()
const server = require('./servers/httpServer')
const db = require('../database/sequelizeInstance')
const { initMqttClient } = require('./mqtt/mqttFunctions')

initMqttClient()

db.sequelize.sync().then((req) => {
  server.listen(process.env.SERVER_PORT, () => {
    console.log(`Server listening on port ${process.env.SERVER_PORT}...`)
  })
})
