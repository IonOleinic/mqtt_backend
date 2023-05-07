const Device = require('./device')

class SmartBulb extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group, bulb_type = 'rgb') {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartBulb',
      false,
      false
    )
    if (img === '') {
      if (bulb_type.includes('rgb')) {
        this.img =
          'https://m.media-amazon.com/images/W/IMAGERENDERING_521856-T1/images/I/51nUiLbAoML.jpg'
      } else {
        this.img =
          'https://5.imimg.com/data5/YT/QF/BN/SELLER-71396138/led-bulb-raw-material-250x250.jpg'
      }
    }
    this.bulb_type = bulb_type
    this.color = '555555'
    this.dimmer = 100
    this.status = 'OFF'
    if (this.manufacter == 'tasmota') {
      this.receive_result_topic = `stat/${this.mqtt_name}/RESULT`
      this.receive_status_topic = `stat/${this.mqtt_name}/POWER`
      this.receive_color_topic = `stat/${this.mqtt_name}/Color`
      this.receive_dimmer_topic = `stat/${this.mqtt_name}/Dimmer`
    } else if (this.manufacter == 'openBeken') {
      //TODO
      // this.receive_result_topic = `stat/${this.mqtt_name}/RESULT`
    }
  }
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    this.subscribeToTopic(mqtt_client, this.receive_result_topic)
    this.subscribeToTopic(mqtt_client, this.receive_status_topic)
    this.subscribeToTopic(mqtt_client, this.receive_color_topic)
    this.subscribeToTopic(mqtt_client, this.receive_dimmer_topic)
    this.get_device_info(mqtt_client)
    this.get_initial_state(mqtt_client)
  }
  get_initial_state(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/POWER`, '')
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Color`, '')
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Dimmer`, '')
    } else {
      // this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/1/get`, '')
    }
  }
  send_change_color(mqtt_client, color) {
    this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Color`, color)
  }
  send_change_dimmer(mqtt_client, dimmer) {
    this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Dimmer`, dimmer)
  }
  send_change_power(mqtt_client, power) {
    this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/POWER`, power)
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    if (topic == this.receive_result_topic) {
      let result = JSON.parse(payload.toString())
      if (result.POWER) {
        this.status = result.POWER
      }
      if (result.Dimmer != undefined) {
        this.dimmer = result.Dimmer
      }
      if (result.Color != undefined) {
        this.color = result.Color
      }
    }
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartBulb
