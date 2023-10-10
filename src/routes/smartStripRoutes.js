const express = require('express')
const smartStripRoutes = express.Router()
const { mqttClient } = require('../mqttClient')
const { getAllDevicesLocaly } = require('../localObjects')
const { getObjectById } = require('../helpers')

smartStripRoutes.get('/smartStrip', (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (currentDevice) {
    currentDevice.update_req(mqttClient, req.query['req_topic'])
  }
  res.json(currentDevice)
})
smartStripRoutes.post('/smartStrip', async (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (currentDevice) {
    currentDevice.change_power_state(
      mqttClient,
      req.query['socket_nr'],
      req.query['status']
    )
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})

module.exports = { smartStripRoutes }
