const Device = require('./device')
const { mqttClient } = require('../mqttClient')
class SmartTempSensor extends Device {
  constructor({
    id,
    name,
    img,
    user_id,
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
      user_id,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartTempSensor',
      false,
      false,
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
  initDevice() {
    this.subscribeForDeviceInfo(mqttClient)
    this.subscribeToTopic(mqttClient, this.receive_temp_topic)
    this.subscribeToTopic(mqttClient, this.receive_hum_topic)
    this.subscribeToTopic(mqttClient, this.receive_batt_topic)
    this.getDeviceInfo(mqttClient)
    this.getInitialState(mqttClient)
  }
  getInitialState(mqttClient) {
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(mqttClient, `${this.mqtt_name}/1/get`, '')
      this.sendMqttReq(mqttClient, `${this.mqtt_name}/2/get`, '')
      this.sendMqttReq(mqttClient, `${this.mqtt_name}/3/get`, '')
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
