const Device = require('./device')
class SmartTempSensor extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.temperature = devDataAttr.temperature || 0
    this.attributes.humidity = devDataAttr.humidity || 0
    this.attributes.battery_level = devDataAttr.battery_level || 0
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.attributes.receive_temp_topic =
        devDataAttr.receive_temp_topic || `${this.mqtt_name}/1/get`
      this.attributes.receive_hum_topic =
        devDataAttr.receive_hum_topic || `${this.mqtt_name}/2/get`
      this.attributes.receive_batt_topic =
        devDataAttr.receive_batt_topic || `${this.mqtt_name}/3/get`
    }
  }
  initDevice() {
    this.subscribeToTopic(this.attributes.receive_temp_topic)
    this.subscribeToTopic(this.attributes.receive_hum_topic)
    this.subscribeToTopic(this.attributes.receive_batt_topic)
    this.getInitialState()
  }
  getInitialState() {
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      if (!this.attributes.temperature)
        this.sendMqttReq(`${this.attributes.receive_temp_topic}`, '')
      if (!this.attributes.humidity)
        this.sendMqttReq(`${this.attributes.receive_hum_topic}`, '')
      if (!this.attributes.battery_level)
        this.sendMqttReq(`${this.attributes.receive_batt_topic}`, '')
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic === this.attributes.receive_temp_topic) {
      this.attributes.temperature = Number(value) / 10
    } else if (topic === this.attributes.receive_hum_topic) {
      this.attributes.humidity = Number(value)
    } else if (topic === this.attributes.receive_batt_topic) {
      let level = Number(value)
      if (level == 2) {
        this.attributes.battery_level = 3
      } else if (level == 1) {
        this.attributes.battery_level = 2
      } else if (level == 0) {
        this.attributes.battery_level = 1
      } else {
        this.attributes.battery_level = 0
      }
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartTempSensor
