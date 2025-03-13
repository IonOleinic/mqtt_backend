const { User } = require('../../models')

class UserCache {
  constructor() {}

  async getUsers() {
    try {
      const users = await User.findAll()
      return users
    } catch (error) {
      throw error
    }
  }
  async getUser(userId) {
    try {
      const user = await User.findByPk(userId)
      return user
    } catch (error) {
      throw error
    }
  }
  async getUserByEmail(userEmail) {
    try {
      const user = await User.findOne({
        where: {
          email: userEmail,
        },
      })
      return user
    } catch (error) {
      throw error
    }
  }
  async getUserByRefreshToken(refreshToken) {
    try {
      const user = await User.findOne({
        where: {
          refresh_token: refreshToken,
        },
      })
      return user
    } catch (error) {
      throw error
    }
  }
  async insertUser(userData) {
    try {
      const user = await User.create(userData)
      return userData
    } catch (error) {
      throw error
    }
  }
  async updateUser(userId, userData) {
    try {
      const userDB = await User.findByPk(userId)
      if (userDB) {
        await userDB.update(userData)
      }
      return userDB
    } catch (error) {
      throw error
    }
  }
  async deleteUser(userId) {
    try {
      const userDB = await User.findByPk(userId)
      if (userDB) {
        await userDB.destroy()
      }
      return true
    } catch (error) {
      throw error
    }
  }
}

module.exports = new UserCache()
