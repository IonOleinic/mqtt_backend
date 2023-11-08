const express = require('express')
const jwt = require('jsonwebtoken')
const tokenRoutes = express()
const { UserService } = require('../services/userService')

tokenRoutes.get('/refresh-token', async (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(401)
  const refreshToken = cookies.jwt
  const foundUser = await UserService.getUserByRefreshToken(refreshToken)
  if (!foundUser) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (error, decoded) => {
    if (error || foundUser.id !== decoded.id) return res.sendStatus(403)
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: '20m' }
    )
    res.json({
      user: { email: foundUser.email, name: foundUser.name },
      accessToken,
    })
  })
})

module.exports = { tokenRoutes }
