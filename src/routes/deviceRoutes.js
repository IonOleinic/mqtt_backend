const express = require('express')
const deviceRoutes = express.Router()
const deviceController = require('../controllers/deviceController')

deviceRoutes.post('/device', deviceController.createDevice)
deviceRoutes.put('/device/:id', deviceController.updateDevice)
deviceRoutes.get('/devices', deviceController.getDevices)
deviceRoutes.delete('/device/:id', deviceController.deleteDevice)
deviceRoutes.get('/device/:id', deviceController.getDevice)
deviceRoutes.get('/device/getInitState/:id', deviceController.getInitState)
deviceRoutes.get('/deviceTypes', deviceController.getDeviceTypes)
deviceRoutes.get('/mqttGroups', deviceController.getMqttGroups)

module.exports = { deviceRoutes }
