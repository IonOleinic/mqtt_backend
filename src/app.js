const mqtt = require('mqtt')
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const SmartStrip = require('./smartStrip.js')
const SmartSwitch = require('./smartSwitch.js')
const SmartIR = require('./smartIR.js')
const TempIR = require('./tempIR.js')
const Horizon_IR = require('./IRPresets.js')
const DeviceType = {
  smartStrip: 'smartStrip',
  smartPlug: 'smartStrip',
  smartSwitch: 'smartStrip',
  smartIR: 'smartIR',
  smartDoorSensor: 'smartDoorSensor',
  smartTempSensor: 'smartTempSensor',
  smartMotionSensor: 'smartTempSensor',
}
const AllTypes = Object.keys(DeviceType)
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
const mqtt_host = '192.168.0.108'
// const mqtt_host = 'broker.emqx.io'
const mqtt_port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const conectURL = `mqtt://${mqtt_host}:${mqtt_port}`

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
  'priza 1',
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
devices.push(aubess_ir)
devices.push(plug1)
devices.push(powerStrip)
devices.push(plug2)
devices.push(qiachip)
devices.push(athom)
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
  old_device.group = new_device.group
  old_device.favorite = new_device.favorite
  old_device.img = new_device.img
  old_device.manufacter = new_device.manufacter
  // old_device = JSON.parse(JSON.stringify(new_device))
}
const mqtt_client = mqtt.connect(conectURL, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'mqtt',
  password: 'tasmota',
  reconnectPeriod: 1000,
})
mqtt_client.on('connect', () => {
  for (let i = 0; i < devices.length; i += 1) {
    init_device(devices[i])
  }
})
const init_device = (device) => {
  if (device.device_type === 'smartIR') {
    subscribe_to_topic(device.receive_topic)
  } else if (
    device.device_type === 'smartStrip' ||
    device.device_type === 'smartSwitch'
  ) {
    for (let i = 0; i < device.stat_power_topics.length; i++) {
      subscribe_to_topic(device.stat_power_topics[i])
    }
    if (device.stat_sensor_topic) {
      subscribe_to_topic(device.stat_sensor_topic)
    }
  }
  subscribe_to_topic(device.device_info_topic)
  get_device_info(device.mqtt_name)
}
const subscribe_to_topic = (topic_to_subcribe) => {
  mqtt_client.subscribe(`${topic_to_subcribe}`, () => {
    console.log(`Client subscried on ${topic_to_subcribe}`)
  })
}
const get_device = (devices, mqtt_name) => {
  let filtered_devices = devices.filter(
    (device) => device.mqtt_name == mqtt_name
  )
  return filtered_devices[0]
}
const get_device_by_id = (devices, id) => {
  let filtered_devices = devices.filter((device) => device.id == id)
  return filtered_devices[0]
}
const delete_device = (devices, id) => {
  let filtered_devices = devices.filter((device) => device.id !== id)
  devices = filtered_devices
  return devices
}
app.post('/smartIR', (req, res) => {
  let current_device = get_device(devices, req.query['device_name'])
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
      get_device(devices, device.mqtt_name) &&
      device.device_type !== 'smartIR'
    ) {
      return { Succes: false, msg: 'Device already exists!' }
    } else {
      devices.push(device)
      init_device(device)
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
      tempDevices = delete_device(tempDevices, arrived.id)
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
app.post('/updateDevice', (req, res) => {
  let updatedDevice = req.body
  let current_device = get_device_by_id(devices, updatedDevice.id)
  update_device(current_device, updatedDevice)
  res.json({ Succes: true })
})
app.get('/smartStrip', (req, res) => {
  let current_device = get_device(devices, req.query['device_name'])
  if (current_device) {
    let req_topic = req.query['req_topic']
    if (current_device.manufacter === 'openBeken') {
      //TODO
    } else if (current_device.manufacter === 'tasmota') {
      if (req_topic === 'POWER') {
        for (let i = 0; i < current_device.cmnd_power_topics.length; i++) {
          current_device.change_power_state(mqtt_client, i + 1, '')
        }
      } else if (req_topic === 'STATUS') {
        current_device.send_sensor_req(mqtt_client)
      }
    }
  }
  res.json(current_device)
})
app.post('/smartStrip', async (req, res) => {
  let current_device = get_device(devices, req.query['device_name'])
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
app.get('/mqtt_groups', (req, res) => {
  get_all_groups(mqtt_groups, devices)
  res.json(mqtt_groups)
})
app.get('/deviceTypes', (req, res) => {
  res.json(AllTypes)
})
app.post('/deleteDevice', async (req, res) => {
  let device_id = req.query['device_id']
  if (device_id) {
    devices = delete_device(devices, device_id)
    res.json(devices)
  } else {
    res.json(devices)
  }
})
const send_mqtt_cmnd = (req_topic, req_payload) => {
  mqtt_client.publish(
    `${req_topic}`,
    `${req_payload}`,
    { qos: 0, retain: false },
    (error) => {
      if (error) {
        console.log(error)
      }
    }
  )
}
const get_device_info = (mqtt_name) => {
  mqtt_client.publish(
    `cmnd/${mqtt_name}/STATUS`,
    `5`,
    { qos: 0, retain: false },
    (error) => {
      if (error) {
        console.log(error)
      }
    }
  )
}
mqtt_client.on('message', (topic, payload) => {
  let buffer = topic.split('/')
  let current_device = get_device(tempDevices, buffer[0])
  if (!current_device) {
    if (buffer[0] === 'stat') {
      current_device = get_device(devices, buffer[1])
    } else {
      current_device = get_device(devices, buffer[0])
    }
  }
  try {
    if (current_device) {
      if (current_device.device_type === 'tempIR') {
        current_device.received_code = payload.toString()
        if (io) {
          io.emit('update_temp_ir', {
            mqtt_name: current_device.mqtt_name,
            received_code: current_device.received_code,
          })
        }
      } else if (
        current_device.device_type === 'smartStrip' ||
        current_device.device_type === 'smartSwitch'
      ) {
        for (let i = 0; i < current_device.stat_power_topics.length; i++) {
          if (topic === current_device.stat_power_topics[i]) {
            if (current_device.manufacter === 'openBeken') {
              if (payload.toString() === '1') {
                current_device.power_status[i] = 'ON'
              } else if (payload.toString() === '0') {
                current_device.power_status[i] = 'OFF'
              }
            } else if (current_device.manufacter === 'tasmota') {
              current_device.power_status[i] = payload.toString()
            }
          }
        }

        if (topic === current_device.stat_sensor_topic) {
          const temp = payload.toString()
          current_device.sensor_status = JSON.parse(temp)
        }
        if (io) {
          io.emit('update_smart_strip', {
            mqtt_name: current_device.mqtt_name,
            power_status: current_device.power_status,
            sensor_status: current_device.sensor_status,
          })
        }
      }
      if (topic === current_device.device_info_topic) {
        const temp = JSON.parse(payload.toString())
        current_device.MAC = temp.StatusNET.Mac
        current_device.IP = temp.StatusNET.IPAddress
      }
    }
  } catch (error) {
    console.log(error)
  }
})
server.listen(5000, () => {
  console.log('Server listening on port 5000...')
})
