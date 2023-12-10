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
    this.led_type = led_type ? led_type : 'rgb'
    this.sub_type = sub_type ? sub_type : 'ledStrip'
    this.color = color ? color : '555555'
    this.dimmer = dimmer ? dimmer : 100
    this.speed = speed ? speed : 1
    this.scheme = scheme ? scheme : '0'
    this.status = status ? status : 'OFF'
    this.palette = palette ? palette : ['', '', '', '', '']
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
    this.getInitialState()
    this.sendChangePalette(this.palette)
  }
  getInitialState() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Dimmer`, '')
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, '')
      if (this.led_type.includes('rgb')) {
        this.sendMqttReq(`cmnd/${this.mqtt_name}/Color`, '')
        this.sendMqttReq(`cmnd/${this.mqtt_name}/Palette`, '')
        this.sendMqttReq(`cmnd/${this.mqtt_name}/Scheme`, '')
      }
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Dimmer`, '')
      if (this.led_type.includes('rgb')) {
        this.sendMqttReq(`cmnd/${this.mqtt_name}/Color`, '')
      }
    }
  }
  stopPallete() {
    this.sendChangeScheme(0)
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
    let temp = this.speed.toString()
    setTimeout(() => {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, temp)
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Scheme`, '')
    }, 10)
  }
  sendChangeDimmer(dimmer) {
    if (this.speed != 1) {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.sendMqttReq(`cmnd/${this.mqtt_name}/Dimmer`, dimmer)
    setTimeout(() => {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.speed.toString())
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
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.speed.toString())
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
      if (result.Dimmer != undefined) {
        this.dimmer = result.Dimmer
      }
      if (result.Speed != undefined) {
        this.speed = Number(result.Speed)
      }
      if (this.manufacter == 'tasmota') {
        if (result.Color != undefined) {
          this.color = result.Color
          this.stopPallete()
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
    this.sendWithSocket(io)
  }
}
module.exports = SmartLed
