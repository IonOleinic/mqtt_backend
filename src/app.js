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

// const host = '192.168.0.108'
const host = '192.168.0.108'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const conectURL = `mqtt://${host}:${port}`

let devices = []
let mqtt_groups = []

let qiachip = new SmartSwitch(
  'priza 1',
  'https://community-assets.home-assistant.io/original/3X/8/a/8abc086dc2b6edf8e4fff33b1204385435042bc1.png',
  'openBeken',
  'qiachip_switch',
  ['General', 'Living Room'],
  'POWER',
  1,
  'OFF',
  'STATUS5'
)
let athom = new SmartSwitch(
  'Athom switch',
  'https://1pc.co.il/images/thumbs/0010042_wifi-smart-switch-tuya-vers-2-gang-white-eu_510.jpeg',
  'tasmota',
  'athom2gang',
  ['General', 'Diana Room'],
  'POWER',
  2,
  'OFF',
  'STATUS5'
)

let plug1 = new SmartStrip(
  'priza 1',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsfydxzL319Ptt0bLKAjFD9hUkyJ3kqTOTsA&usqp=CAU',
  'tasmota',
  'gosund_sp111_1',
  ['General', 'Diana Room'],
  'POWER',
  1,
  'OFF',
  'STATUS8',
  'STATUS5'
)
let plug2 = new SmartStrip(
  'plug2',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsfydxzL319Ptt0bLKAjFD9hUkyJ3kqTOTsA&usqp=CAU',
  'tasmota',
  'gosund_sp111_2',
  ['General'],
  'POWER',
  1,
  'OFF',
  'STATUS8',
  'STATUS5'
)
let powerStrip = new SmartStrip(
  'power strip',
  'https://s13emagst.akamaized.net/products/32075/32074500/images/res_e3072d09e97388c6a8f1c747e3dde571.jpg',
  'tasmota',
  'gosund_p1',
  ['General'],
  'POWER',
  4,
  'OFF',
  'STATUS8',
  'STATUS5'
)
let aubess_ir = new SmartIR(
  'Horizon Remote',
  'https://cf.shopee.ph/file/69fce45352701a9929822bfc88e42978_tn',
  'openBeken',
  'aubess_ir',
  ['General'],
  'STATUS5'
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
const mqtt_client = mqtt.connect(conectURL, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
})
mqtt_client.on('connect', () => {
  for (let i = 0; i < devices.length; i += 1) {
    init_device(devices[i])
  }
})
const init_device = (device) => {
  if (
    device.device_type === 'smartStrip' ||
    device.device_type === 'smartSwitch'
  ) {
    for (let index = 0; index < device.stat_power_topics.length; index++) {
      subscribe_to_topic(device.stat_power_topics[index])
    }
    if (device.sensor_topic) {
      subscribe_to_topic(device.sensor_topic)
    }
  }
  subscribe_to_topic(device.device_info_topic)
  get_MAC_adress(device.mqtt_name)
}
const subscribe_to_topic = (topic_to_subcribe) => {
  mqtt_client.subscribe(`${topic_to_subcribe}`, () => {
    console.log(`Client subscried on ${topic_to_subcribe}`)
  })
}
const get_device = (mqtt_name) => {
  let filtered_devices = devices.filter(
    (device) => device.mqtt_name == mqtt_name
  )
  return filtered_devices[0]
}
const delete_device = (mqtt_name) => {
  let filtered_devices = devices.filter(
    (device) => device.mqtt_name !== mqtt_name
  )
  devices = filtered_devices
}
app.post('/smartIR', (req, res) => {
  let current_device = get_device(req.query['device_name'])
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
app.post('/addDevice', async (req, res) => {
  let current_device = new SmartPlug(req.query['device_name'])
  current_device.power_status = req.query['status']
  if (req.query['power_topic']) {
    current_device.power_topic = req.query['power_topic']
  }
  await get_MAC_adress(current_device.mqtt_name)
  devices.push(current_device)
  res.json(current_device)
})
app.post('/smartStrip', async (req, res) => {
  let current_device = get_device(req.query['device_name'])
  let req_type = req.query['req_type']
  let plug_index = -1
  for (let i = 0; i < current_device.cmnd_power_topics.length; i++) {
    if (
      current_device.cmnd_power_topics[i] ===
      `cmnd/${current_device.mqtt_name}/${req_type}`
    ) {
      plug_index = i
    }
  }
  await send_mqtt_cmnd(
    `cmnd/${current_device.mqtt_name}/${req_type}`,
    req.query['status']
  )

  res.json({ Power: `${current_device.power_status[plug_index]}` })
})
app.get('/devices', (req, res) => {
  const filter = decodeURIComponent(req.query['filter'])
  if (filter !== '') {
    res.json(filter_device_list(filter, devices))
  } else {
    res.json(devices)
  }
})
app.get('/mqtt_groups', (req, res) => {
  get_all_groups(mqtt_groups, devices)
  res.json(mqtt_groups)
})
app.post('/deleteDevice', async (req, res) => {
  let device_name = req.query['device_name']
  if (device_name) {
    await delete_device(device_name)
    res.json(devices)
  } else {
    res.json(devices)
  }
})
app.get('/smartStrip', async (req, res) => {
  let current_device = get_device(req.query['device_name'])
  if (current_device) {
    let req_topic = req.query['req_topic']
    let req_payload = req.query['req_payload']
    if (current_device.manufacter === 'openBeken') {
    } else if (current_device.manufacter === 'tasmota') {
      if (req_topic === 'POWER') {
        for (let i = 0; i < current_device.cmnd_power_topics.length; i++) {
          await send_mqtt_cmnd(current_device.cmnd_power_topics[i], req_payload)
        }
      } else if (req_topic === 'STATUS') {
        await send_mqtt_cmnd(
          `cmnd/${current_device.mqtt_name}/${req_topic}`,
          req_payload
        )
      }
    }
  }
  res.json(current_device)
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
const get_MAC_adress = (mqtt_name) => {
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
  let current_device = get_device(buffer[1])
  if (buffer[0] === 'stat') {
    current_device = get_device(buffer[1])
  } else {
    current_device = get_device(buffer[0])
  }
  try {
    if (current_device) {
      if (
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

        if (topic === current_device.sensor_topic) {
          const temp = payload.toString()
          current_device.sensor_status = JSON.parse(temp)
        }
        if (io) {
          io.emit('update_smart_strip', {
            mqtt_name: current_device.mqtt_name,
            power_status: current_device.power_status,
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
