class Device {
  constructor(
    id,
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    device_type,
    battery,
    read_only,
    favorite
  ) {
    this.favorite = favorite ? favorite : false
    this.id = id ? id : Math.random().toString(18).slice(3)
    this.name = name ? name : 'Device ' + Math.random().toString(16).slice(2, 7)
    this.manufacter = manufacter
    this.img =
      img === ''
        ? 'https://cdn-icons-png.flaticon.com/512/2948/2948319.png'
        : img
    this.battery = battery ? battery : false
    this.read_only = read_only ? read_only : false
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
