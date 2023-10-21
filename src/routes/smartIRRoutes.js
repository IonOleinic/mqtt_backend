const express = require('express')
const smartIRRoutes = express.Router()
const { mqttClient } = require('../mqttClient')
const { subscribeToTopic } = require('../helpers')
const TempIR = require('../devices/tempIR.js')
const { DeviceService } = require('../services/deviceService')
let tempIR

smartIRRoutes.post('/smartIR', async (req, res) => {
  let currentDevice = await DeviceService.getDeviceByID(req.query['device_id'])
  if (currentDevice) {
    try {
      currentDevice.pressButton(req.query['btn_code'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
})
smartIRRoutes.post('/tempIR', (req, res) => {
  try {
    tempIR = new TempIR(req.query['manufacter'], req.query['mqtt_name'])
    DeviceService.insertTempDevice(tempIR)
    subscribeToTopic(mqttClient, tempIR.receive_topic)
  } catch (error) {
    console.log(error)
    res.json({ Succes: false })
  }
  res.json({ Succes: true })
})

module.exports = { smartIRRoutes }
