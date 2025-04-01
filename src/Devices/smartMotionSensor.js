const Device = require('./device')
let timeout_instance = undefined
class SmartMotionSensor extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.auto_off = devDataAttr.auto_off || false
    this.attributes.status = devDataAttr.status || 'No Motion'
    this.attributes.battery_level = devDataAttr.battery_level || 0
    if (this.manufacter == 'tasmota') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `stat/${this.mqtt_name}/POWER`
    } else if (this.manufacter == 'openBeken') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `${this.mqtt_name}/1/get`
      this.attributes.receive_batt_topic =
        devDataAttr.receive_batt_topic || `${this.mqtt_name}/4/get`
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.attributes.receive_status_topic)
    this.subscribeToTopic(this.attributes.receive_batt_topic)
    this.getDeviceInfo()
    this.getInitialState()
  }
  getInitialState() {
    if (this.manufacter == 'tasmota') {
      if (!this.attributes.status)
        this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
      //Battery topic TODO
    } else if (this.manufacter == 'openBeken') {
      if (!this.attributes.status)
        this.sendMqttReq(this.attributes.receive_status_topic, '')
      if (!this.attributes.battery_level)
        this.sendMqttReq(this.attributes.receive_batt_topic, '')
    }
  }

  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic === this.attributes.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.attributes.status = 'Motion'
        if (timeout_instance) {
          clearTimeout(timeout_instance)
          timeout_instance = null
        }
        if (this.attributes.auto_off == false) {
          this.attributes.auto_off = true
          timeout_instance = setTimeout(() => {
            if (this.attributes.status == 'Motion') {
              this.attributes.status = 'No Motion'
              this.sendWithSocket(io)
            }
          }, 40000)
        }
      } else if (value == 'OFF' || value == '0') {
        this.attributes.status = 'No Motion'
        this.attributes.auto_off = false
      }
    } else if (topic === this.attributes.receive_batt_topic) {
      let level = Number(value)
      if (level > 75) {
        this.attributes.battery_level = 3
      } else if (level < 75 && level > 50) {
        this.attributes.battery_level = 2
      } else if (level < 50 && level > 0) {
        this.attributes.battery_level = 1
      } else {
        this.attributes.battery_level = 0
      }
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartMotionSensor
