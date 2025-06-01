const Device = require('./device')

class ZbHub extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.connected_devices = devDataAttr.connected_devices || []
    this.attributes.pairingMode = devDataAttr.pairingMode || false
    if (this.manufacter == 'tasmota') {
      this.attributes.receive_sensor_topic =
        devDataAttr.receive_sensor_topic || `tele/${this.mqtt_name}/SENSOR`
      this.attributes.receive_result_topic =
        devDataAttr.receive_result_topic || `tele/${this.mqtt_name}/RESULT`
    } else if (this.manufacter == 'openBeken') {
      //TO DO
    }
  }
  initDevice() {
    this.subscribeToTopic(this.attributes.receive_sensor_topic)
    this.subscribeToTopic(this.attributes.receive_result_topic)
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
  zbRemoveDevice(shortAddr) {
    this.attributes.connected_devices =
      this.attributes.connected_devices.filter(
        (device) => device.Device !== shortAddr
      )
    if (this.attributes.pairingMode) {
      this.sendChangePairingMode(false)
    }
    this.sendMqttReq(`cmnd/${this.mqtt_name}/ZbLeave`, shortAddr)
    setTimeout(() => {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/ZbForget`, shortAddr)
    }, 3000)
    return this.attributes.connected_devices
  }
  sendChangePairingMode(pairingMode) {
    const topic = `cmnd/${this.mqtt_name}/ZbPermitJoin`
    let payload = 0
    if (pairingMode == true || pairingMode == 1) {
      payload = 1
    }
    this.sendMqttReq(topic, payload)
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    const value = payload.toString()
    if (topic === this.attributes.receive_sensor_topic) {
      const objValue = JSON.parse(value)
      const firstKey = Object.keys(objValue)[0]
      if (firstKey === 'ZbReceived' || firstKey === 'ZbInfo') {
        const deviceShortAddr = Object.keys(objValue[firstKey])[0]
        let deviceResult = objValue[firstKey][deviceShortAddr]
        const redirectTopic = `stat/zb_${deviceShortAddr}/RESULT`
        const redirectPayload = JSON.stringify(deviceResult)
        this.sendMqttReq(redirectTopic, redirectPayload)
        this.checkForNewDevice(deviceResult)
      }
    } else if (topic === this.attributes.receive_result_topic) {
      const objValue = JSON.parse(value)
      const firstKey = Object.keys(objValue)[0]
      if (firstKey === 'ZbState') {
        if (objValue.ZbState?.Status == 21) {
          this.attributes.pairingMode = true
        } else if (objValue.ZbState?.Status == 20) {
          this.attributes.pairingMode = false
        }
      }
    }
    this.sendWithSocket(io)
  }
}
module.exports = ZbHub
