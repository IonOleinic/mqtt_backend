const express = require('express')
const loginRoutes = express.Router()
const loginController = require('../controllers/loginController')

loginRoutes.post('/register', loginController.register)
loginRoutes.post('/login', loginController.login)
loginRoutes.get('/logout', loginController.logout)

module.exports = { loginRoutes }
