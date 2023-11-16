const { UserService } = require('../services/userService')

class UserController {
  async getUsers(req, res) {
    let users = await UserService.getAllUsers()
    res.json(users)
  }
  async getUser(req, res) {
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
  }
  async getUserByEmail(req, res) {
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
  }
  async createUser(req, res) {
    let userData = req.body
    try {
      await UserService.insertUser(userData)
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
  async updateUser(req, res) {
    try {
      let updatedUser = await UserService.updateUser(req.params['id'], req.body)
      res.json(updatedUser)
    } catch (error) {
      console.log(error)
      let currentUser = await UserService.getUserByID(req.params['id'])
      res.json(currentUser)
    }
  }
  async deleteUser(req, res) {
    try {
      let users = await UserService.deleteUser(req.params['id'])
      res.json(users)
    } catch (error) {
      console.log(error)
      let users = await UserService.getAllUsers()
      res.json(users)
    }
  }
}

module.exports = new UserController()
