const Device = require('./device')
class SmartIR extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.preset = devDataAttr.preset || {
      buttons: {},
      protocol: '',
      bits: '',
    }
    this.attributes.cmnd_topic =
      devDataAttr.cmnd_topic || `cmnd/${this.mqtt_name}/IRSend`
    if (this.manufacter == 'tasmota') {
      this.attributes.original_receive_topic =
        devDataAttr.original_receive_topic || `tele/${this.mqtt_name}/RESULT`
      this.attributes.receive_topic =
        devDataAttr.receive_topic || `stat/${this.mqtt_name}/IrReceived`
    } else if (this.manufacter == 'openBeken') {
      this.attributes.receive_topic =
        devDataAttr.receive_topic || `${this.mqtt_name}/ir/get`
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.attributes.original_receive_topic)
    this.subscribeToTopic(this.attributes.receive_topic)
    this.getDeviceInfo()
  }
  pressButton(btnCode) {
    if (btnCode) {
      const openBekenPayload = `${this.attributes.protocol} ${this.attributes.bits} ${btnCode} ${this.attributes.repeats}`
      const tasmotaPayload = `{"Protocol":"${this.attributes.protocol}", "Bits":${this.attributes.bits}, "Data":${btnCode}}`
      if (this.manufacter == 'tasmota') {
        this.sendMqttReq(`${this.attributes.cmnd_topic}`, tasmotaPayload)
      } else if (this.manufacter == 'openBeken') {
        this.sendMqttReq(`${this.attributes.cmnd_topic}`, openBekenPayload)
      }
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    // retransmit message (IR Receive) to `stat/${this.mqtt_name}/RESULT`
    //for solving tasmota set conditionalPayload issue (removing time from payload)
    if (this.manufacter == 'tasmota') {
      const value = payload.toString()
      if (topic == this.attributes.original_receive_topic) {
        const newPayload = JSON.parse(value)?.IrReceived
        if (newPayload) {
          this.sendMqttReq(
            this.attributes.receive_topic,
            JSON.stringify(newPayload)
          )
        }
      }
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartIR
