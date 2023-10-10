require('dotenv').config()
const { mqttClient } = require('./mqttClient')
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const {
  getAllDevicesDB,
  checkIfInScene,
  getDeviceByMqttName,
} = require('./helpers')
const { deviceRoutes } = require('./routes/deviceRoutes')
const {
  getAllScenesLocaly,
  updateAllScenesLocaly,
  getAllDevicesLocaly,
  updateAllDevicesLocaly,
  getAllTempDevices,
} = require('./localObjects')
const { smartStripRoutes } = require('./routes/smartStripRoutes')
const { smartIRRoutes } = require('./routes/smartIRRoutes')
const { smartLedRoutes } = require('./routes/smartLedRoutes')
const { smartSirenAlarmRoutes } = require('./routes/smartSirenAlarmRoutes')
const { smartDoorSensorRoutes } = require('./routes/smartDoorSensorRoutes')
const { sceneRoutes } = require('./routes/sceneRoutes')

app.use(cors())
app.use(bodyParser.json())
app.use('/', deviceRoutes)
app.use('/', sceneRoutes)
app.use('/', smartStripRoutes)
app.use('/', smartIRRoutes)
app.use('/', smartLedRoutes)
app.use('/', smartSirenAlarmRoutes)
app.use('/', smartDoorSensorRoutes)
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONT_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})
io.on('connection', (socket) => {
  console.log(
    `A new conection from ${socket.handshake.headers.origin} with id:${socket.id}`
  )
  console.log(`Connected clients: ${io.engine.clientsCount}`)
  socket.on('disconnect', () => {
    console.log(`A client has been disconected.`)
    console.log(`Connected clients: ${io.engine.clientsCount}`)
  })
})

mqttClient.on('connect', async () => {
  let devicesFromDB = await getAllDevicesDB()
  updateAllDevicesLocaly(devicesFromDB)
  let scenes = getAllScenesLocaly()
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].initScene) {
      scenes[i].initScene(mqttClient)
    }
  }
  updateAllScenesLocaly(scenes)
})
mqttClient.on('message', (topic, payload) => {
  let buffer = topic.split('/')
  payload = payload.toString()
  let currentDevice = undefined
  if (buffer[0] === 'stat' || buffer[0] === 'tele') {
    currentDevice = getDeviceByMqttName(getAllTempDevices(), buffer[1])
  } else {
    currentDevice = getDeviceByMqttName(getAllTempDevices(), buffer[0])
  }
  if (!currentDevice) {
    if (buffer[0] === 'stat' || buffer[0] === 'tele') {
      currentDevice = getDeviceByMqttName(getAllDevicesLocaly(), buffer[1])
    } else {
      currentDevice = getDeviceByMqttName(getAllDevicesLocaly(), buffer[0])
    }
  }
  try {
    if (currentDevice) {
      currentDevice.processIncomingMessage(topic, payload, io)
      checkIfInScene(currentDevice, getAllScenesLocaly(), topic, payload)
    }
  } catch (error) {
    console.log(error)
  }
})
server.listen(5000, () => {
  console.log('Server listening on port 5000...')
})
