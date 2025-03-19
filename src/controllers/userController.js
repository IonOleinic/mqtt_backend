const { UserService } = require('../services/userService')
const { mapUserToViewModel } = require('../mappers/userMapper')

class UserController {
  async getUsers(req, res) {
    try {
      let users = await UserService.getUsers()
      res.json(
        users.map((user) => {
          mapUserToViewModel(user)
        })
      )
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
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
      res.status(500).json({ msg: 'Server error!' })
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
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async createUser(req, res) {
    let userData = req.body
    try {
      await UserService.insertUser(userData)
      res.sendStatus(201)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
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
      const result = await UserService.deleteUser(req.params['id'])
      if (result) res.json({ succes: true })
      else res.json({ succes: false })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
}

module.exports = new UserController()
