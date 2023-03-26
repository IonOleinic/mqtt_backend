const Device = require('./device')

class SmartStrip extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group, nr_of_sockets) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartStrip',
      false,
      false
    )
    if (img === '') {
      if (nr_of_sockets == 1) {
        this.img =
          'https://s13emagst.akamaized.net/products/41611/41610854/images/res_d0e3e75338d6c66ce67fb30eb262ba18.png?width=300&height=300&hash=27432531CE4D755B47A28FB1B0327F48'
      } else if (nr_of_sockets == 2) {
        this.img =
          'https://www.calibereurope.com/wp-content/uploads/2022/09/e98075d2cfa89ca060bb9bda48cd624d6df51a3b_HWP121E-8.jpg'
      } else if (nr_of_sockets >= 3) {
        this.img =
          'https://ae01.alicdn.com/kf/H4fdb76beb6d44535b8cff5ffe43a53bfj/Gosund-16A-Eu-Tuya-Wifi-Smart-Power-Strip-Met-3-Usb-poorten-Onafhankelijke-Schakelaar-multi-Plug.jpg_Q90.jpg_.webp'
      }
    }
    this.sensor_status = {
      StatusSNS: {
        Time: '0000-00-00T00:00:00',
        ENERGY: {
          TotalStartTime: '2022-10-13T16:13:07',
          Total: '-:-',
          Yesterday: '-:-',
          Today: '-:-',
          Power: '-:-',
          ApparentPower: '-:-',
          ReactivePower: '-:-',
          Factor: '-:-',
          Voltage: '-:-',
          Current: '-:-',
        },
      },
    }
    this.nr_of_sockets = nr_of_sockets
    this.cmnd_power_topics = []
    this.stat_power_topics = []
    this.power_status = []

    for (let i = 0; i < nr_of_sockets; i++) {
      this.cmnd_power_topics.push(`cmnd/${mqtt_name}/POWER${i + 1}`)
      if (this.manufacter === 'openBeken') {
        this.cmnd_sensor_topic = `TODO`
        this.cmnd_sensor_payload = 'TODO'
        this.stat_sensor_topic = `TODO`
        this.stat_power_topics.push(`${mqtt_name}/${i + 1}/get`)
      } else if (this.manufacter === 'tasmota') {
        this.cmnd_sensor_topic = `cmnd/${mqtt_name}/STATUS`
        this.cmnd_sensor_payload = '8'
        this.stat_sensor_topic = `stat/${mqtt_name}/STATUS8`
        if (nr_of_sockets == 1) {
          this.stat_power_topics.push(`stat/${mqtt_name}/POWER`)
        } else {
          this.stat_power_topics.push(`stat/${mqtt_name}/POWER${i + 1}`)
        }
      }
      this.power_status.push('OFF')
    }
  }
  change_power_state(mqtt_client, socket, state) {
    mqtt_client.publish(
      `cmnd/${this.mqtt_name}/POWER${socket}`,
      `${state}`,
      { qos: 0, retain: false },
      (error) => {
        if (error) {
          console.log(error)
        }
      }
    )
  }
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    for (let i = 0; i < this.stat_power_topics.length; i++) {
      this.subscribeToTopic(mqtt_client, this.stat_power_topics[i])
    }
    if (this.stat_sensor_topic) {
      this.subscribeToTopic(mqtt_client, this.stat_sensor_topic)
    }
    this.get_device_info(mqtt_client)
    this.get_initial_state(mqtt_client)
  }
  update_req(mqtt_client, req_topic) {
    if (this.manufacter === 'openBeken') {
      if (req_topic === 'POWER') {
        for (let i = 0; i < this.cmnd_power_topics.length; i++) {
          this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/${i + 1}/set`, '')
        }
      } else if (req_topic === 'STATUS') {
        //TODO
      }
    } else if (this.manufacter === 'tasmota') {
      if (req_topic === 'POWER') {
        for (let i = 0; i < this.cmnd_power_topics.length; i++) {
          this.change_power_state(mqtt_client, i + 1, '')
        }
      } else if (req_topic === 'STATUS') {
        this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/STATUS`, '8')
      }
    }
  }
  get_initial_state(mqtt_client) {
    this.update_req(mqtt_client, 'POWER')
    this.update_req(mqtt_client, 'STATE')
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    for (let i = 0; i < this.stat_power_topics.length; i++) {
      if (topic === this.stat_power_topics[i]) {
        if (this.manufacter === 'openBeken') {
          if (payload.toString() === '1') {
            this.power_status[i] = 'ON'
          } else if (payload.toString() === '0') {
            this.power_status[i] = 'OFF'
          }
        } else if (this.manufacter === 'tasmota') {
          this.power_status[i] = payload.toString()
        }
      }
    }
    if (topic === this.stat_sensor_topic) {
      const temp = payload.toString()
      this.sensor_status = JSON.parse(temp)
    }
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartStrip
