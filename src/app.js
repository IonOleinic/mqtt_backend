const mqtt = require('mqtt')
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const SmartStrip = require('./Devices/smartStrip.js')
const SmartSwitch = require('./Devices/smartSwitch.js')
const SmartIR = require('./Devices/smartIR.js')
const SmartTempSensor = require('./Devices/smartTempSensor.js')
const SmartDoorSensor = require('./Devices/smartDoorSensor.js')
const TempIR = require('./Devices/tempIR.js')
const Horizon_IR = require('./Devices/IRPresets.js')
const Schedule = require('./Scenes/schedule.js')

const DeviceTypes = {
  'Smart Strip': 'smartStrip',
  'Smart Plug': 'smartStrip',
  'Smart Switch': 'smartSwitch',
  'Smart IR': 'smartIR',
  'Smart Door Sensor': 'smartDoorSensor',
  'Smart Temp&Hum Sensor': 'smartTempSensor',
  'Smart Motion Sensor': 'smartTempSensor',
}

const FrontURL = 'http://192.168.0.108:3000'
const FrontPort = 3000

app.use(cors())
app.use(bodyParser.json())
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://192.168.0.108:3000', 'http://localhost:3000'],
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
// const mqtt_host = '192.168.0.108'
// const mqtt_host = 'broker.emqx.io'
const mqtt_host = '80.96.122.192'
const mqtt_port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const conectURL = `mqtt://${mqtt_host}:${mqtt_port}`

let scenes = []
let tempIR
let devices = []
let tempDevices = []
let mqtt_groups = []

let qiachip = new SmartSwitch(
  'priza 1',
  'https://community-assets.home-assistant.io/original/3X/8/a/8abc086dc2b6edf8e4fff33b1204385435042bc1.png',
  'openBeken',
  'qiachip_switch',
  'Living Room',
  1
)
let athom = new SmartSwitch(
  'Athom switch',
  'https://1pc.co.il/images/thumbs/0010042_wifi-smart-switch-tuya-vers-2-gang-white-eu_510.jpeg',
  'tasmota',
  'athom2gang',
  'Diana Room,dawda,faefsefsf',
  2
)

let plug1 = new SmartStrip(
  'plug1',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsfydxzL319Ptt0bLKAjFD9hUkyJ3kqTOTsA&usqp=CAU',
  'tasmota',
  'gosund_sp111_1',
  'Diana Room',
  1
)
let plug2 = new SmartStrip(
  'plug2',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsfydxzL319Ptt0bLKAjFD9hUkyJ3kqTOTsA&usqp=CAU',
  'tasmota',
  'gosund_sp111_2',
  '',
  1
)
let powerStrip = new SmartStrip(
  'power strip',
  'https://s13emagst.akamaized.net/products/32075/32074500/images/res_e3072d09e97388c6a8f1c747e3dde571.jpg',
  'tasmota',
  'gosund_p1',
  '',
  4
)
let aubess_ir = new SmartIR(
  'Horizon Remote',
  'https://cf.shopee.ph/file/69fce45352701a9929822bfc88e42978_tn',
  'openBeken',
  'aubess_ir',
  '',
  new Horizon_IR()
)
let temp_hum1 = new SmartTempSensor(
  'Temp&Hum Sensor',
  '',
  'openBeken',
  'temp_hum1',
  ''
)
let door_sensor1 = new SmartDoorSensor(
  'Door&Window Sensor',
  '',
  'tasmota',
  'door_sensor1',
  ''
)
devices.push(aubess_ir)
devices.push(plug1)
devices.push(powerStrip)
devices.push(plug2)
devices.push(qiachip)
devices.push(athom)
devices.push(temp_hum1)
devices.push(door_sensor1)

const mqtt_client = mqtt.connect(conectURL, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'mqtt',
  password: 'tasmota',
  reconnectPeriod: 1000,
})
mqtt_client.on('connect', () => {
  for (let i = 0; i < devices.length; i++) {
    devices[i].initDevice(mqtt_client)
  }
})
const toJSON = (object) => {
  var attrs = {}
  for (var attr in object) {
    if (typeof object[attr] != 'function') {
      attrs[attr] = String(object[attr]) // force to string
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
    if (scenes[i].scene_type === 'schedule') {
      result.push(toJSON(scenes[i]))
    } else {
      result.push(scenes[i])
    }
  }
  return result
}
app.post('/smartIR', (req, res) => {
  let current_device = get_device_by_mqtt_name(
    devices,
    req.query['device_name']
  )
  let btn_code = req.query['btn_code']
  if (current_device) {
    try {
      current_device.pressButton(mqtt_client, btn_code)
      res.json({ Succes: true })
    } catch (error) {
      console.log(error)
      res.json({ Succes: false })
    }
  }
})
app.post('/tempIR', (req, res) => {
  try {
    tempIR = new TempIR(req.body.manufacter, req.body.mqtt_name)
    tempDevices.push(tempIR)
    subscribe_to_topic(tempIR.receive_topic)
  } catch (error) {
    console.log(error)
    res.json({ Succes: false })
  }
  res.json({ Succes: true })
})
app.post('/addDevice', (req, res) => {
  let arrived = req.body
  let result = { Succes: false, msg: 'ERROR' }
  let device = {}
  const try_add_device = (device) => {
    if (
      get_device_by_mqtt_name(devices, device.mqtt_name) &&
      device.device_type !== 'smartIR'
    ) {
      return { Succes: false, msg: 'Device already exists!' }
    } else {
      devices.push(device)
      device.initDevice(mqtt_client)
      return { Succes: true, msg: 'Device added with succes' }
    }
  }
  switch (arrived.type) {
    case 'smartPlug':
    case 'smartStrip':
      device = new SmartStrip(
        arrived.name,
        arrived.iconUrl,
        arrived.manufacter,
        arrived.mqttName,
        arrived.groups,
        arrived.props.nr_of_sockets
      )
      result = try_add_device(device)
      break
    case 'smartSwitch':
      device = new SmartSwitch(
        arrived.name,
        arrived.iconUrl,
        arrived.manufacter,
        arrived.mqttName,
        arrived.groups,
        arrived.props.nr_of_sockets
      )
      result = try_add_device(device)
      break
    case 'smartIR':
      tempDevices = delete_object(tempDevices, arrived.id)
      device = new SmartIR(
        arrived.name,
        arrived.iconUrl,
        arrived.manufacter,
        arrived.mqttName,
        arrived.groups,
        arrived.props
      )
      result = try_add_device(device)
      break
    default:
      result.Succes = false
      result.msg = 'Error ocurred!'
      break
  }
  res.json(result)
})
app.put('/device/:id', (req, res) => {
  let updatedDevice = req.body
  let current_device = get_object_by_id(devices, req.params['id'])
  try {
    update_device(current_device, updatedDevice)
    res.json(current_device)
  } catch (error) {
    console.log(error)
    res.json(current_device)
  }
})
app.get('/smartStrip', (req, res) => {
  let current_device = get_device_by_mqtt_name(
    devices,
    req.query['device_name']
  )
  if (current_device) {
    current_device.update_req(mqtt_client, req.query['req_topic'])
  }
  res.json(current_device)
})
app.post('/smartStrip', async (req, res) => {
  let current_device = get_device_by_mqtt_name(
    devices,
    req.query['device_name']
  )
  let socket_nr = req.query['socket_nr']
  let status = req.query['status']
  current_device.change_power_state(mqtt_client, socket_nr, status)
  res.json({ Power: `${current_device.power_status[Number(socket_nr) - 1]}` })
})
app.get('/devices', (req, res) => {
  const filter = decodeURIComponent(req.query['filter'])
  if (filter !== '') {
    res.json(filter_device_list(filter, devices))
  } else if (filter === '' || filter === undefined) {
    res.json(devices)
  }
})
app.get('/scenes', (req, res) => {
  res.json(get_all_scenes())
})
app.post('/schedule', (req, res) => {
  try {
    let current_device = get_object_by_id(devices, req.query['device_id'])
    const dayOfWeek = req.query['dayOfWeek'].split(',')
    const hour = req.query['hour']
    const minute = req.query['minute']
    const state = req.query['state']
    const socket_nr = req.query['socket_nr']
    const name = req.query['name']
    let schedule = new Schedule(name, current_device, dayOfWeek, hour, minute)
    const func = () => {
      if (schedule.active) {
        current_device.change_power_state(mqtt_client, socket_nr, state)
      }
    }
    schedule.repeatedly(func, `Power:${state}`)
    scenes.push(schedule)
    res.json({ Succes: true })
  } catch (error) {
    console.log(error)
    res.json({ Succes: false })
  }
})
app.put('/scene/:id', (req, res) => {
  try {
    let current_scene = get_object_by_id(scenes, req.params['id'])
    let updatedScene = req.body
    update_scene(current_scene, updatedScene)
    res.json(toJSON(current_scene))
  } catch (error) {
    res.json(toJSON(current_scene))
  }
})
app.delete('/scene/:id', (req, res) => {
  try {
    let current_scene = get_object_by_id(scenes, req.params['id'])
    current_scene.delete()
    scenes = delete_object(scenes, req.params['id'])
    res.json(get_all_scenes())
  } catch (error) {
    console.log(error)
    res.json(get_all_scenes())
  }
})
app.get('/scene/:id', (req, res) => {
  try {
    let current_schedule = get_object_by_id(scenes, req.query['schedule_id'])
    res.json(current_schedule)
  } catch (error) {
    res.json({ Succes: false, msg: "Schedule doesn't exist" })
  }
})
app.get('/device/:id', (req, res) => {
  let current_device = get_object_by_id(devices, req.params['id'])
  if (current_device) {
    res.json(current_device)
  } else {
    res.json({ Succes: false, msg: "Device doesn't exist" })
  }
})
app.get('/mqtt_groups', (req, res) => {
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
    devices = delete_object(devices, device_id)
    res.json(devices)
  } else {
    res.json(devices)
  }
})
mqtt_client.on('message', (topic, payload) => {
  let buffer = topic.split('/')
  let current_device = get_device_by_mqtt_name(tempDevices, buffer[0])
  if (!current_device) {
    if (buffer[0] === 'stat') {
      current_device = get_device_by_mqtt_name(devices, buffer[1])
    } else {
      current_device = get_device_by_mqtt_name(devices, buffer[0])
    }
  }
  try {
    if (current_device) {
      current_device.processIncomingMessage(topic, payload, io)
    }
  } catch (error) {
    console.log(error)
  }
})
server.listen(5000, () => {
  console.log('Server listening on port 5000...')
})
