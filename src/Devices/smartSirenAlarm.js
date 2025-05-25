const Device = require('./device')
class SmartSirenAlarm extends Device {
  constructor(deviceData) {
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes.status = devDataAttr.status || 'OFF'
    this.attributes.ringtone = devDataAttr.ringtone || 1
    this.attributes.volume = devDataAttr.volume || 0
    this.attributes.sound_duration = devDataAttr.sound_duration || 10
    this.attributes.nr_of_ringtones = devDataAttr.nr_of_ringtones || 10
    this.attributes.temp_hum_sensor = devDataAttr.temp_hum_sensor
    this.attributes.volume_mapper = devDataAttr.volume_mapper || [
      { name: 'low', value: -1 },
      { name: 'medium', value: -1 },
      { name: 'high', value: -1 },
      { name: 'mute', value: -1 },
    ]
    if (this.attributes.temp_hum_sensor == true) {
      this.attributes.temperature = devDataAttr.temperature || 0
      this.attributes.humidity = devDataAttr.humidity || 0
    }
    this.attributes.cmnd_status_topic =
      devDataAttr.cmnd_status_topic || `cmnd/${this.mqtt_name}/POWER`

    if (this.manufacter == 'tasmota') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `stat/${this.mqtt_name}/POWER`
    } else if (this.manufacter == 'openBeken') {
      this.attributes.receive_status_topic =
        devDataAttr.receive_status_topic || `${this.mqtt_name}/1/get`

      this.attributes.receive_ringtone_topic =
        devDataAttr.receive_ringtone_topic || `${this.mqtt_name}/2/get`

      this.attributes.receive_volume_topic =
        devDataAttr.receive_volume_topic || `${this.mqtt_name}/3/get`

      this.attributes.receive_sound_duration_topic =
        devDataAttr.receive_sound_duration_topic || `${this.mqtt_name}/4/get`

      if (this.attributes.temp_hum_sensor == true) {
        this.attributes.receive_temp_topic =
          devDataAttr.receive_temp_topic || `${this.mqtt_name}/5/get`
        this.attributes.receive_hum_topic =
          devDataAttr.receive_hum_topic || `${this.mqtt_name}/6/get`
      }
    }
  }
  initDevice() {
    this.subscribeToTopic(this.attributes.receive_status_topic)
    this.subscribeToTopic(this.attributes.receive_ringtone_topic)
    this.subscribeToTopic(this.attributes.receive_volume_topic)
    this.subscribeToTopic(this.attributes.receive_sound_duration_topic)
    if (this.attributes.temp_hum_sensor == true) {
      this.subscribeToTopic(this.attributes.receive_temp_topic)
      this.subscribeToTopic(this.attributes.receive_hum_topic)
    }
    this.getInitialState()
    // this.setLastState()
  }

  getInitialState() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(this.attributes.cmnd_status_topic, '')
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(this.attributes.receive_status_topic, '')
      this.sendMqttReq(`${this.attributes.receive_ringtone_topic}`, '')
      this.sendMqttReq(`${this.attributes.receive_volume_topic}`, '')
      this.sendMqttReq(`${this.attributes.receive_sound_duration_topic}`, '')
      if (this.attributes.temp_hum_sensor == true) {
        this.sendMqttReq(`${this.attributes.receive_temp_topic}`, '')
        this.sendMqttReq(`${this.attributes.receive_hum_topic}`, '')
      }
    }
  }
  updateOptions(newRingtone, newVolume, newDuration) {
    if (this.manufacter == 'tasmota') {
      //TODO
    } else if (this.manufacter == 'openBeken') {
      this.sendMqttReq(
        `${this.attributes.receive_ringtone_topic.replace('/get', '/set')}`,
        newRingtone
      )
      this.sendMqttReq(
        `${this.attributes.receive_volume_topic.replace('/get', '/set')}`,
        newVolume
      )
      this.sendMqttReq(
        `${this.attributes.receive_sound_duration_topic.replace(
          '/get',
          '/set'
        )}`,
        newDuration
      )
    }
  }
  setLastState() {
    // this.updateOptions(
    //   this.attributes.ringtone,
    //   this.attributes.volume,
    //   this.attributes.sound_duration
    // )
  }
  changePowerState(socket_nr = 1, status) {
    this.sendMqttReq(this.attributes.cmnd_status_topic, status)
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic === this.attributes.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.attributes.status = 'ON'
      } else if (value == 'OFF' || value == '0') {
        this.attributes.status = 'OFF'
      }
    } else if (topic === this.attributes.receive_ringtone_topic) {
      this.attributes.ringtone = Number(value)
    } else if (topic === this.attributes.receive_volume_topic) {
      this.attributes.volume = Number(value)
    } else if (topic === this.attributes.receive_sound_duration_topic) {
      this.attributes.sound_duration = Number(value)
    } else if (topic === this.attributes.receive_temp_topic) {
      this.attributes.temperature = Number(value) / 10
    } else if (topic === this.attributes.receive_hum_topic) {
      this.attributes.humidity = Number(value)
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartSirenAlarm
