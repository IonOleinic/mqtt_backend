const Device = require('./device')

class SmartIR extends Device {
  constructor(
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    PRESET,
    favorite = false
  ) {
    super(
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
        this.buttons[`${PRESET.buttons[i].name}`] = PRESET.buttons[i].code
      }
    }
  }
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    this.subscribeToTopic(mqtt_client, this.receive_topic)
    this.get_device_info(mqtt_client)
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
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
  }
}
module.exports = SmartIR
