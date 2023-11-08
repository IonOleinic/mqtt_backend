require('dotenv').config()
const { mqttClient } = require('./mqttClient')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()
const http = require('http')
const io = require('./socketServer')
const db = require('../database/sequelizeInstance')
const { deviceRoutes } = require('./routes/deviceRoutes')
const { sceneRoutes } = require('./routes/sceneRoutes')
const { userRoutes } = require('./routes/userRoutes')
const { loginRoutes } = require('./routes/loginRoutes')
const { tokenRoutes } = require('./routes/tokenRoutes')
const { smartStripRoutes } = require('./routes/smartStripRoutes')
const { smartIRRoutes } = require('./routes/smartIRRoutes')
const { smartLedRoutes } = require('./routes/smartLedRoutes')
const { smartSirenAlarmRoutes } = require('./routes/smartSirenAlarmRoutes')
const { smartDoorSensorRoutes } = require('./routes/smartDoorSensorRoutes')
const { SceneService } = require('./services/sceneService')
const { DeviceService } = require('./services/deviceService')
const { checkIfInScene } = require('./helpers')
const verifyJWT = require('./middleware/verifyJWT')
const corsOptions = require('../config/corsOptions')
const socketCorsOptions = require('../config/socketCorsOptions')
const credentials = require('./middleware/credentials')

app.use(credentials)
app.use(cors(corsOptions))

app.use(bodyParser.json())
app.use(cookieParser())

app.use('/', loginRoutes)
app.use('/', tokenRoutes)
app.use(verifyJWT)
app.use('/', userRoutes)
app.use('/', deviceRoutes)
app.use('/', sceneRoutes)
app.use('/', smartStripRoutes)
app.use('/', smartIRRoutes)
app.use('/', smartLedRoutes)
app.use('/', smartSirenAlarmRoutes)
app.use('/', smartDoorSensorRoutes)

const server = http.createServer(app)
io.attach(server, socketCorsOptions)

mqttClient.on('connect', () => {
  console.log('MQTT Client connected.')
})

mqttClient.on('message', async (topic, payload) => {
  let buffer = topic.split('/')
  payload = payload.toString()
  let currentDevice = undefined
  if (buffer[0] === 'stat' || buffer[0] === 'tele') {
    currentDevice = DeviceService.getDeviceByMqttName(
      buffer[1],
      DeviceService.getAllTempDevices()
    )
  } else {
    currentDevice = DeviceService.getDeviceByMqttName(
      buffer[0],
      DeviceService.getAllTempDevices()
    )
  }
  if (!currentDevice) {
    if (buffer[0] === 'stat' || buffer[0] === 'tele') {
      currentDevice = DeviceService.getDeviceByMqttName(buffer[1])
    } else {
      currentDevice = DeviceService.getDeviceByMqttName(buffer[0])
    }
  }
  try {
    if (currentDevice) {
      currentDevice.processIncomingMessage(topic, payload, io)
      checkIfInScene(
        currentDevice,
        await SceneService.getAllScenes(),
        topic,
        payload
      )
    }
  } catch (error) {
    console.log(error)
  }
})

db.sequelize.sync().then((req) => {
  server.listen(5000, () => {
    console.log('Server listening on port 5000...')
  })
})
