const Device = require('./device')
class SmartSirenAlarm extends Device {
  constructor(deviceData) {
    super(deviceData)
    const {
      status,
      temperature,
      humidity,
      volume,
      sound,
      sound_duration,
      battery_level,
    } = deviceData.attributes
    this.status = status || 'OFF'
    this.temperature = temperature || 0
    this.humidity = humidity || 0
    this.sound = sound || 5
    this.volume = volume || 2
    this.sound_duration = sound_duration || 10
    this.battery_level = battery_level || 0
    this.cmnd_status_topic = `cmnd/${this.mqtt_name}/POWER`
    if (this.manufacter == 'tasmota') {
      this.receive_status_topic = `stat/${this.mqtt_name}/POWER`
    } else if (this.manufacter == 'openBeken') {
      this.receive_status_topic = `${this.mqtt_name}/1/get`
      this.receive_temp_topic = `${this.mqtt_name}/2/get`
      this.receive_hum_topic = `${this.mqtt_name}/3/get`
      this.receive_sound_topic = `${this.mqtt_name}/4/get`
      this.receive_volume_topic = `${this.mqtt_name}/5/get`
      this.receive_sound_duration_topic = `${this.mqtt_name}/6/get`
      this.receive_batt_topic = `${this.mqtt_name}/7/get`
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.receive_status_topic)
    this.subscribeToTopic(this.receive_temp_topic)
    this.subscribeToTopic(this.receive_hum_topic)
    this.subscribeToTopic(this.receive_sound_topic)
    this.subscribeToTopic(this.receive_volume_topic)
    this.subscribeToTopic(this.receive_sound_duration_topic)
    this.subscribeToTopic(this.receive_batt_topic)
    this.getDeviceInfo()
    this.getInitialState()
    this.setLastState()
  }

  getInitialState() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(`${this.receive_status_topic}`, '')
      if (!this.temperature) this.sendMqttReq(`${this.receive_temp_topic}`, '')
      if (!this.humidity) this.sendMqttReq(`${this.receive_hum_topic}`, '')
      if (!this.battery_level)
        this.sendMqttReq(`${this.receive_batt_topic}`, '')
    }
  }
  updateOptions(newSound, newVolume, newDuration) {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(`${this.mqtt_name}/4/set`, newSound, true)
      this.sendMqttReq(`${this.mqtt_name}/5/set`, newVolume, true)
      this.sendMqttReq(`${this.mqtt_name}/6/set`, newDuration, true)
    }
  }
  setLastState() {
    this.updateOptions(this.sound, this.volume, this.sound_duration)
  }
  changePowerState(socket_nr = 1, status) {
    if (status == 'TOGGLE') {
      status = this.status == 'OFF' ? 'ON' : 'OFF'
    }
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(this.cmnd_status_topic, status)
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(this.cmnd_status_topic, status)
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic === this.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.status = 'ON'
      } else if (value == 'OFF' || value == '0') {
        this.status = 'OFF'
      }
    } else if (topic === this.receive_temp_topic) {
      this.temperature = Number(value) / 10
    } else if (topic === this.receive_hum_topic) {
      this.humidity = Number(value)
    } else if (topic === this.receive_sound_topic) {
      this.sound = Number(value)
    } else if (topic === this.receive_volume_topic) {
      this.volume = Number(value)
    } else if (topic === this.receive_sound_duration_topic) {
      this.sound_duration = Number(value)
    } else if (topic === this.receive_batt_topic) {
      this.battery_level = Number(value)
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartSirenAlarm
