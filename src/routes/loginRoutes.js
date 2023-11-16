const express = require('express')
const loginRoutes = express.Router()
const loginController = require('../controllers/loginController')

loginRoutes.post('/login', loginController.login)

loginRoutes.get('/logout', loginController.logout)

module.exports = { loginRoutes }
