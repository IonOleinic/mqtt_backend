const Device = require('./device')
let timeout_instance = undefined
class SmartMotionSensor extends Device {
  constructor(deviceData) {
    super(deviceData)
    const { auto_off, status, battery_level } = deviceData.attributes
    this.auto_off = auto_off ? auto_off : false
    this.status = status ? status : 'No Motion'
    this.battery_level = battery_level ? battery_level : 0
    if (this.manufacter == 'tasmota') {
      this.receive_status_topic = `stat/${this.mqtt_name}/POWER`
    } else if (this.manufacter == 'openBeken') {
      this.receive_status_topic = `${this.mqtt_name}/1/get`
      this.receive_batt_topic = `${this.mqtt_name}/4/get`
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.receive_status_topic)
    this.subscribeToTopic(this.receive_batt_topic)
    this.getDeviceInfo()
    this.getInitialState()
  }
  getInitialState() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
      //Battery topic TODO
    } else {
      this.sendMqttReq(`${this.mqtt_name}/1/get`, '')
      this.sendMqttReq(`${this.mqtt_name}/4/get`, '')
    }
  }

  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic === this.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.status = 'Motion'
        if (timeout_instance) {
          clearTimeout(timeout_instance)
          timeout_instance = null
        }
        if (this.auto_off == false) {
          this.auto_off = true
          timeout_instance = setTimeout(() => {
            if (this.status == 'Motion') {
              this.status = 'No Motion'
              this.sendWithSocket(io)
            }
          }, 40000)
        }
      } else if (value == 'OFF' || value == '0') {
        this.status = 'No Motion'
        this.auto_off = false
      }
    } else if (topic === this.receive_batt_topic) {
      let level = Number(value)
      if (level > 75) {
        this.battery_level = 3
      } else if (level < 75 && level > 50) {
        this.battery_level = 2
      } else if (level < 50 && level > 0) {
        this.battery_level = 1
      } else {
        this.battery_level = 0
      }
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartMotionSensor
