const Device = require('./device')
class SmartLed extends Device {
  constructor(deviceData) {
    super(deviceData)
    const {
      led_type,
      sub_type,
      color,
      scheme,
      dimmer,
      speed,
      status,
      palette,
    } = deviceData.attributes
    this.led_type = led_type || 'rgb'
    this.sub_type = sub_type || 'ledStrip'
    this.color = color || '555555'
    this.dimmer = dimmer || 100
    this.speed = speed || 1
    this.scheme = scheme || '0'
    this.status = status || 'OFF'
    this.palette = palette || ['', '', '', '', '']
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

  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.receive_result_topic)
    this.subscribeToTopic(this.receive_status_topic)
    this.subscribeToTopic(this.receive_dimmer_topic)
    if (this.led_type.includes('rgb')) {
      this.subscribeToTopic(this.receive_color_topic)
    }
    this.getDeviceInfo()
    this.setLastState()
  }

  setLastState() {
    this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, this.status)
    if (this.led_type.includes('rgb')) {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.speed)
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Color`, this.color)
      if (this.manufacter == 'tasmota') {
        this.sendChangePalette(this.palette)
        this.sendMqttReq(`cmnd/${this.mqtt_name}/Scheme`, this.scheme)
      }
    }
    this.sendMqttReq(`cmnd/${this.mqtt_name}/Dimmer`, this.dimmer)
  }
  stopPallete() {
    // this.sendChangeScheme(0)
  }
  sendChangeColor(color) {
    if (this.speed != 1) {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, '1')
    }
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Color`, color)
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/led_basecolor_rgbcw`, color)
    }
    setTimeout(() => {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.speed)
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Scheme`, '')
    }, 10)
  }
  sendChangeDimmer(dimmer) {
    if (this.speed != 1) {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.sendMqttReq(`cmnd/${this.mqtt_name}/Dimmer`, dimmer)
    setTimeout(() => {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.speed)
    }, 10)
  }
  sendChangeSpeed(speed) {
    this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, speed)
  }
  sendChangeScheme(scheme) {
    this.sendMqttReq(`cmnd/${this.mqtt_name}/Scheme`, scheme)
  }
  sendChangePower(power) {
    if (this.speed != 1) {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, power)
    setTimeout(() => {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.speed)
    }, 10)
  }
  sendChangePalette(palette) {
    this.sendMqttReq(
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
      if (result.Dimmer) {
        this.dimmer = result.Dimmer
      }
      if (result.Speed) {
        this.speed = Number(result.Speed)
      }
      if (this.manufacter == 'tasmota') {
        if (result.Color) {
          this.color = result.Color
          this.stopPallete()
        }
        if (result.Palette) {
          this.palette = result.Palette.replaceAll('[', '')
            .replaceAll(']', '')
            .split(',')
            .map((item) => item)
          while (this.palette.length < 5) {
            this.palette.push('')
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
    this.sendWithSocket(io)
  }
}
module.exports = SmartLed
