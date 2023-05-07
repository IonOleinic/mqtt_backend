class Device {
  constructor(
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    device_type,
    battery,
    read_only
  ) {
    this.favorite = false
    this.id = Math.random().toString(18).slice(3)
    if (name === '') {
      this.name = 'Device ' + Math.random().toString(4).slice(4, 7)
    } else {
      this.name = name
    }
    this.manufacter = manufacter
    this.img =
      img === ''
        ? 'https://cdn-icons-png.flaticon.com/512/2948/2948319.png'
        : img
    this.battery = battery
    this.read_only = read_only
    this.mqtt_name = mqtt_name
    if (mqtt_group === '') {
      this.mqtt_group = []
    } else {
      this.mqtt_group = mqtt_group.replaceAll(',', ', ').split(',')
    }
    this.mqtt_group.splice(0, 0, 'General')
    this.device_type = device_type

    this.MAC = 'UNKNOWN'
    this.IP = 'UNKNOWN'
    this.date = new Date()
    this.available = false
  }
  subscribe_for_device_info(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      this.availability_topic = `tele/${this.mqtt_name}/LWT`
      this.tasmota_info_topic = `stat/${this.mqtt_name}/STATUS5`
      this.subscribeToTopic(mqtt_client, this.tasmota_info_topic)
      this.subscribeToTopic(mqtt_client, this.availability_topic)
    } else if (this.manufacter == 'openBeken') {
      this.availability_topic = `${this.mqtt_name}/connected`
      this.subscribeToTopic(mqtt_client, `${this.mqtt_name}/ip`)
      this.subscribeToTopic(mqtt_client, `${this.mqtt_name}/mac`)
      this.subscribeToTopic(mqtt_client, this.availability_topic)
    }
  }
  subscribeToTopic(mqtt_client, topic_to_subcribe) {
    mqtt_client.subscribe(`${topic_to_subcribe}`, () => {
      console.log(`Client subscribed on ${topic_to_subcribe}`)
    })
  }
  get_device_info(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/STATUS`, '5')
    } else if (this.manufacter == 'openBeken') {
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/ip/get`, '')
    }
  }
  processDeviceInfoMessage(topic, payload) {
    if (topic == this.availability_topic) {
      if (payload.toString().toUpperCase() == 'ONLINE') {
        this.available = true
      } else {
        this.available = false
      }
    }
    if (this.manufacter == 'tasmota') {
      if (topic === this.tasmota_info_topic) {
        const temp = JSON.parse(payload.toString())
        this.MAC = temp.StatusNET.Mac
        this.IP = temp.StatusNET.IPAddress
      }
    } else if (this.manufacter == 'openBeken') {
      if (topic === `${this.mqtt_name}/ip`) {
        this.IP = payload.toString()
      } else if (topic === `${this.mqtt_name}/mac`) {
        this.MAC = payload.toString()
      }
    }
  }
  send_mqtt_req(mqtt_client, topic, payload) {
    mqtt_client.publish(topic, payload, { qos: 0, retain: false }, (error) => {
      if (error) {
        console.log(error)
      }
    })
  }
}

module.exports = Device
