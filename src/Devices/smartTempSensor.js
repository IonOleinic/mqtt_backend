const Device = require('./device')

class SmartTempSensor extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartTempSensor',
      true,
      true
    )
    if (img === '') {
      this.img =
        'https://www.expert4house.com/1176-large_default/tuya-zigbee-temperature-and-humidity-sensor.jpg'
    }
    this.temperature = 0
    this.humidity = 0
    this.battery_level = 0
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
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    if (topic === this.receive_temp_topic) {
      this.temperature = Number(payload.toString()) / 10
    } else if (topic === this.receive_hum_topic) {
      this.humidity = Number(payload.toString())
    } else if (topic === this.receive_batt_topic) {
      this.battery_level = Number(payload.toString())
    } else if (topic === this.device_info_topic) {
      const temp = JSON.parse(payload.toString())
      this.MAC = temp.StatusNET.Mac
      this.IP = temp.StatusNET.IPAddress
    }
  }
}
module.exports = SmartTempSensor
