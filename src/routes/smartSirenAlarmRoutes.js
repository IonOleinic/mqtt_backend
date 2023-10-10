const express = require('express')
const smartSirenAlarmRoutes = express.Router()
const { mqttClient } = require('../mqttClient')
const { getObjectById } = require('../helpers')
const { getAllDevicesLocaly } = require('../localObjects')

smartSirenAlarmRoutes.post('/smartSirenAlarm/power', async (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  currentDevice.change_power_state(mqttClient, 1, req.query['status'])
  res.json({ succes: true })
})
smartSirenAlarmRoutes.post('/smartSirenAlarm/options', async (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  currentDevice.update_options(
    mqttClient,
    req.query['new_sound'],
    req.query['new_volume'],
    req.query['new_duration']
  )
  res.json({
    succes: true,
  })
})

module.exports = { smartSirenAlarmRoutes }
