const allowedOrigins = require('./allowedOrigins')
const socketCorsOptions = {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
}

module.exports = socketCorsOptions
