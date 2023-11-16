const express = require('express')
const tokenRoutes = express()
const tokenController = require('../controllers/tokenController')

tokenRoutes.get('/refresh-token', tokenController.refreshToken)

module.exports = { tokenRoutes }
