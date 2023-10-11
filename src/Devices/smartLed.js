const Device = require('./device')

class SmartLed extends Device {
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
      'smartLed',
      false,
      false,
      favorite
    )
    this.led_type = attributes.led_type ? attributes.led_type : 'rgb'
    this.sub_type = attributes.sub_type ? attributes.sub_type : 'ledStrip'
    this.color = attributes.color ? attributes.color : '555555'
    this.dimmer = attributes.dimmer ? attributes.dimmer : 100
    this.speed = attributes.speed ? attributes.speed : 1
    this.scheme = attributes.scheme ? attributes.scheme : '0'
    this.status = attributes.status ? attributes.status : 'OFF'
    this.palette = attributes.palette
      ? attributes.palette.split(' ')
      : ['', '', '', '', '']
    if (img) {
      this.img = img
    } else {
      if (this.sub_type === 'ledStrip') {
        this.img =
          'https://www.geewiz.co.za/190600-large_default/mini-rgb-wifi-led-controller-works-with-alexa-and-google-home.jpg'
      } else {
        if (this.led_type.includes('rgb')) {
          this.img =
            'https://www.hicolead.com/cdn/shop/products/18.png?v=1666423551&width=1039'
        } else {
          this.img =
            'https://5.imimg.com/data5/YT/QF/BN/SELLER-71396138/led-bulb-raw-material-250x250.jpg'
        }
      }
    }
    if (this.manufacter == 'tasmota') {
      this.receive_result_topic = `stat/${this.mqtt_name}/RESULT`
      this.receive_status_topic = `stat/${this.mqtt_name}/POWER`
      this.receive_dimmer_topic = `stat/${this.mqtt_name}/Dimmer`
      if (this.led_type.includes('rgb')) {
        this.receive_color_topic = `stat/${this.mqtt_name}/Color`
      }
    } else if (this.manufacter == 'openBeken') {
      this.receive_result_topic = `stat/${this.mqtt_name}/RESULT`
      this.receive_dimmer_topic = `${this.mqtt_name}/led_dimmer/get`
      this.receive_status_topic = `${this.mqtt_name}/led_enableAll/get`
      if (this.led_type.includes('rgb')) {
        if (this.led_type == 'rgb') {
          this.receive_color_topic = `${this.mqtt_name}/led_basecolor_rgb/get`
        } else if (this.led_type == 'rgbcw') {
          this.receive_color_topic = `${this.mqtt_name}/led_finalcolor_rgbcw/get`
        }
      }
    }
  }
  initDevice(mqtt_client) {
    this.subscribeForDeviceInfo(mqtt_client)
    this.subscribeToTopic(mqtt_client, this.receive_result_topic)
    this.subscribeToTopic(mqtt_client, this.receive_status_topic)
    this.subscribeToTopic(mqtt_client, this.receive_dimmer_topic)
    if (this.led_type.includes('rgb')) {
      this.subscribeToTopic(mqtt_client, this.receive_color_topic)
    }
    this.getDeviceInfo(mqtt_client)
    this.getInitialState(mqtt_client)
    this.sendChangePalette(mqtt_client, this.palette)
  }
  getInitialState(mqttClient) {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/POWER`, '')
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Dimmer`, '')
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Speed`, '')
      if (this.led_type.includes('rgb')) {
        this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Color`, '')
        this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Palette`, '')
        this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Scheme`, '')
      }
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/POWER`, '')
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Dimmer`, '')
      if (this.led_type.includes('rgb')) {
        this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Color`, '')
      }
    }
  }
  sendChangeColor(mqttClient, color) {
    if (this.speed != 1) {
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Speed`, '1')
    }
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Color`, color)
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(
        mqttClient,
        `cmnd/${this.mqtt_name}/led_basecolor_rgbcw`,
        color
      )
    }
    let temp = this.speed.toString()
    setTimeout(() => {
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Speed`, temp)
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Scheme`, '')
    }, 10)
  }
  sendChangeDimmer(mqttClient, dimmer) {
    if (this.speed != 1) {
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Dimmer`, dimmer)
    setTimeout(() => {
      this.sendMqttReq(
        mqttClient,
        `cmnd/${this.mqtt_name}/Speed`,
        this.speed.toString()
      )
    }, 10)
  }
  sendChangeSpeed(mqttClient, speed) {
    this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Speed`, speed)
  }
  sendChangeScheme(mqttClient, scheme) {
    this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Scheme`, scheme)
  }
  sendChangePower(mqttClient, power) {
    if (this.speed != 1) {
      this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.sendMqttReq(mqttClient, `cmnd/${this.mqtt_name}/POWER`, power)
    setTimeout(() => {
      this.sendMqttReq(
        mqttClient,
        `cmnd/${this.mqtt_name}/Speed`,
        this.speed.toString()
      )
    }, 10)
  }
  sendChangePalette(mqttClient, palette) {
    this.sendMqttReq(
      mqttClient,
      `cmnd/${this.mqtt_name}/Palette`,
      palette.toString().split(',').join(' ')
    )
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic == this.receive_result_topic) {
      let result = JSON.parse(value)
      if (result.POWER) {
        this.status = result.POWER
      }
      if (result.Dimmer != undefined) {
        this.dimmer = result.Dimmer
      }
      if (result.Speed != undefined) {
        this.speed = Number(result.Speed)
      }
      if (this.manufacter == 'tasmota') {
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
        if (result.Scheme != undefined) {
          this.scheme = result.Scheme
        }
      }
    } else if (topic === this.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.status = 'ON'
      } else if (value == 'OFF' || value == '0') {
        this.status = 'OFF'
      }
    } else if (topic === this.receive_color_topic) {
      this.color = value
    } else if (topic === this.receive_dimmer_topic) {
      this.dimmer = value
    }
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartLed
