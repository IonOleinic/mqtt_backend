const { UserService } = require('../services/userService')
const { mapUserToViewModel } = require('../mappers/userMapper')
class UserController {
  async getUsers(req, res) {
    try {
      let users = await UserService.getAllUsers()
      res.json(
        users.map((user) => {
          mapUserToViewModel(user)
        })
      )
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Error occured!' })
    }
  }
  async getUser(req, res) {
    try {
      let currentUser = await UserService.getUserById(req.params['id'])
      if (currentUser) {
        res.json(mapUserToViewModel(currentUser))
      } else {
        res.status(404).json({ msg: "User doesn't exist" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Error occured!' })
    }
  }
  async getUserByEmail(req, res) {
    try {
      let currentUser = await UserService.getUserByEmail(req.query['email'])
      if (currentUser) {
        res.json(mapUserToViewModel(currentUser))
      } else {
        res.status(404).json({ msg: "User doesn't exist" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Error occured!' })
    }
  }
  async createUser(req, res) {
    let userData = req.body
    try {
      await UserService.insertUser(userData)
      res.sendStatus(201)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Error occured!' })
    }
  }
  async updateUser(req, res) {
    let userData = req.body
    try {
      let updatedUser = await UserService.updateUser(req.params['id'], userData)
      res.json(mapUserToViewModel(updatedUser))
    } catch (error) {
      console.log(error)
      res.json(userData)
    }
  }
  async deleteUser(req, res) {
    try {
      let users = await UserService.deleteUser(req.params['id'])
      res.json(users)
    } catch (error) {
      console.log(error)
    }
    let users = await UserService.getAllUsers()
    res.json(
      users.map((user) => {
        mapUserToViewModel(user)
      })
    )
  }
}

module.exports = new UserController()
