const Device = require('./device')

class SmartIR extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group, device_info_topic,receive_topic=`${mqtt_name}/ir/get`) {
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
    this.receive_topic=receive_topic
    this.repeats = '1'
    this.bits = '0x1'
    this.cmnd_topic = `cmnd/${mqtt_name}/IRSend`
    this.IR_protocol = 'RC5'
    this.received_code = ''
    this.btn_power = '0xC'
    this.btn_ok = '0x35'
    this.btn_up = '0x14'
    this.btn_right = '0x16'
    this.btn_left = '0x15'
    this.btn_down = '0x13'
    this.btn_volUp = '0x10'
    this.btn_volDown = '0x11'
    this.btn_chnDown = '0x21'
    this.btn_chnUp = '0x20'
    this.btn_exit = '0x25'
    this.btn_mute = '0xD'
    this.btn_home = '0x30'
    this.btn_back = '0xA'
    this.btn_input = '0x38'
    this.btn_0 = '0x0'
    this.btn_1 = '0x1'
    this.btn_2 = '0x2'
    this.btn_3 = '0x3'
    this.btn_4 = '0x4'
    this.btn_5 = '0x5'
    this.btn_6 = '0x6'
    this.btn_7 = '0x7'
    this.btn_8 = '0x8'
    this.btn_9 = '0x9'
  }
  pressButton(client, btn_code) {
    if(btn_code){
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
