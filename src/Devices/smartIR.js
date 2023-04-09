const Device = require('./device')

class SmartIR extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group, PRESET) {
    super(name, img, manufacter, mqtt_name, mqtt_group, 'smartIR', false, false)
    if (img === '') {
      this.img =
        'https://www.expert4house.com/1281-large_default/tuya-smart-ir-rf-control-wifi-universal.jpg'
    }
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.receive_topic = `${mqtt_name}/ir/get`
      this.cmnd_topic = `cmnd/${mqtt_name}/IRSend`
    }
    this.repeats = '1'
    this.bits = PRESET.bits
    this.IR_protocol = PRESET.protocol
    this.buttons = {}
    if (PRESET.buttons) {
      for (let i = 0; i < PRESET.buttons.length; i++) {
        this.buttons[`${PRESET.buttons[i].name}`] = {
          code: PRESET.buttons[i].code,
          fullName: PRESET.buttons[i].fullName,
        }
      }
    }
  }
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    this.subscribeToTopic(mqtt_client, this.receive_topic)
    this.get_device_info(mqtt_client)
  }
  pressButton(mqtt_client, btn_code) {
    if (btn_code) {
      this.send_mqtt_req(
        mqtt_client,
        `${this.cmnd_topic}`,
        `${this.IR_protocol} ${this.bits} ${btn_code} ${this.repeats}`
      )
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
  }
}
module.exports = SmartIR
