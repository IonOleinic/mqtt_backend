const UserCache = require('../cache/userCache')

class UserService {
  static async getAllUsers() {
    return await UserCache.getUsers()
  }
  static async getUserByID(userId) {
    return await UserCache.getUser(userId)
  }
  static async getUserByEmail(userEmail) {
    return await UserCache.getUserByEmail(userEmail)
  }
  static async getUserByRefreshToken(refreshToken) {
    return await UserCache.getUserByRefreshToken(refreshToken)
  }
  static async insertUser(userData) {
    return await UserCache.insertUser(userData)
  }
  static async updateUser(userId, userData) {
    return await UserCache.updateUser(userId, userData)
  }
  static async deleteUser(userId) {
    return await UserCache.deleteUser(userId)
  }
}

module.exports = { UserService }
