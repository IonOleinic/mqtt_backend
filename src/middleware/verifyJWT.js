const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
  let authHeader = req.headers['authorization']
  if (!authHeader) {
    res.status(401).json({ msg: 'Authorized:You are not!' })
  } else {
    let token = authHeader.split(' ')[1] //Bearer ....
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (error, decoded) => {
      if (error) {
        res.status(403).json({ msg: 'Token is expired!' })
      } else {
        req.userId = decoded.id
        next()
      }
    })
  }
}

module.exports = verifyJWT
