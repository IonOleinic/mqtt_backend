const express = require('express')
const smartStripRoutes = express.Router()
const smartStripController = require('../controllers/smartStripController')

smartStripRoutes.post('/smartStrip', smartStripController.changePowerState)

module.exports = { smartStripRoutes }
