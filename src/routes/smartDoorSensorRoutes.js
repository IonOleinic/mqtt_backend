const express = require('express')
const smartDoorSensorRoutes = express.Router()
const { mqttClient } = require('../mqttClient')
const { getObjectById } = require('../helpers')
const { getAllDevicesLocaly } = require('../localObjects')

smartDoorSensorRoutes.post('/smartDoorSensor', (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (currentDevice) {
    currentDevice.send_toggle_req(mqttClient)
  }
  res.json({ succes: true })
})

module.exports = { smartDoorSensorRoutes }
