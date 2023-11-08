const socketCorsOptions = {
  cors: {
    origin: [process.env.FRONT_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
}

module.exports = socketCorsOptions
