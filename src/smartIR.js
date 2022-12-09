const Device = require('./device')

class SmartIR extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group, btn_props) {
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
    this.bits = btn_props.bits
    this.cmnd_topic = `cmnd/${mqtt_name}/IRSend`
    this.IR_protocol = btn_props.protocol
    this.buttons = {}
    if (btn_props.buttons) {
      for (let i = 0; i < btn_props.buttons.length; i++) {
        this.buttons[`${btn_props.buttons[i].name}`] = btn_props.buttons[i].code
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
