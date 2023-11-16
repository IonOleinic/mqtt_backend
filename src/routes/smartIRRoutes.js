const express = require('express')
const smartIRRoutes = express.Router()
const smartIRController = require('../controllers/smartIRController')

smartIRRoutes.post('/smartIR', smartIRController.pressButton)
smartIRRoutes.post('/tempIR', smartIRController.createTempDevice)

module.exports = { smartIRRoutes }
