const mqtt = require('mqtt')

const mqttHost = process.env.MQTT_HOST
const mqttPort = process.env.MQTT_PORT
const clientId = `mqtt_${Math.random().toString(20).slice(3)}`
const conectURL = `mqtt://${mqttHost}:${mqttPort}`
const mqttClient = mqtt.connect(conectURL, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'mqtt',
  password: 'tasmota',
  reconnectPeriod: 1000,
})
module.exports = { mqttClient }
