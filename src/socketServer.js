const { Server } = require('socket.io')
const { DeviceService } = require('./services/deviceService')

const io = new Server() // Create the instance without the server argument

io.on('connection', (socket) => {
  console.log(
    `A new connection from ${socket.handshake.headers.origin} with id:${socket.id}`
  )
  console.log(`Connected clients: ${io.engine.clientsCount}`)
  // Refresh devices from the database
  DeviceService.getAllDevicesDB()

  socket.on('disconnect', () => {
    console.log('A client has been disconnected.')
    console.log(`Connected clients: ${io.engine.clientsCount}`)
  })
})

module.exports = io
