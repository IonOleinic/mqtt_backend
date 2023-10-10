const express = require('express')
const smartLedRoutes = express.Router()
const { mqttClient } = require('../mqttClient')
const { getObjectById } = require('../helpers')
const { getAllDevicesLocaly } = require('../localObjects')

smartLedRoutes.post('/smartLed/power', (req, res) => {
  let current_device = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (current_device) {
    current_device.send_change_power(mqttClient, req.query['status'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/dimmer', (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (currentDevice) {
    currentDevice.send_change_dimmer(mqttClient, req.query['dimmer'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/color', (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (currentDevice) {
    currentDevice.send_change_color(mqttClient, req.query['color'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/speed', (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (currentDevice) {
    currentDevice.send_change_speed(mqttClient, req.query['speed'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/scheme', (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (currentDevice) {
    currentDevice.send_change_scheme(mqttClient, req.query['scheme'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
smartLedRoutes.post('/smartLed/palette', (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (currentDevice) {
    currentDevice.send_change_palette(mqttClient, req.query['palette'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})

module.exports = { smartLedRoutes }
