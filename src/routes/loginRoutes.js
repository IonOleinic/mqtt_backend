const jwt = require('jsonwebtoken')
const express = require('express')
const loginRoutes = express.Router()
const { UserService } = require('../services/userService')

loginRoutes.post('/login', async (req, res) => {
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
        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        })
        res.json({
          user: { email: currentUser.email, name: currentUser.name },
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
})

loginRoutes.get('/logout', async (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(204) //success without content
  const refreshToken = cookies.jwt

  const foundUser = await UserService.getUserByRefreshToken(refreshToken)
  if (!foundUser) {
    res.clearCookie('jwt', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    })
    return res.sendStatus(204)
  }
  //delete refreshToken from db
  currentUser.refresh_token = ''
  await UserService.updateUser(currentUser.id, currentUser.dataValues)
  res.clearCookie('jwt', {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  })
  return res.sendStatus(204)
})

module.exports = { loginRoutes }
