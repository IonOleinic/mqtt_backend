const express = require('express')
const userRoutes = express.Router()
const { UserService } = require('../services/userService')

userRoutes.get('/users', async (req, res) => {
  let users = await UserService.getAllUsers()
  res.json(users)
})
userRoutes.get('/user/:id', async (req, res) => {
  try {
    let currentUser = await UserService.getUserByID(req.params['id'])
    if (currentUser) {
      res.json(currentUser)
    } else {
      res.json({ succes: false, msg: "User doesn't exist" })
    }
  } catch (error) {
    res.json({ succes: false, msg: 'Server Error' })
  }
})
userRoutes.get('/user', async (req, res) => {
  try {
    let currentUser = await UserService.getUserByEmail(req.query['email'])
    if (currentUser) {
      res.json(currentUser)
    } else {
      res.json({ succes: false, msg: "User doesn't exist" })
    }
  } catch (error) {
    res.json({ succes: false, msg: 'Server Error' })
  }
})

userRoutes.post('/user', async (req, res) => {
  let userData = req.body
  try {
    await UserService.insertUser(userData)
    res.json({ succes: true })
  } catch (error) {
    console.log(error)
    res.json({ succes: false })
  }
})
userRoutes.put('/user/:id', async (req, res) => {
  try {
    let updatedUser = await UserService.updateUser(req.params['id'], req.body)
    res.json(updatedUser)
  } catch (error) {
    console.log(error)
    let currentUser = await UserService.getUserByID(req.params['id'])
    res.json(currentUser)
  }
})
userRoutes.delete('/user/:id', async (req, res) => {
  try {
    let users = await UserService.deleteUser(req.params['id'])
    res.json(users)
  } catch (error) {
    console.log(error)
    let users = await UserService.getAllUsers()
    res.json(users)
  }
})

module.exports = { userRoutes }
