const { Server } = require('socket.io')
const { DeviceService } = require('../services/deviceService')
const socketCorsOptions = require('../../config/socketCorsOptions')
const httpServer = require('./httpServer')
const io = new Server(httpServer, socketCorsOptions)

io.on('connection', (socket) => {
  console.log(
    `A new connection from ${socket.handshake.headers.origin} with id:${socket.id}`
  )
  console.log(`Connected clients: ${io.engine.clientsCount}`)

  socket.on('disconnect', () => {
    console.log('A client has been disconnected.')
    console.log(`Connected clients: ${io.engine.clientsCount}`)
  })
})
io.on('error', (error) => {
  console.log(error)
})

module.exports = io
