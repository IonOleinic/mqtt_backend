const express = require('express')
const smartSwitchRoutes = express.Router()
const smartSwitchController = require('../controllers/smartSwitchController')

smartSwitchRoutes.post('/smartSwitch', smartSwitchController.changePowerState)

module.exports = { smartSwitchRoutes }
