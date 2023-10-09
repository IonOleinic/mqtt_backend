const Device = require('./device')

class SmartIR extends Device {
  constructor({
    id,
    name,
    img,
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
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    this.subscribeToTopic(mqtt_client, this.receive_topic)
    this.get_device_info(mqtt_client)
  }
  pressButton(mqtt_client, btn_code) {
    if (btn_code) {
      let openBekenPayload = `${this.IR_protocol} ${this.bits} ${btn_code} ${this.repeats}`
      let tasmotaPayload = `{"Protocol":"${this.IR_protocol}", "Bits":${this.bits}, "Data":${btn_code}}`
      if (this.manufacter == 'tasmota') {
        this.send_mqtt_req(mqtt_client, `${this.cmnd_topic}`, tasmotaPayload)
      } else if (this.manufacter == 'openBeken') {
        this.send_mqtt_req(mqtt_client, `${this.cmnd_topic}`, openBekenPayload)
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
