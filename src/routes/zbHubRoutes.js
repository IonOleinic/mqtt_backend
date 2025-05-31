const express = require('express')
const zbHubRoutes = express.Router()
const zbHubController = require('../controllers/zbHubController')

zbHubRoutes.post('/zbHub/pairing-mode', zbHubController.changePairingMode)
zbHubRoutes.delete('/zbHub/device', zbHubController.destroyDevice)

module.exports = { zbHubRoutes }
