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
    this.id = Math.random().toString(16).slice(3)
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
    if (manufacter == 'tasmota') {
      this.device_info_topic = `stat/${mqtt_name}/STATUS5`
    } else if (manufacter == 'openBeken') {
      this.device_info_topic = undefined
    }
    this.MAC = 'UNKNOWN'
    this.IP = 'UNKNOWN'
    this.date = new Date()
  }
  subscribe_for_device_info(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      this.subscribeToTopic(mqtt_client, this.device_info_topic)
    } else if (this.manufacter == 'openBeken') {
      this.subscribeToTopic(mqtt_client, `${this.mqtt_name}/ip`)
      this.subscribeToTopic(mqtt_client, `${this.mqtt_name}/mac`)
    }
  }
  subscribeToTopic(mqtt_client, topic_to_subcribe) {
    mqtt_client.subscribe(`${topic_to_subcribe}`, () => {
      console.log(`Client subscried on ${topic_to_subcribe}`)
    })
  }
  get_device_info(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      mqtt_client.publish(
        `cmnd/${this.mqtt_name}/STATUS`,
        `5`,
        { qos: 0, retain: false },
        (error) => {
          if (error) {
            console.log(error)
          }
        }
      )
    } else if (this.manufacter == 'openBeken') {
      //TODO
    }
  }
  processDeviceInfoMessage(topic, payload) {
    if (this.manufacter == 'tasmota') {
      if (topic === this.device_info_topic) {
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
