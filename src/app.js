require('dotenv').config()
const mqtt = require('mqtt')
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const {
  getDevices,
  getDevice,
  insertDevice,
  updateDevice,
  deleteDevice,
} = require('./database')
const SmartStrip = require('./Devices/smartStrip.js')
const SmartIR = require('./Devices/smartIR.js')
const SmartTempSensor = require('./Devices/smartTempSensor.js')
const SmartDoorSensor = require('./Devices/smartDoorSensor.js')
const SmartSirenAlarm = require('./Devices/smartSirenAlarm.js')
const TempIR = require('./Devices/tempIR.js')
const Horizon_IR = require('./Devices/IRPresets.js')
const Schedule = require('./Scenes/schedule.js')
const DeviceScene = require('./Scenes/deviceScene.js')
const WheatherScene = require('./Scenes/wheatherScene.js')
const SmartLed = require('./Devices/smartLed.js')
const SmartMotionSensor = require('./Devices/smartMotionSensor.js')

const DeviceTypes = {
  'Smart Switch': 'smartStrip',
  'Smart IR': 'smartIR',
  'Smart Door Sensor': 'smartDoorSensor',
  'Smart Temp&Hum Sensor': 'smartTempSensor',
  'Smart Motion Sensor': 'smartMotionSensor',
  'Smart Siren Alarm': 'smartSirenAlarm',
  'Smart LED': 'smartLed',
}

app.use(cors())
app.use(bodyParser.json())
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
const mqtt_host = process.env.MQTT_HOST
const mqtt_port = process.env.MQTT_PORT
const clientId = `mqtt_${Math.random().toString(20).slice(3)}`
const conectURL = `mqtt://${mqtt_host}:${mqtt_port}`

let scenes = []
let tempIR
let devices = []
let tempDevices = []
let mqtt_groups = []

// deviceScene1 = new DeviceScene(
//   'Scene 1',
//   'door_sensor1',
//   door_sensor1.id,
//   siren_alarm1.id,
//   door_sensor1.receive_status_topic,
//   'ON',
//   siren_alarm1.cmnd_status_topic,
//   'ON',
//   'Opened',
//   'Sound ON'
// )
// deviceScene2 = new DeviceScene(
//   'Scene 2',
//   'door_sensor1',
//   door_sensor1.id,
//   siren_alarm1.id,
//   door_sensor1.receive_status_topic,
//   'OFF',
//   siren_alarm1.cmnd_status_topic,
//   'OFF',
//   'Closed',
//   'Sound OFF'
// )
// let wheather1 = new WheatherScene(
//   'weather scene',
//   20,
//   'cmnd/rgb_controller_1/Power',
//   'OFF',
//   tuya_led_strip1.id,
//   'Power OFF',
//   '>='
// )
// scenes.push(wheather1)
// scenes.push(deviceScene1)
// scenes.push(deviceScene2)

const build_device_obj = (proto_device) => {
  let device = {}
  if (proto_device) {
    proto_device.attributes = JSON.parse(proto_device.attributes)
  }
  switch (proto_device.device_type) {
    case 'smartPlug':
    case 'smartSwitch':
    case 'smartStrip':
      device = new SmartStrip(proto_device)
      break
    case 'smartIR':
      tempDevices = delete_object(tempDevices, proto_device.id)
      device = new SmartIR(proto_device)
      break
    case 'smartLed':
      device = new SmartLed(proto_device)
      break
    case 'smartDoorSensor':
      device = new SmartDoorSensor(proto_device)
      break
    case 'smartTempSensor':
      device = new SmartTempSensor(proto_device)
      break
    case 'smartMotionSensor':
      device = new SmartMotionSensor(proto_device)
      break
    case 'smartSirenAlarm':
      device = new SmartSirenAlarm(proto_device)
      break
    default:
      break
  }
  if (device.initDevice) {
    device.initDevice(mqtt_client)
  }
  return device
}
const get_all_devices_db = async () => {
  let proto_devices = await getDevices()
  let devices = []
  for (let i = 0; i < proto_devices.length; i++) {
    devices.push(build_device_obj(proto_devices[i]))
  }
  return devices
}
const check_if_in_scene = (device, scenes, topic, payload) => {
  for (let i = 0; i < scenes.length; i++) {
    if (
      device.id == scenes[i].cond_device_id ||
      device.mqtt_name == scenes[i].cond_device_mqtt
    ) {
      if (scenes[i].conditional_topic == topic) {
        if (scenes[i].conditional_payload == payload) {
          scenes[i].execute(mqtt_client)
        }
      }
    }
  }
}
const delete_scenes_cascade = (scenes, device_id) => {
  let temp_scenes = scenes
  for (let i = 0; i < scenes.length; i++) {
    if (
      device_id == scenes[i].cond_device_id ||
      device_id == scenes[i].exec_device_id
    ) {
      if (scenes[i].delete) {
        scenes[i].delete()
      }
      temp_scenes = delete_object(temp_scenes, scenes[i].id)
    }
  }
  return temp_scenes
}
const delete_expired_schedules = (scenes) => {
  let temp_scenes = scenes
  const dateNow = new Date()
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].scene_type == 'schedule') {
      if (scenes[i].isOnce()) {
        if (scenes[i].hour < dateNow.getHours()) {
          scenes[i].delete()
          temp_scenes = delete_object(temp_scenes, scenes[i].id)
        } else if (
          scenes[i].hour == dateNow.getHours() &&
          scenes[i].minute < dateNow.getMinutes()
        ) {
          scenes[i].delete()
          temp_scenes = delete_object(temp_scenes, scenes[i].id)
        }
      }
    }
  }
  return temp_scenes
}
const mqtt_client = mqtt.connect(conectURL, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'mqtt',
  password: 'tasmota',
  reconnectPeriod: 1000,
})
mqtt_client.on('connect', async () => {
  devices = await get_all_devices_db()

  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].initScene) {
      scenes[i].initScene(mqtt_client)
    }
  }
})
const toJSON = (object) => {
  var attrs = {}
  for (var attr in object) {
    if (typeof object[attr] != 'function') {
      try {
        attrs[attr] = String(object[attr]) // force to string
      } catch (error) {}
    }
  }
  return attrs
}
const get_all_groups = (mqtt_groups, devices) => {
  for (let i = 0; i < devices.length; i++) {
    for (let j = 0; j < devices[i].mqtt_group.length; j++) {
      if (!mqtt_groups.includes(devices[i].mqtt_group[j])) {
        mqtt_groups.push(devices[i].mqtt_group[j])
      }
    }
  }
}
const filter_device_list = (filter, devices) => {
  let filtered_devices = []
  for (let i = 0; i < devices.length; i++) {
    if (devices[i].mqtt_group.includes(filter)) {
      filtered_devices.push(devices[i])
    }
  }
  return filtered_devices
}
const update_device = (old_device, new_device) => {
  old_device.name = new_device.name
  old_device.mqtt_name = new_device.mqtt_name
  old_device.mqtt_group = new_device.mqtt_group
  old_device.favorite = new_device.favorite
  old_device.img = new_device.img
  old_device.manufacter = new_device.manufacter
  // old_device = JSON.parse(JSON.stringify(new_device))
}
const update_scene = (old_scene, new_scene) => {
  old_scene.name = new_scene.name
  old_scene.active = new_scene.active
  old_scene.favorite = new_scene.favorite
  old_scene.img = new_scene.img
}
const subscribe_to_topic = (topic_to_subcribe) => {
  mqtt_client.subscribe(`${topic_to_subcribe}`, () => {
    console.log(`Client subscried on ${topic_to_subcribe}`)
  })
}
const get_device_by_mqtt_name = (devices, mqtt_name) => {
  let filtered_devices = devices.filter(
    (device) => device.mqtt_name == mqtt_name
  )
  return filtered_devices[0]
}
const get_object_by_id = (array, id) => {
  let filtered_array = array.filter((object) => object.id == id)
  return filtered_array[0]
}
const delete_object = (list, object_id) => {
  let filtered_devices = list.filter((device) => device.id != object_id)
  list = filtered_devices
  return list
}
const get_all_scenes = () => {
  let result = []
  for (let i = 0; i < scenes.length; i++) {
    result.push(toJSON(scenes[i]))
  }
  return result
}
app.post('/smartIR', (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    try {
      current_device.pressButton(mqtt_client, req.query['btn_code'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
})
app.post('/tempIR', (req, res) => {
  try {
    tempIR = new TempIR(req.query['manufacter'], req.query['mqtt_name'])
    tempDevices.push(tempIR)
    subscribe_to_topic(tempIR.receive_topic)
  } catch (error) {
    console.log(error)
    res.json({ Succes: false })
  }
  res.json({ Succes: true })
})
app.post('/device', async (req, res) => {
  let arrived = req.body
  let result = { succes: false, msg: 'ERROR' }
  try {
    if (
      get_device_by_mqtt_name(devices, arrived.mqtt_name) &&
      arrived.device_type !== 'smartIR'
    ) {
      result = { succes: false, msg: 'Device already exists!' }
    } else {
      let returned_id = await insertDevice(arrived)
      devices = await get_all_devices_db()
      tempDevices = []
      result = { succes: true, msg: 'Device added with succes' }
    }
  } catch (error) {
    console.log(error)
    result = { succes: false, msg: 'Error ocurred!' }
  }

  res.json(result)
})
app.put('/device/:id', async (req, res) => {
  let updatedDevice = req.body
  let current_device = get_object_by_id(devices, req.params['id'])
  try {
    let returned_id = await updateDevice(req.params['id'], updatedDevice)
    // devices = await get_all_devices_db()
    update_device(current_device, updatedDevice)
    res.json(current_device)
  } catch (error) {
    console.log(error)
    res.json(current_device)
  }
})
app.get('/smartStrip', (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    current_device.update_req(mqtt_client, req.query['req_topic'])
  }
  res.json(current_device)
})
app.post('/smartStrip', async (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    current_device.change_power_state(
      mqtt_client,
      req.query['socket_nr'],
      req.query['status']
    )
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
app.post('/smartDoorSensor', (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    current_device.send_toggle_req(mqtt_client)
  }
  res.json({ succes: true })
})
app.post('/smartLed/power', (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    current_device.send_change_power(mqtt_client, req.query['status'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
app.post('/smartLed/dimmer', (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    current_device.send_change_dimmer(mqtt_client, req.query['dimmer'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
app.post('/smartLed/color', (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    current_device.send_change_color(mqtt_client, req.query['color'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
app.post('/smartLed/speed', (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    current_device.send_change_speed(mqtt_client, req.query['speed'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
app.post('/smartLed/scheme', (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    current_device.send_change_scheme(mqtt_client, req.query['scheme'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
app.post('/smartLed/palette', (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  if (current_device) {
    current_device.send_change_palette(mqtt_client, req.query['palette'])
    res.json({ succes: true })
  } else {
    res.json({ succes: false })
  }
})
app.post('/smartSirenAlarm/power', async (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  current_device.change_power_state(mqtt_client, 1, req.query['status'])
  res.json({ succes: true })
})
app.post('/smartSirenAlarm/options', async (req, res) => {
  let current_device = get_object_by_id(devices, req.query['device_id'])
  current_device.update_options(
    mqtt_client,
    req.query['new_sound'],
    req.query['new_volume'],
    req.query['new_duration']
  )
  res.json({
    succes: true,
  })
})
app.get('/devices', (req, res) => {
  const filter = decodeURIComponent(req.query['filter'])
  if (filter) {
    devices = filter_device_list(filter, devices)
  }
  res.json(devices)
})
app.get('/scenes', (req, res) => {
  scenes = delete_expired_schedules(scenes)
  res.json(get_all_scenes())
})
app.post('/schedule', (req, res) => {
  try {
    let current_device = get_object_by_id(devices, req.query['device_id'])
    const dayOfWeek = req.query['dayOfWeek'].split(',')
    const hour = req.query['hour']
    const minute = req.query['minute']
    const name = req.query['name']
    const executable_topic = req.query['executable_topic']
    const executable_payload = req.query['executable_payload']
    const executable_text = req.query['executable_text']
    let schedule = new Schedule(name, current_device, dayOfWeek, hour, minute)
    const func = () => {
      if (schedule.active) {
        current_device.send_mqtt_req(
          mqtt_client,
          executable_topic,
          executable_payload
        )
      }
    }
    schedule.active = true
    schedule.repeatedly(func, executable_text)
    scenes.push(schedule)
    res.json({ succes: true })
  } catch (error) {
    console.log(error)
    res.json({ succes: false })
  }
})
app.post('/deviceScene', (req, res) => {
  try {
    let deviceScene = new DeviceScene(
      req.query['name'],
      req.query['cond_device_mqtt'],
      req.query['cond_device_id'],
      req.query['exec_device_id'],
      req.query['conditional_topic'],
      req.query['conditional_payload'],
      req.query['executable_topic'],
      req.query['executable_payload'],
      req.query['conditional_text'],
      req.query['executable_text']
    )
    deviceScene.active = true
    scenes.push(deviceScene)
    res.json({ succes: true })
  } catch (error) {
    console.log(error)
    res.json({ succes: false })
  }
})
app.post('/weatherScene', (req, res) => {
  try {
    let weatherScene = new WheatherScene(
      req.query['name'],
      req.query['target_temperature'],
      req.query['executable_topic'],
      req.query['executable_payload'],
      req.query['exec_device_id'],
      req.query['executable_text'],
      req.query['comparison_sign']
    )
    weatherScene.active = true
    weatherScene.initScene(mqtt_client)
    scenes.push(weatherScene)
    res.json({ succes: true })
  } catch (error) {
    console.log(error)
    res.json({ succes: false })
  }
})
app.put('/scene/:id', (req, res) => {
  try {
    let current_scene = get_object_by_id(scenes, req.params['id'])
    if (current_scene) {
      let updatedScene = req.body
      update_scene(current_scene, updatedScene)
    }
    res.json(toJSON(current_scene))
  } catch (error) {
    console.log(error)
    res.json(toJSON(current_scene))
  }
})
app.delete('/scene/:id', (req, res) => {
  try {
    let current_scene = get_object_by_id(scenes, req.params['id'])
    if (current_scene.delete) {
      current_scene.delete()
    }
    scenes = delete_object(scenes, req.params['id'])
    res.json(get_all_scenes())
  } catch (error) {
    console.log(error)
    res.json(get_all_scenes())
  }
})
app.get('/scene/:id', (req, res) => {
  try {
    let current_scene = get_object_by_id(scenes, req.query['scene_id'])
    res.json(current_scene)
  } catch (error) {
    res.json({ succes: false, msg: "Scene doesn't exist" })
  }
})
app.get('/device/:id', (req, res) => {
  let current_device = get_object_by_id(devices, req.params['id'])
  if (current_device) {
    res.json(current_device)
  } else {
    res.json({ succes: false, msg: "Device doesn't exist" })
  }
})
app.get('/device/getInitState/:id', (req, res) => {
  let current_device = get_object_by_id(devices, req.params['id'])
  if (current_device.get_initial_state) {
    current_device.get_initial_state(mqtt_client)
    res.json({ succes: true })
  } else {
    res.json({ succes: false, msg: "Device doesn't exist" })
  }
})
app.get('/mqttGroups', (req, res) => {
  mqtt_groups = []
  get_all_groups(mqtt_groups, devices)
  res.json(mqtt_groups)
})
app.get('/deviceTypes', (req, res) => {
  res.json(DeviceTypes)
})
app.delete('/device/:id', async (req, res) => {
  let device_id = req.params['id']
  if (device_id) {
    let returned_id = await deleteDevice(device_id)
    devices = await get_all_devices_db()
    scenes = delete_scenes_cascade(scenes, device_id)
    res.json(devices)
  } else {
    res.json(devices)
  }
})
mqtt_client.on('message', (topic, payload) => {
  let buffer = topic.split('/')
  payload = payload.toString()
  let current_device = undefined
  if (buffer[0] === 'stat' || buffer[0] === 'tele') {
    current_device = get_device_by_mqtt_name(tempDevices, buffer[1])
  } else {
    current_device = get_device_by_mqtt_name(tempDevices, buffer[0])
  }
  if (!current_device) {
    if (buffer[0] === 'stat' || buffer[0] === 'tele') {
      current_device = get_device_by_mqtt_name(devices, buffer[1])
    } else {
      current_device = get_device_by_mqtt_name(devices, buffer[0])
    }
  }
  try {
    if (current_device) {
      current_device.processIncomingMessage(topic, payload, io)
      check_if_in_scene(current_device, scenes, topic, payload)
    }
  } catch (error) {
    console.log(error)
  }
})
server.listen(5000, () => {
  console.log('Server listening on port 5000...')
})
