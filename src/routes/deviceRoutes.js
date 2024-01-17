const express = require('express')
const deviceRoutes = express.Router()
const deviceController = require('../controllers/deviceController')

deviceRoutes.get('/device/:id', deviceController.getDevice)
deviceRoutes.post('/device', deviceController.createDevice)
deviceRoutes.put('/device/:id', deviceController.updateDevice)
deviceRoutes.post('/recover-device/:id', deviceController.recoverDevice)
deviceRoutes.delete('/device/:id', deviceController.deleteDevice)
deviceRoutes.delete('/destroy-device/:id', deviceController.destroyDevice)
deviceRoutes.delete(
  '/destroy-all-devices-recycle',
  deviceController.destroyAllDevicesRecycle
)
deviceRoutes.get('/devices', deviceController.getDevices)
deviceRoutes.get('/deleted-devices', deviceController.getDeletedDevices)
deviceRoutes.get('/load-device-cache', deviceController.loadDeviceCache)
deviceRoutes.get('/device/getInitState/:id', deviceController.getInitState)
deviceRoutes.get('/deviceTypes', deviceController.getDeviceTypes)
deviceRoutes.get('/mqttGroups', deviceController.getMqttGroups)

module.exports = { deviceRoutes }
