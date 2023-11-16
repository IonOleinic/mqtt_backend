const express = require('express')
const userRoutes = express.Router()
const userController = require('../controllers/userController')

userRoutes.get('/users', userController.getUsers)
userRoutes.get('/user/:id', userController.getUser)
userRoutes.get('/user', userController.getUserByEmail)
userRoutes.post('/user', userController.createUser)
userRoutes.put('/user/:id', userController.updateUser)
userRoutes.delete('/user/:id', userController.deleteUser)

module.exports = { userRoutes }
