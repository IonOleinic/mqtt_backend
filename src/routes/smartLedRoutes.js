const express = require('express')
const smartLedRoutes = express.Router()
const smartLedController = require('../controllers/smartLedController')

smartLedRoutes.post('/smartLed/power', smartLedController.changePower)
smartLedRoutes.post('/smartLed/dimmer', smartLedController.changeDimmer)
smartLedRoutes.post('/smartLed/color', smartLedController.changeColor)
smartLedRoutes.post('/smartLed/speed', smartLedController.changeSpeed)
smartLedRoutes.post('/smartLed/scheme', smartLedController.changeScheme)
smartLedRoutes.post('/smartLed/palette', smartLedController.changePalette)

module.exports = { smartLedRoutes }
