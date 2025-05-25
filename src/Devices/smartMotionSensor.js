const Device = require('./device')
let autoOffTimeoutInstance = undefined
class SmartMotionSensor extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.auto_off = devDataAttr.auto_off || false
    this.attributes.status = 'OFF'
    this.attributes.battery_level = devDataAttr.battery_level || 0
    if (this.connection_type === 'zigbee') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `stat/${this.mqtt_name}/POWER`
    } else if (this.connection_type === 'wifi') {
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
  }
  initDevice() {
    if (this.connection_type === 'zigbee') {
      this.subscribeToTopic(this.attributes.receive_status_topic)
    } else if (this.connection_type === 'wifi') {
      this.subscribeToTopic(this.attributes.receive_status_topic)
      this.subscribeToTopic(this.attributes.receive_batt_topic)
    }
    this.getInitialState()
  }
  getInitialState() {
    if (this.connection_type === 'zigbee') {
      this.sendMqttReq(this.attributes.receive_status_topic, 'OFF')
    } else if (this.connection_type === 'wifi') {
      if (this.manufacter == 'tasmota') {
        this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
        //Battery topic TODO
      } else if (this.manufacter == 'openBeken') {
        this.sendMqttReq(this.attributes.receive_status_topic, '')
        this.sendMqttReq(this.attributes.receive_batt_topic, '')
      }
    }
  }
  sendAutoOffCommand(io) {
    if (this.manufacter == 'tasmota')
      this.sendMqttReq(this.attributes.receive_status_topic, 'OFF')
    else if (this.manufacter == 'openBeken')
      this.sendMqttReq(this.attributes.receive_status_topic, '0')

    this.attributes.status = 'OFF'
    this.sendWithSocket(io)
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (this.connection_type === 'zigbee') {
      if (topic === this.attributes.receive_result_topic) {
        const deviceResult = JSON.parse(value)
        if (deviceResult?.Movement !== undefined) {
          const movement = deviceResult?.Movement
          const oldStatus = this.attributes.status
          if (movement == 'ON' || movement == '1') {
            this.attributes.status = 'ON'
            if (autoOffTimeoutInstance) {
              clearTimeout(autoOffTimeoutInstance)
              autoOffTimeoutInstance = null
            }
            autoOffTimeoutInstance = setTimeout(() => {
              this.sendAutoOffCommand(io)
            }, 10000)
          } else if (movement == 'OFF' || movement == '0')
            this.attributes.status = 'OFF'

          if (oldStatus !== this.attributes.status) {
            this.sendMqttReq(
              this.attributes.receive_status_topic,
              this.attributes.status
            )
          }
        }
      }
    } else if (this.connection_type === 'wifi') {
      if (topic === this.attributes.receive_status_topic) {
        if (value == 'ON' || value == '1') {
          this.attributes.status = 'ON'
          // the auto off is comented becouse a pir sensor is sending OFF message after auto off command
          // if (autoOffTimeoutInstance) {
          //   clearTimeout(autoOffTimeoutInstance)
          //   autoOffTimeoutInstance = null
          // }
          // autoOffTimeoutInstance = setTimeout(() => {
          //   this.sendAutoOffCommand(io)
          // }, 45000)
        } else if (value == 'OFF' || value == '0') {
          this.attributes.status = 'OFF'
          if (autoOffTimeoutInstance) {
            clearTimeout(autoOffTimeoutInstance)
            autoOffTimeoutInstance = null
          }
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
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartMotionSensor
