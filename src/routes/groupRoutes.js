const express = require('express')
const groupRoutes = express.Router()
const groupController = require('../controllers/groupController')

groupRoutes.get('/groups', groupController.getGroups)
groupRoutes.get('/group/:id', groupController.getGroup)
groupRoutes.post('/group', groupController.createGroup)
groupRoutes.put('/group/:id', groupController.updateGroup)
groupRoutes.delete('/group/:id', groupController.deleteGroup)

module.exports = { groupRoutes }
