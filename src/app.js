const mqtt = require('mqtt')
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const SmartStrip = require('./smartStrip.js')
const SmartSwitch = require('./smartSwitch.js')
const app = express()
const host = 'broker.hivemq.com'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const conectURL = `mqtt://${host}:${port}`

let devices = []
let mqtt_groups = []
let qiachip = new SmartSwitch(
  'priza 1',
  'https://ae01.alicdn.com/kf/HTB1XJdxXPDuK1Rjy1zjq6zraFXat/QIACHIP-Wireless-Wifi-Light-Switch-Universal-433Mhz-10A-RF-Smart-Home-Module-Wifi-Remote-Control-Switch.jpg',
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
  'https://ae01.alicdn.com/kf/Hf06f6c56564444d4a66f6cd6a2fe835a9/ATHOM-Homekit-no-Neutral-Needed-WiFi-EU-Standard-Smart-Switch-Touch-key-1-gang-2-gang.jpg',
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
const client = mqtt.connect(conectURL, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
})

client.on('connect', () => {
  for (let i = 0; i < devices.length; i += 1) {
    if (
      devices[i].device_type === 'smartStrip' ||
      devices[i].device_type === 'smartSwitch'
    ) {
      for (
        let index = 0;
        index < devices[i].stat_power_topics.length;
        index++
      ) {
        subscribe_to_topic(devices[i].stat_power_topics[index])
      }
      if (devices[i].sensor_topic) {
        subscribe_to_topic(devices[i].sensor_topic)
      }
    }
    subscribe_to_topic(devices[i].device_info_topic)
    get_MAC_adress(devices[i].mqtt_name)
  }
})
app.use(cors())
app.use(bodyParser.json())

const subscribe_to_topic = (topic_to_subcribe) => {
  client.subscribe(`${topic_to_subcribe}`, () => {
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
      //current_device.power_status[i] = req.query['status']
      plug_index = i
    }
  }
  await get_data(
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
          await get_data(current_device.cmnd_power_topics[i], req_payload)
        }
      } else if (req_topic === 'STATUS') {
        await get_data(
          `cmnd/${current_device.mqtt_name}/${req_topic}`,
          req_payload
        )
      }
    }
    res.json(current_device)
  }
})
const get_data = (req_topic, req_payload) => {
  client.publish(
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
  client.publish(
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
client.on('message', (topic, payload) => {
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

app.listen(5000, () => {
  console.log('Server listening on port 5000...')
})
