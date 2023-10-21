const express = require('express')
const smartStripRoutes = express.Router()
const { DeviceService } = require('../services/deviceService')

smartStripRoutes.get('/smartStrip', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  if (currentDevice) {
    currentDevice.updateReq(req.query['req_topic'])
  }
  res.json(currentDevice)
})
smartStripRoutes.post('/smartStrip', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  if (currentDevice) {
    currentDevice.changePowerState(req.query['socket_nr'], req.query['status'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})

module.exports = { smartStripRoutes }
