const Device = require('./device')

class SmartTempSensor extends Device {
  constructor({
    id,
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    favorite,
    attributes = {},
  }) {
    super(
      id,
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartTempSensor',
      true,
      true,
      favorite
    )
    this.temperature = attributes.temperature ? attributes.temperature : 0
    this.humidity = attributes.humidity ? attributes.humidity : 0
    this.battery_level = attributes.battery_level ? attributes.battery_level : 0
    if (img === '') {
      this.img =
        'https://www.expert4house.com/1176-large_default/tuya-zigbee-temperature-and-humidity-sensor.jpg'
    }
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.receive_temp_topic = `${mqtt_name}/1/get`
      this.receive_hum_topic = `${mqtt_name}/2/get`
      this.receive_batt_topic = `${mqtt_name}/3/get`
    }
  }
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    this.subscribeToTopic(mqtt_client, this.receive_temp_topic)
    this.subscribeToTopic(mqtt_client, this.receive_hum_topic)
    this.subscribeToTopic(mqtt_client, this.receive_batt_topic)
    this.get_device_info(mqtt_client)
    this.get_initial_state(mqtt_client)
  }
  get_initial_state(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/1/get`, '')
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/2/get`, '')
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/3/get`, '')
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic === this.receive_temp_topic) {
      this.temperature = Number(value) / 10
    } else if (topic === this.receive_hum_topic) {
      this.humidity = Number(value)
    } else if (topic === this.receive_batt_topic) {
      this.battery_level = Number(value)
    }
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartTempSensor
