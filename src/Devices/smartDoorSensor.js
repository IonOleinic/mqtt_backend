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
    this.subscribeToTopic(this.attributes.receive_status_topic)
    this.getInitialState()
  }
  getInitialState() {
    if (this.connection_type === 'zigbee') {
      this.sendMqttReq(this.attributes.receive_status_topic, 'OFF')
    } else if (this.connection_type === 'wifi') {
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
    if (this.connection_type === 'zigbee') {
      if (topic === this.attributes.receive_result_topic) {
        const deviceResult = JSON.parse(value)
        if (deviceResult?.Contact !== undefined) {
          const contact = deviceResult?.Contact
          if (contact == 'ON' || contact == '1') this.attributes.status = 'ON'
          else if (contact == 'OFF' || contact == '0')
            this.attributes.status = 'OFF'
          this.sendMqttReq(
            this.attributes.receive_status_topic,
            this.attributes.status
          )
        }
      }
    } else if (this.connection_type === 'wifi') {
      if (topic === this.attributes.receive_status_topic) {
        if (value == 'ON' || value == '1') {
          this.attributes.status = 'Opened'
        } else if (value == 'OFF' || value == '0') {
          this.attributes.status = 'Closed'
        }
      } else if (topic === this.attributes.receive_batt_topic) {
        this.attributes.battery_level = Number(value)
      }
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartDoorSensor
