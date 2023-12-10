const mqttController = require('../controllers/mqttController')
const { mqttClient } = require('./mqttClient')

const initMqttClient = () => {
  mqttClient.on('connect', mqttController.onConnect)
  mqttClient.on('close', mqttController.onClose)
  mqttClient.on('error', mqttController.onError)
  mqttClient.on('message', mqttController.onMessage)
}

module.exports = { initMqttClient }
