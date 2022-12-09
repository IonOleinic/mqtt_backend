const Device = require('./device')

class SmartIR extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group, PRESET) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartIR',
      'STATUS5',
      'MAC',
      'IP',
      false
    )
    this.receive_topic = `${mqtt_name}/ir/get`
    this.repeats = '1'
    this.bits = PRESET.bits
    this.cmnd_topic = `cmnd/${mqtt_name}/IRSend`
    this.IR_protocol = PRESET.protocol
    this.buttons = {}
    if (PRESET.buttons) {
      for (let i = 0; i < PRESET.buttons.length; i++) {
        this.buttons[`${PRESET.buttons[i].name}`] = PRESET.buttons[i].code
      }
    }
  }
  pressButton(client, btn_code) {
    if (btn_code) {
      client.publish(
        `${this.cmnd_topic}`,
        `${this.IR_protocol} ${this.bits} ${btn_code} ${this.repeats}`,
        { qos: 0, retain: false },
        (error) => {
          if (error) {
            console.log(error)
          }
        }
      )
    }
  }
}
module.exports = SmartIR
