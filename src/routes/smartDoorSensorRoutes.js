const express = require('express')
const smartDoorSensorRoutes = express.Router()
const smartDoorSensorController = require('../controllers/smartDoorSensorController')

smartDoorSensorRoutes.post(
  '/smartDoorSensor',
  smartDoorSensorController.toggleDoor
)

module.exports = { smartDoorSensorRoutes }
