const Device = require('./device')
class SmartIR extends Device {
  constructor({
    id,
    name,
    img,
    user_id,
    manufacter,
    mqtt_name,
    mqtt_group,
    favorite,
    attributes = {},
  }) {
    super(
      id,
      name,
      img,
      user_id,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartIR',
      false,
      false,
      favorite
    )
    this.repeats = '1'
    this.IR_protocol = attributes.PRESET.protocol
    this.buttons = {}
    let btns = attributes.PRESET.buttons
    if (this.manufacter == 'tasmota') {
      this.cmnd_topic = `cmnd/${mqtt_name}/IRSend`
      this.receive_topic = `tele/${mqtt_name}/RESULT`
      this.bits = attributes.PRESET.tasmotaBits
    } else if (this.manufacter == 'openBeken') {
      this.receive_topic = `${mqtt_name}/ir/get`
      this.cmnd_topic = `cmnd/${mqtt_name}/IRSend`
      this.bits = attributes.PRESET.openBekenBits
    }
    if (btns) {
      for (let i = 0; i < btns.length; i++) {
        this.buttons[`${btns[i].name}`] = {
          code: btns[i].code,
          fullName: btns[i].fullName,
        }
      }
    }
    if (img === '') {
      this.img =
        'https://www.expert4house.com/1281-large_default/tuya-smart-ir-rf-control-wifi-universal.jpg'
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
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartIR
