const Device = require('./device')

class SmartIR extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group, device_info_topic) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartIR',
      device_info_topic,
      'MAC',
      'IP',
      false
    )
    this.repeats = '1'
    this.bits = '1'
    this.cmnd_topic = `cmnd/${mqtt_name}/IRSend`
    this.IR_protocol = 'RC5'
    this.received_Code = ''
    this.btn_power = 'C'
    this.btn_ok = '35'
    this.btn_up = '14'
    this.btn_right = '16'
    this.btn_left = '15'
    this.btn_down = '13'
    this.btn_volUp = '10'
    this.btn_volDown = '11'
    this.btn_chnDown = '21'
    this.btn_chnUp = '20'
    this.btn_exit = '25'
    this.btn_mute = 'D'
    this.btn_home = '30'
    this.btn_back = 'A'
    this.btn_input = '38'
    this.btn_0 = '0'
    this.btn_1 = '1'
    this.btn_2 = '2'
    this.btn_3 = '3'
    this.btn_4 = '4'
    this.btn_5 = '5'
    this.btn_6 = '6'
    this.btn_7 = '7'
    this.btn_8 = '8'
    this.btn_9 = '9'
  }
  pressButton(client, btn_code) {
    client.publish(
      `${this.cmnd_topic}`,
      `${this.IR_protocol}-${this.bits}-${btn_code}-${this.repeats}`,
      { qos: 0, retain: false },
      (error) => {
        if (error) {
          console.log(error)
        }
      }
    )
  }
}
module.exports = SmartIR
