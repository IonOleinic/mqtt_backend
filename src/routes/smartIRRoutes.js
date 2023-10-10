const express = require('express')
const smartIRRoutes = express.Router()
const { mqttClient } = require('../mqttClient')
const { getObjectById, subscribeToTopic } = require('../helpers')
const TempIR = require('../devices/tempIR.js')
const {
  getAllDevicesLocaly,
  updateAllTempDevices,
  getAllTempDevices,
} = require('../localObjects')
let tempIR

smartIRRoutes.post('/smartIR', (req, res) => {
  let currentDevice = getObjectById(
    getAllDevicesLocaly(),
    req.query['device_id']
  )
  if (currentDevice) {
    try {
      currentDevice.pressButton(mqttClient, req.query['btn_code'])
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
    let tempDevices = getAllTempDevices()
    tempDevices.push(tempIR)
    subscribeToTopic(mqttClient, tempIR.receive_topic)
    updateAllTempDevices(tempDevices)
  } catch (error) {
    console.log(error)
    res.json({ Succes: false })
  }
  res.json({ Succes: true })
})

module.exports = { smartIRRoutes }
