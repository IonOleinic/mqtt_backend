const Device = require('./device')

class SmartLed extends Device {
  constructor(
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    sub_type = 'ledStrip',
    led_type = 'rgb'
  ) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartLed',
      false,
      false
    )
    if (img === '') {
      if (sub_type === 'ledStrip') {
        this.img =
          'https://www.geewiz.co.za/190600-large_default/mini-rgb-wifi-led-controller-works-with-alexa-and-google-home.jpg'
      } else {
        if (led_type.includes('rgb')) {
          this.img =
            'https://m.media-amazon.com/images/W/IMAGERENDERING_521856-T1/images/I/51nUiLbAoML.jpg'
        } else {
          this.img =
            'https://5.imimg.com/data5/YT/QF/BN/SELLER-71396138/led-bulb-raw-material-250x250.jpg'
        }
      }
    }

    this.led_type = led_type
    this.sub_type = sub_type
    this.color = '555555'
    this.dimmer = 100
    this.speed = 1
    this.scheme = '0'
    this.status = 'OFF'
    this.palette = ['', '', '', '', '']
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
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Palette`, '')
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Speed`, '')
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Scheme`, '')
    } else {
      // this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/1/get`, '')
    }
  }
  send_change_color(mqtt_client, color) {
    if (this.speed != 1) {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Color`, color)
    let temp = this.speed.toString()
    setTimeout(() => {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Speed`, temp)
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Scheme`, '')
    }, 10)
  }
  send_change_dimmer(mqtt_client, dimmer) {
    if (this.speed != 1) {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Dimmer`, dimmer)
    let temp = this.speed.toString()
    setTimeout(() => {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Speed`, temp)
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Scheme`, '')
    }, 10)
  }
  send_change_speed(mqtt_client, speed) {
    this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Speed`, speed)
  }
  send_change_scheme(mqtt_client, scheme) {
    this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Scheme`, scheme)
  }
  send_change_power(mqtt_client, power) {
    if (this.speed != 1) {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/POWER`, power)
    let temp = this.speed.toString()
    setTimeout(() => {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/Speed`, temp)
    }, 10)
  }
  send_change_palette(mqtt_client, palette) {
    this.send_mqtt_req(
      mqtt_client,
      `cmnd/${this.mqtt_name}/Palette`,
      palette.toString().replaceAll(',', ' ')
    )
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
      if (result.Palette != undefined) {
        let temp = result.Palette.replaceAll('[', '')
          .replaceAll(']', '')
          .split(',')
        for (let i = 0; i < 5; i++) {
          if (temp[i]) {
            this.palette[i] = temp[i]
          } else {
            this.palette[i] = ''
          }
        }
      }
      if (result.Speed != undefined) {
        this.speed = Number(result.Speed)
      }
      if (result.Scheme != undefined) {
        this.scheme = result.Scheme
      }
    }
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartLed
