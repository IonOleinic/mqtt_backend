const express = require('express')
const smartSirenAlarmRoutes = express.Router()
const smartSirenAlarmController = require('../controllers/smartSirenAlarmController')

smartSirenAlarmRoutes.post(
  '/smartSirenAlarm/power',
  smartSirenAlarmController.changePowerState
)
smartSirenAlarmRoutes.post(
  '/smartSirenAlarm/options',
  smartSirenAlarmController.updateOptions
)

module.exports = { smartSirenAlarmRoutes }
