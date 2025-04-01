const Device = require('./device')
class SmartSirenAlarm extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.status = devDataAttr.status || 'OFF'
    this.attributes.temperature = devDataAttr.temperature || 0
    this.attributes.humidity = devDataAttr.humidity || 0
    this.attributes.sound = devDataAttr.sound || 5
    this.attributes.volume = devDataAttr.volume || 2
    this.attributes.sound_duration = devDataAttr.sound_duration || 10
    this.attributes.battery_level = devDataAttr.battery_level || 0
    this.attributes.cmnd_status_topic =
      devDataAttr.cmnd_status_topic || `cmnd/${this.mqtt_name}/POWER`

    if (this.manufacter == 'tasmota') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `stat/${this.mqtt_name}/POWER`
    } else if (this.manufacter == 'openBeken') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `${this.mqtt_name}/1/get`
      this.attributes.receive_temp_topic =
        devDataAttr.receive_temp_topic || `${this.mqtt_name}/2/get`
      this.attributes.receive_hum_topic =
        devDataAttr.receive_hum_topic || `${this.mqtt_name}/3/get`
      this.attributes.receive_sound_topic =
        devDataAttr.receive_sound_topic || `${this.mqtt_name}/4/get`
      this.attributes.receive_volume_topic =
        devDataAttr.receive_volume_topic || `${this.mqtt_name}/5/get`
      this.attributes.receive_sound_duration_topic =
        devDataAttr.receive_sound_duration_topic || `${this.mqtt_name}/6/get`
      this.attributes.receive_batt_topic =
        devDataAttr.receive_batt_topic || `${this.mqtt_name}/7/get`
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.attributes.receive_status_topic)
    this.subscribeToTopic(this.attributes.receive_temp_topic)
    this.subscribeToTopic(this.attributes.receive_hum_topic)
    this.subscribeToTopic(this.attributes.receive_sound_topic)
    this.subscribeToTopic(this.attributes.receive_volume_topic)
    this.subscribeToTopic(this.attributes.receive_sound_duration_topic)
    this.subscribeToTopic(this.attributes.receive_batt_topic)
    this.getDeviceInfo()
    this.getInitialState()
    this.setLastState()
  }

  getInitialState() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(this.attributes.cmnd_status_topic, '')
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(this.attributes.receive_status_topic, '')
      if (!this.attributes.temperature)
        this.sendMqttReq(`${this.attributes.receive_temp_topic}`, '')
      if (!this.attributes.humidity)
        this.sendMqttReq(`${this.attributes.receive_hum_topic}`, '')
      if (!this.attributes.battery_level)
        this.sendMqttReq(`${this.attributes.receive_batt_topic}`, '')
    }
  }
  updateOptions(newSound, newVolume, newDuration) {
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(`${this.mqtt_name}/4/set`, newSound, true)
      this.sendMqttReq(`${this.mqtt_name}/5/set`, newVolume, true)
      this.sendMqttReq(`${this.mqtt_name}/6/set`, newDuration, true)
    }
  }
  setLastState() {
    this.updateOptions(
      this.attributes.sound,
      this.attributes.volume,
      this.attributes.sound_duration
    )
  }
  changePowerState(socket_nr = 1, status) {
    this.sendMqttReq(this.attributes.cmnd_status_topic, status)
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic === this.attributes.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.status = 'ON'
      } else if (value == 'OFF' || value == '0') {
        this.status = 'OFF'
      }
    } else if (topic === this.attributes.receive_temp_topic) {
      this.attributes.temperature = Number(value) / 10
    } else if (topic === this.attributes.receive_hum_topic) {
      this.attributes.humidity = Number(value)
    } else if (topic === this.attributes.receive_sound_topic) {
      this.attributes.sound = Number(value)
    } else if (topic === this.attributes.receive_volume_topic) {
      this.attributes.volume = Number(value)
    } else if (topic === this.attributes.receive_sound_duration_topic) {
      this.attributes.sound_duration = Number(value)
    } else if (topic === this.attributes.receive_batt_topic) {
      this.attributes.battery_level = Number(value)
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartSirenAlarm
