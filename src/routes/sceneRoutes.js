const express = require('express')
const sceneRoutes = express.Router()
const sceneController = require('../controllers/sceneController')

sceneRoutes.get('/scenes', sceneController.getScenes)
sceneRoutes.get('/scene/:id', sceneController.getScene)
sceneRoutes.post('/scene', sceneController.createScene)
sceneRoutes.put('/scene/:id', sceneController.updateScene)
sceneRoutes.delete('/scene/:id', sceneController.deleteScene)

module.exports = { sceneRoutes }
