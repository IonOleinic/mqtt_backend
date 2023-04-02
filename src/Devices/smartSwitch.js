const Device = require('./device')

class SmartSwitch extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group, nr_of_sockets) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartSwitch',
      false,
      false
    )
    if (img === '') {
      if (nr_of_sockets == 1) {
        this.img =
          'https://s13emagst.akamaized.net/products/50754/50753334/images/res_23e98f0d367e75ffbc82c216338f2309.jpg'
      } else if (nr_of_sockets == 2) {
        this.img =
          'https://cf.shopee.com.my/file/2f6c3b0298147dbf5f2fcd505d8aa412_tn'
      } else if (nr_of_sockets == 3) {
        this.img =
          'https://images-na.ssl-images-amazon.com/images/I/21KApqangYL._SL500_._AC_SL500_.jpg'
      } else if (nr_of_sockets >= 4) {
        this.img =
          'https://static-01.daraz.pk/p/28ed77f055ace4967a10d2a0b93e8c95.jpg'
      }
    }
    this.nr_of_sockets = nr_of_sockets
    this.cmnd_power_topics = []
    this.stat_power_topics = []
    this.power_status = []
    for (let i = 0; i < nr_of_sockets; i++) {
      this.cmnd_power_topics.push(`cmnd/${mqtt_name}/POWER${i + 1}`)
      if (this.manufacter === 'openBeken') {
        this.stat_power_topics.push(`${mqtt_name}/${i + 1}/get`)
      } else if (this.manufacter === 'tasmota') {
        if (nr_of_sockets == 1) {
          this.stat_power_topics.push(`stat/${mqtt_name}/POWER`)
        } else {
          this.stat_power_topics.push(`stat/${mqtt_name}/POWER${i + 1}`)
        }
      }
      this.power_status.push('OFF')
    }
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
  change_power_state(mqtt_client, socket, state) {
    this.send_mqtt_req(
      mqtt_client,
      `cmnd/${this.mqtt_name}/POWER${socket}`,
      state
    )
  }
  get_initial_state(mqtt_client) {
    if (this.manufacter === 'openBeken') {
      for (let i = 0; i < this.cmnd_power_topics.length; i++) {
        this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/${i + 1}/get`, '')
      }
    } else if (this.manufacter === 'tasmota') {
      for (let i = 0; i < this.cmnd_power_topics.length; i++) {
        this.change_power_state(mqtt_client, i + 1, '')
      }
    }
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
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartSwitch
