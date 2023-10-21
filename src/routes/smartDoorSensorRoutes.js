const express = require('express')
const smartDoorSensorRoutes = express.Router()
const { DeviceService } = require('../services/deviceService')

smartDoorSensorRoutes.post('/smartDoorSensor', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  if (currentDevice) {
    currentDevice.sendToggleReq()
  }
  res.json({ succes: true })
})

module.exports = { smartDoorSensorRoutes }
