const express = require('express')
const smartSirenAlarmRoutes = express.Router()
const { DeviceService } = require('../services/deviceService')

smartSirenAlarmRoutes.post('/smartSirenAlarm/power', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  currentDevice.changePowerState(1, req.query['status'])
  res.json({ succes: true })
})
smartSirenAlarmRoutes.post('/smartSirenAlarm/options', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  currentDevice.updateOptions(
    req.query['new_sound'],
    req.query['new_volume'],
    req.query['new_duration']
  )
  res.json({
    succes: true,
  })
})

module.exports = { smartSirenAlarmRoutes }
