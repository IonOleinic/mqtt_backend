const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { UserService } = require('../services/userService')

class LoginController {
  async login(req, res) {
    try {
      let currentUser = await UserService.getUserByEmail(req.body['email'])
      if (currentUser) {
        const match = await bcrypt.compare(
          req.body['password'],
          currentUser.password
        )
        if (match) {
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
  async register(req, res) {
    try {
      const { email, name, password, gender } = req.body
      if (!email || !password || !name)
        return res
          .status(400)
          .json({ msg: 'Email, name and password are required!' })
      let duplicate = await UserService.getUserByEmail(email)
      if (duplicate) {
        res.sendStatus(409)
      } else {
        //encrypt password
        const hashedPassword = await bcrypt.hash(password, 10)
        //store new user
        const userData = { email, name, password: hashedPassword, gender }
        await UserService.insertUser(userData)
        res.sendStatus(201)
      }
    } catch (error) {
      res.status(500).json({ msg: 'Server Error' })
      console.log(error)
    }
  }
}
module.exports = new LoginController()
