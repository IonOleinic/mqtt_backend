class Device {
  constructor(
    id,
    name,
    img,
    user_id,
    manufacter,
    mqtt_name,
    mqtt_group,
    device_type,
    battery,
    read_only,
    favorite
  ) {
    this.user_id = user_id
    this.favorite = favorite
    this.id = id
    this.name = name
    this.manufacter = manufacter
    this.img = img
    this.battery = battery
    this.read_only = read_only
    this.mqtt_name = mqtt_name
    this.mqtt_group = mqtt_group ? mqtt_group.split(',') : []
    this.device_type = device_type
    this.MAC = 'UNKNOWN'
    this.IP = 'UNKNOWN'
    this.date = new Date()
    this.available = false
  }
  subscribeForDeviceInfo(mqttClient) {
    if (this.manufacter == 'tasmota') {
      this.availability_topic = `tele/${this.mqtt_name}/LWT`
      this.tasmota_info_topic = `stat/${this.mqtt_name}/STATUS5`
      this.subscribeToTopic(mqttClient, this.tasmota_info_topic)
      this.subscribeToTopic(mqttClient, this.availability_topic)
    } else if (this.manufacter == 'openBeken') {
      this.availability_topic = `${this.mqtt_name}/connected`
      this.subscribeToTopic(mqttClient, `${this.mqtt_name}/ip`)
      this.subscribeToTopic(mqttClient, `${this.mqtt_name}/mac`)
      this.subscribeToTopic(mqttClient, this.availability_topic)
    }
  }
  subscribeToTopic(mqttClient, topicToSubcribe) {
    mqttClient.subscribe(`${topicToSubcribe}`, () => {
      console.log(`Client subscribed on ${topicToSubcribe}`)
    })
  }
  getDeviceInfo(mqttClient) {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/STATUS`, '5')
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(mqttClient, `${this.mqtt_name}/ip/get`, '')
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
      if (this.manufacter == 'tasmota') {
        if (topic === this.tasmota_info_topic) {
          const temp = JSON.parse(value)
          this.MAC = temp.StatusNET.Mac
          this.IP = temp.StatusNET.IPAddress
        }
      } else if (this.manufacter == 'openBeken') {
        if (topic === `${this.mqtt_name}/ip`) {
          this.IP = value
        } else if (topic === `${this.mqtt_name}/mac`) {
          this.MAC = value
        }
      }
    }
  }
  sendMqttReq(mqttClient, topic, payload) {
    mqttClient.publish(topic, payload, { qos: 0, retain: false }, (error) => {
      if (error) {
        console.log(error)
      }
    })
  }
}

module.exports = Device
