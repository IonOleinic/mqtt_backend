const mqtt = require('mqtt')

const clientId = `mqtt_${Math.random().toString(20).slice(3)}`
const conectURL = `mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`
const mqttClient = mqtt.connect(conectURL, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'mqtt',
  password: 'tasmota',
  reconnectPeriod: 1000,
})

module.exports = { mqttClient }
