const express = require('express')
const deviceRoutes = express.Router()
const deviceController = require('../controllers/deviceController')

deviceRoutes.get('/device/:id', deviceController.getDevice)
deviceRoutes.post('/device', deviceController.createDevice)
deviceRoutes.put('/device/:id', deviceController.updateDevice)
deviceRoutes.delete('/device/:id', deviceController.deleteDevice)
deviceRoutes.post('/recover-device/:id', deviceController.recoverDevice)
deviceRoutes.delete('/recover-all-devices', deviceController.recoverAllDevices)
deviceRoutes.delete('/destroy-device/:id', deviceController.destroyDevice)
deviceRoutes.delete('/destroy-all-devices', deviceController.destroyAllDevices)
deviceRoutes.get('/devices', deviceController.getDevices)
deviceRoutes.get(
  '/devices/scene-involved',
  deviceController.getSceneInvolvedDevices
)
deviceRoutes.get('/deleted-devices', deviceController.getDeletedDevices)
deviceRoutes.get('/load-device-cache', deviceController.loadDeviceCache)
deviceRoutes.get('/device/get-init-state/:id', deviceController.getInitState)
deviceRoutes.get('/device-types', deviceController.getDeviceTypes)

module.exports = { deviceRoutes }
