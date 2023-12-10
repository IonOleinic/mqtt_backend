const { mqttClient } = require('../mqtt/mqttClient')
class Device {
  constructor({
    id,
    name,
    img,
    user_id,
    manufacter,
    mqtt_name,
    mqtt_group,
    device_type,
    favorite,
    date,
  }) {
    this.user_id = user_id
    this.favorite = favorite
    this.id = id
    this.name = name
    this.manufacter = manufacter
    this.img = img
    this.battery = [
      'smartTempSensor',
      'smartDoorSensor',
      'smartSirenAlarm',
      'smartMotionSensor',
    ].includes(device_type)
      ? true
      : false
    this.read_only = [
      'smartTempSensor',
      'smartDoorSensor',
      'smartMotionSensor',
    ].includes(device_type)
      ? true
      : false
    this.mqtt_name = mqtt_name
    this.mqtt_group = mqtt_group ? mqtt_group.split(',') : []
    this.device_type = device_type
    this.MAC = 'UNKNOWN'
    this.IP = 'UNKNOWN'
    this.date = new Date(date)
    this.available = false
  }
  subscribeForDeviceInfo() {
    this.info_topics = []
    if (this.manufacter == 'tasmota') {
      this.availability_topic = `tele/${this.mqtt_name}/LWT`
      this.info_topics.push(`stat/${this.mqtt_name}/STATUS5`)
    } else if (this.manufacter == 'openBeken') {
      this.availability_topic = `${this.mqtt_name}/connected`
      this.info_topics.push(`${this.mqtt_name}/ip`)
      this.info_topics.push(`${this.mqtt_name}/mac`)
    }
    for (let i = 0; i < this.info_topics.length; i++) {
      this.subscribeToTopic(this.info_topics[i])
    }
    this.subscribeToTopic(this.availability_topic)
  }
  subscribeToTopic(topicToSubcribe) {
    mqttClient.subscribe(`${topicToSubcribe}`, () => {
      console.log(`Client subscribed on ${topicToSubcribe}`)
    })
  }
  getDeviceInfo() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/STATUS`, '5')
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(`${this.mqtt_name}/ip/get`, '')
      // this.sendMqttReq(`${this.mqtt_name}/mac/get`, '')  //the mac is sended only on boot --this is an issue that it cant be interogated
    }
  }
  processDeviceInfoMessage(topic, payload) {
    let value = payload.toString()
    if (topic == this.availability_topic) {
      if (value.toUpperCase() == 'ONLINE') {
        this.available = true
      } else {
        this.available = false
      }
    } else {
      if (value === '') {
        this.available = false
      } else {
        this.available = true
      }
      if (this.info_topics.includes(topic)) {
        if (this.manufacter == 'tasmota') {
          const info = JSON.parse(value)
          this.MAC = info.StatusNET.Mac
          this.IP = info.StatusNET.IPAddress
        } else if (this.manufacter == 'openBeken') {
          let buffer = topic.split('/')
          switch (buffer[1]) {
            case 'ip':
              this.IP = value
              break
            case 'mac':
              this.MAC = value
              break
            default:
              break
          }
        }
      }
    }
  }
  sendMqttReq(topic, payload) {
    mqttClient.publish(topic, payload, { qos: 0, retain: false }, (error) => {
      if (error) {
        console.log(error)
      }
    })
  }
  sendWithSocket(io) {
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}

module.exports = Device
