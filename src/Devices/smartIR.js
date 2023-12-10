const Device = require('./device')
class SmartIR extends Device {
  constructor(deviceData) {
    super(deviceData)
    const { PRESET } = deviceData.attributes
    this.repeats = '1'
    this.IR_protocol = PRESET?.protocol
    this.buttons = {}
    let btns = PRESET?.buttons
    if (this.manufacter == 'tasmota') {
      this.cmnd_topic = `cmnd/${this.mqtt_name}/IRSend`
      this.receive_topic = `tele/${this.mqtt_name}/RESULT`
      this.bits = PRESET?.tasmotaBits
    } else if (this.manufacter == 'openBeken') {
      this.receive_topic = `${this.mqtt_name}/ir/get`
      this.cmnd_topic = `cmnd/${this.mqtt_name}/IRSend`
      this.bits = PRESET?.openBekenBits
    }
    if (btns) {
      for (let i = 0; i < btns.length; i++) {
        this.buttons[`${btns[i].name}`] = {
          code: btns[i].code,
          fullName: btns[i].fullName,
        }
      }
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.receive_topic)
    this.getDeviceInfo()
  }
  pressButton(btnCode) {
    if (btnCode) {
      let openBekenPayload = `${this.IR_protocol} ${this.bits} ${btnCode} ${this.repeats}`
      let tasmotaPayload = `{"Protocol":"${this.IR_protocol}", "Bits":${this.bits}, "Data":${btnCode}}`
      if (this.manufacter == 'tasmota') {
        this.sendMqttReq(`${this.cmnd_topic}`, tasmotaPayload)
      } else if (this.manufacter == 'openBeken') {
        this.sendMqttReq(`${this.cmnd_topic}`, openBekenPayload)
      }
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    this.sendWithSocket(io)
  }
}
module.exports = SmartIR
