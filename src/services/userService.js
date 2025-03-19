const { User } = require('../../models')

class UserService {
  static async getUsers() {
    try {
      const users = await User.findAll()
      return users
    } catch (error) {
      throw error
    }
  }
  static async getUserById(userId) {
    try {
      const user = await User.findByPk(userId)
      return user
    } catch (error) {
      throw error
    }
  }
  static async getUserByEmail(userEmail) {
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
  static async getUserByRefreshToken(refreshToken) {
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
  static async insertUser(userData) {
    try {
      await User.create(userData)
      return userData
    } catch (error) {
      throw error
    }
  }
  static async updateUser(userId, userData) {
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
  static async deleteUser(userId) {
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

module.exports = { UserService }
