const Device = require('./device')

class SmartDoorSensor extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.status = devDataAttr.status || 'Closed'
    this.attributes.battery_level = devDataAttr.battery_level || 0
    if (this.manufacter == 'tasmota') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `stat/${this.mqtt_name}/POWER`
      //Battery topic TODO
    } else if (this.manufacter == 'openBeken') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `${this.mqtt_name}/1/get`
      this.attributes.receive_batt_topic =
        devDataAttr.receive_batt_topic || `${this.mqtt_name}/2/get`
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.attributes.receive_status_topic)
    this.getDeviceInfo()
    this.getInitialState()
  }
  getInitialState() {
    if (this.manufacter == 'tasmota') {
      if (!this.attributes.status)
        this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
      //TODO for battery
    }
    if (this.manufacter == 'openBeken') {
      if (!this.attributes.status)
        this.sendMqttReq(this.attributes.receive_status_topic, '')
      if (!this.attributes.battery_level)
        this.sendMqttReq(this.attributes.receive_batt_topic, '')
    }
  }
  sendToggleReq() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, 'TOGGLE')
    } else {
      this.sendMqttReq(`${this.mqtt_name}/1/set`, 'TOGGLE')
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    const value = payload.toString()
    if (topic === this.attributes.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.attributes.status = 'Opened'
      } else if (value == 'OFF' || value == '0') {
        this.attributes.status = 'Closed'
      }
    } else if (topic === this.attributes.receive_batt_topic) {
      this.attributes.battery_level = Number(value)
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartDoorSensor
