const Device = require('./device')
class SmartTempSensor extends Device {
  constructor(deviceData) {
    super(deviceData)
    const { temperature, humidity, battery_level } = deviceData.attributes
    this.temperature = temperature ? temperature : 0
    this.humidity = humidity ? humidity : 0
    this.battery_level = battery_level ? battery_level : 0
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.receive_temp_topic = `${this.mqtt_name}/1/get`
      this.receive_hum_topic = `${this.mqtt_name}/2/get`
      this.receive_batt_topic = `${this.mqtt_name}/3/get`
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.receive_temp_topic)
    this.subscribeToTopic(this.receive_hum_topic)
    this.subscribeToTopic(this.receive_batt_topic)
    this.getDeviceInfo()
    this.getInitialState()
  }
  getInitialState() {
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      // this.sendMqttReq(`${this.mqtt_name}/1/get`, '')
      // this.sendMqttReq(`${this.mqtt_name}/2/get`, '')
      // this.sendMqttReq(`${this.mqtt_name}/3/get`, '')
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
    this.sendWithSocket(io)
  }
}
module.exports = SmartTempSensor
