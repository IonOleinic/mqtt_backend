const jwt = require('jsonwebtoken')
const { UserService } = require('../services/userService')

class TokenController {
  async refreshToken(req, res) {
    const cookies = req.cookies
    const userId = req.query['user_id']
    if (!cookies[`jwt_${userId}`] || !userId) {
      return res.sendStatus(401)
    }
    const refreshToken = cookies[`jwt_${userId}`]
    const foundUser = await UserService.getUserByRefreshToken(refreshToken)
    if (!foundUser) return res.sendStatus(403)
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN,
      (error, decoded) => {
        if (error || foundUser.id !== decoded.id) return res.sendStatus(403)
        const accessToken = jwt.sign(
          { id: decoded.id },
          process.env.JWT_ACCESS_TOKEN,
          { expiresIn: '20m' }
        )
        res.json({
          user: {
            email: foundUser.email,
            name: foundUser.name,
            id: foundUser.id,
          },
          accessToken,
        })
      }
    )
  }
}

module.exports = new TokenController()
