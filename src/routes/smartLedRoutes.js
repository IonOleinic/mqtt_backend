const express = require('express')
const smartLedRoutes = express.Router()
const { DeviceService } = require('../services/deviceService')

smartLedRoutes.post('/smartLed/power', async (req, res) => {
  let current_device = await DeviceService.getDeviceByID(req.query['device_id'])
  if (current_device) {
    current_device.sendChangePower(req.query['status'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/dimmer', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  if (currentDevice) {
    currentDevice.sendChangeDimmer(req.query['dimmer'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/color', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  if (currentDevice) {
    currentDevice.sendChangeColor(req.query['color'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/speed', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  if (currentDevice) {
    currentDevice.sendChangeSpeed(req.query['speed'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/scheme', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  if (currentDevice) {
    currentDevice.sendChangeScheme(req.query['scheme'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/palette', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  if (currentDevice) {
    currentDevice.sendChangePalette(req.query['palette'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})

module.exports = { smartLedRoutes }
