const { mqttClient } = require('../mqtt/mqttClient')
class Device {
  constructor({
    id,
    name,
    user_id,
    manufacter,
    mqtt_name,
    group_name,
    group_id,
    device_type,
    sub_type,
    favorite,
    is_deleted,
    createdAt,
    updatedAt,
    attributes,
  }) {
    this.user_id = user_id
    this.favorite = favorite
    this.is_deleted = is_deleted
    this.id = id
    this.name = name
    this.manufacter = manufacter
    this.battery = [
      'smartTempSensor',
      'smartDoorSensor',
      'smartSirenAlarm',
      'smartMotionSensor',
    ].includes(device_type)
      ? true
      : false
    //todo receive battery topic
    //add batery field in database
    this.read_only = [
      'smartTempSensor',
      'smartDoorSensor',
      'smartMotionSensor',
    ].includes(device_type)
      ? true
      : false
    this.mqtt_name = mqtt_name
    this.group_id = group_id
    this.group_name = group_name
    this.device_type = device_type
    this.sub_type = sub_type
    this.MAC = 'UNKNOWN'
    this.IP = 'UNKNOWN'
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.available = false
    this.attributes = attributes || {}
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
    this.info_topics.forEach((topic) => {
      this.subscribeToTopic(topic)
    })
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
        if (this.available === false) {
          this.available = true
          // if (this.getInitialState) this.getInitialState()  //the issue is that the requests are sending in infinite loop
          if (this.setLastState) this.setLastState()
        }
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
  sendMqttReq(topic, payload, retain = false) {
    mqttClient.publish(
      topic,
      payload.toString(),
      { qos: 0, retain: retain },
      (error) => {
        if (error) {
          console.log(error)
        }
      }
    )
  }
  sendWithSocket(io) {
    if (io) {
      io.emit('update_device', {
        device: { ...this, sensor_update_interval_id: undefined },
      })
    }
  }
  clearIntervals() {
    // clear intervals
  }
  destroy() {
    // destroy device
  }
}

module.exports = Device
