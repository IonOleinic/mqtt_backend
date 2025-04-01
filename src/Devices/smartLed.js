const Device = require('./device')
class SmartLed extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.led_type = devDataAttr.led_type || 'rgb'
    this.attributes.color = devDataAttr.color || '555555'
    this.attributes.dimmer = devDataAttr.dimmer || 100
    this.attributes.speed = devDataAttr.speed || 1
    this.attributes.scheme = devDataAttr.scheme || '0'
    this.attributes.status = devDataAttr.status || 'OFF'
    this.attributes.palette = devDataAttr.palette || ['', '', '', '', '']

    if (this.manufacter == 'tasmota') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `stat/${this.mqtt_name}/POWER`
      this.attributes.receive_result_topic =
        devDataAttr.receive_result_topic || `stat/${this.mqtt_name}/RESULT`
      this.attributes.receive_dimmer_topic =
        devDataAttr.receive_dimmer_topic || `stat/${this.mqtt_name}/Dimmer`
      if (this.attributes.led_type?.includes('rgb')) {
        this.attributes.receive_color_topic =
          devDataAttr.receive_color_topic || `stat/${this.mqtt_name}/Color`
      }
    } else if (this.manufacter == 'openBeken') {
      this.attributes.receive_result_topic =
        devDataAttr.receive_result_topic || `stat/${this.mqtt_name}/RESULT`
      this.attributes.receive_dimmer_topic =
        devDataAttr.receive_dimmer_topic || `${this.mqtt_name}/led_dimmer/get`
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic ||
        `${this.mqtt_name}/led_enableAll/get`
      if (this.attributes.led_type?.includes('rgb')) {
        if (this.attributes.led_type == 'rgb') {
          this.attributes.receive_color_topic =
            devDataAttr.receive_color_topic ||
            `${this.mqtt_name}/led_basecolor_rgb/get`
        } else if (
          this.attributes.led_type == 'rgbcw' ||
          this.attributes.led_type == 'rgbw'
        ) {
          this.attributes.receive_color_topic =
            devDataAttr.receive_color_topic ||
            `${this.mqtt_name}/led_finalcolor_rgbcw/get`
        }
      }
    }
  }

  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.attributes.receive_result_topic)
    this.subscribeToTopic(this.attributes.receive_status_topic)
    this.subscribeToTopic(this.attributes.receive_dimmer_topic)
    if (this.attributes.led_type?.includes('rgb')) {
      this.subscribeToTopic(this.attributes.receive_color_topic)
    }
    this.getDeviceInfo()
    this.setLastState()
  }

  setLastState() {
    this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, this.attributes.status)
    if (this.attributes.led_type?.includes('rgb')) {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.attributes.speed)
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Color`, this.attributes.color)
      if (this.manufacter == 'tasmota') {
        this.sendChangePalette(this.attributes.palette)
        this.sendMqttReq(
          `cmnd/${this.mqtt_name}/Scheme`,
          this.attributes.scheme
        )
      }
    }
    this.sendMqttReq(`cmnd/${this.mqtt_name}/Dimmer`, this.attributes.dimmer)
  }
  stopPallete() {
    // this.sendChangeScheme(0)
  }
  sendChangeColor(color) {
    if (this.attributes.speed != 1) {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, '1')
    }
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Color`, color)
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/led_basecolor_rgbcw`, color)
    }
    setTimeout(() => {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.attributes.speed)
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Scheme`, '')
    }, 10)
  }
  sendChangeDimmer(dimmer) {
    if (this.attributes.speed != 1) {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.sendMqttReq(`cmnd/${this.mqtt_name}/Dimmer`, dimmer)
    setTimeout(() => {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.attributes.speed)
    }, 10)
  }
  sendChangeSpeed(speed) {
    this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, speed)
  }
  sendChangeScheme(scheme) {
    this.sendMqttReq(`cmnd/${this.mqtt_name}/Scheme`, scheme)
  }
  sendChangePower(power) {
    if (this.attributes.speed != 1) {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, '1')
    }
    this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, power)
    setTimeout(() => {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/Speed`, this.attributes.speed)
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
    if (topic == this.attributes.receive_result_topic) {
      let result = JSON.parse(value)
      if (result.POWER) {
        this.attributes.status = result.POWER
      }
      if (result.Dimmer) {
        this.attributes.dimmer = result.Dimmer
      }
      if (result.Speed) {
        this.attributes.speed = Number(result.Speed)
      }
      if (this.manufacter == 'tasmota') {
        if (result.Color) {
          this.attributes.color = result.Color
          this.stopPallete()
        }
        if (result.Palette) {
          this.attributes.palette = result.Palette?.replaceAll('[', '')
            .replaceAll(']', '')
            .split(',')
            .map((item) => item)
          while (this.attributes.palette?.length < 5) {
            this.attributes.palette.push('')
          }
        }
        if (result.Scheme !== undefined) {
          this.attributes.scheme = result.Scheme
        }
      }
    } else if (topic === this.attributes.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.attributes.status = 'ON'
      } else if (value == 'OFF' || value == '0') {
        this.attributes.status = 'OFF'
      }
    } else if (topic === this.attributes.receive_color_topic) {
      this.attributes.color = value
    } else if (topic === this.attributes.receive_dimmer_topic) {
      this.attributes.dimmer = value
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartLed
