const Device = require('./device')

class ZbHub extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.connected_devices = []
    if (this.manufacter == 'tasmota') {
      this.attributes.receive_sensor_topic =
        devDataAttr.receive_sensor_topic || `tele/${this.mqtt_name}/SENSOR`
    } else if (this.manufacter == 'openBeken') {
      //TO DO
    }
  }
  initDevice() {
    this.subscribeToTopic(this.attributes.receive_sensor_topic)
  }
  checkForNewDevice(zbDevice) {
    let found = false
    for (let i = 0; i < this.attributes.connected_devices.length; i++) {
      if (this.attributes.connected_devices[i].Device === zbDevice.Device) {
        this.attributes.connected_devices[i] = {
          ...this.attributes.connected_devices[i],
          ...zbDevice,
        }
        found = true
        break
      }
    }
    if (!found) {
      this.attributes.connected_devices.push(zbDevice)
    }
  }
  removeDevice(zbDevice) {
    // TO DO
  }

  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    const value = payload.toString()
    if (topic === this.attributes.receive_sensor_topic) {
      const objValue = JSON.parse(value)
      const firstKey = Object.keys(objValue)[0]
      const deviceShortAddr = Object.keys(objValue[firstKey])[0]
      const deviceResult = objValue[firstKey][deviceShortAddr]
      const redirectTopic = `stat/zb_${deviceShortAddr}/RESULT`
      const redirectPayload = JSON.stringify(deviceResult)
      this.sendMqttReq(redirectTopic, redirectPayload)
      if (firstKey === 'ZbReceived') {
        // TO DO
      }
      if (firstKey === 'ZbInfo') {
        // TO DO
      }
      this.checkForNewDevice(deviceResult)
    }
    this.sendWithSocket(io)
  }
}
module.exports = ZbHub
