const Device = require('./device')

class SmartDoorSensor extends Device {
  constructor(deviceData) {
    super(deviceData)
    const { status, battery_level } = deviceData.attributes
    this.status = status ? status : 'Closed'
    this.battery_level = battery_level ? battery_level : 0
    if (this.manufacter == 'tasmota') {
      this.receive_status_topic = `stat/${this.mqtt_name}/POWER`
      //Battery topic TODO
    } else if (this.manufacter == 'openBeken') {
      this.receive_status_topic = `${this.mqtt_name}/1/get`
      this.receive_batt_topic = `${this.mqtt_name}/2/get`
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.receive_status_topic)
    this.getDeviceInfo()
    this.getInitialState()
  }
  getInitialState() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
    } else {
      this.sendMqttReq(`${this.mqtt_name}/1/get`, '')
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
    let value = payload.toString()
    if (topic === this.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.status = 'Opened'
      } else if (value == 'OFF' || value == '0') {
        this.status = 'Closed'
      }
    } else if (topic === this.receive_batt_topic) {
      this.battery_level = Number(value)
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartDoorSensor
