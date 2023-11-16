const jwt = require('jsonwebtoken')
const { UserService } = require('../services/userService')

class LoginController {
  async login(req, res) {
    try {
      let currentUser = await UserService.getUserByEmail(req.body['email'])
      if (currentUser) {
        if (currentUser.password === req.body['password']) {
          const accesToken = jwt.sign(
            { id: currentUser.id },
            process.env.JWT_ACCESS_TOKEN,
            { expiresIn: '20m' }
          )
          const refreshToken = jwt.sign(
            { id: currentUser.id },
            process.env.JWT_REFRESH_TOKEN,
            { expiresIn: '24h' }
          )
          currentUser.refresh_token = refreshToken
          await UserService.updateUser(currentUser.id, currentUser.dataValues)
          res.cookie(`jwt_${currentUser.id}`, refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
          })
          res.json({
            user: {
              email: currentUser.email,
              name: currentUser.name,
              id: currentUser.id,
            },
            accessToken: accesToken,
          })
        } else {
          res.status(400).json({ msg: 'Incorrect password' })
        }
      } else {
        res.status(400).json({ msg: "User doesn't exist" })
      }
    } catch (error) {
      res.status(500).json({ msg: 'Server Error' })
      console.log(error)
    }
  }
  async logout(req, res) {
    try {
      const cookies = req.cookies
      const userId = req.query['user_id']
      if (!cookies[`jwt_${userId}`] || !userId) {
        return res.sendStatus(401)
      }
      const refreshToken = cookies[`jwt_${userId}`]
      const foundUser = await UserService.getUserByRefreshToken(refreshToken)
      if (!foundUser) {
        res.clearCookie(`jwt_${userId}`, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        })
        return res.sendStatus(204)
      }
      //delete refreshToken from db
      foundUser.refresh_token = ''
      await UserService.updateUser(foundUser.id, foundUser.dataValues)
      res.clearCookie(`jwt_${foundUser.id}`, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      return res.sendStatus(204)
    } catch (error) {
      res.status(500).json({ msg: 'Server Error' })
      console.log(error)
    }
  }
}
module.exports = new LoginController()
