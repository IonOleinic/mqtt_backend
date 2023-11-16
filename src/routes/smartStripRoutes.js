const express = require('express')
const smartStripRoutes = express.Router()
const smartStripController = require('../controllers/smartStripController')

smartStripRoutes.get('/smartStrip', smartStripController.updateReq)
smartStripRoutes.post('/smartStrip', smartStripController.changePowerState)

module.exports = { smartStripRoutes }
