const Device = require('./device')

class SmartSirenAlarm extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartSirenAlarm',
      true,
      false
    )
    if (img === '') {
      this.img =
        'https://m.media-amazon.com/images/I/51uN7WDJMNS.__AC_SX300_SY300_QL70_ML2_.jpg'
    }
    this.status = 'OFF'
    this.temperature = 0
    this.humidity = 0
    this.sound = 5
    this.volume = 2
    this.sound_duration = 10
    this.battery_level = 0

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
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    this.subscribeToTopic(mqtt_client, this.receive_status_topic)
    this.subscribeToTopic(mqtt_client, this.receive_temp_topic)
    this.subscribeToTopic(mqtt_client, this.receive_hum_topic)
    this.subscribeToTopic(mqtt_client, this.receive_sound_topic)
    this.subscribeToTopic(mqtt_client, this.receive_volume_topic)
    this.subscribeToTopic(mqtt_client, this.receive_sound_duration_topic)
    this.subscribeToTopic(mqtt_client, this.receive_batt_topic)
    this.get_device_info(mqtt_client)
    this.get_initial_state(mqtt_client)
  }
  update_options(mqtt_client, new_sound, new_volume, new_duration) {
    this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/4/set`, new_sound)
    this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/5/set`, new_volume)
    this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/6/set`, new_duration)
  }
  get_initial_state(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/POWER`, '')
    } else {
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/1/set`, '')
    }
  }
  change_power_state(mqtt_client, status) {
    if (this.manufacter == 'tasmota') {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/POWER`, status)
    } else {
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/1/set`, status)
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    if (topic === this.receive_status_topic) {
      let value = payload.toString()
      if (value == '1') {
        this.status = 'ON'
      } else if (value == '0') {
        this.status = 'OFF'
      }
    }
    if (topic === this.receive_temp_topic) {
      this.temperature = Number(payload.toString()) / 10
    } else if (topic === this.receive_hum_topic) {
      this.humidity = Number(payload.toString())
    } else if (topic === this.receive_sound_topic) {
      this.sound = Number(payload.toString())
    } else if (topic === this.receive_volume_topic) {
      this.volume = Number(payload.toString())
    } else if (topic === this.receive_sound_duration_topic) {
      this.sound_duration = Number(payload.toString())
    } else if (topic === this.receive_batt_topic) {
      this.battery_level = Number(payload.toString())
    }
    if (io) {
      io.emit('update_smart_alarm_siren', {
        mqtt_name: this.mqtt_name,
        status: this.status,
        temperature: this.temperature,
        humidity: this.humidity,
        sound: this.sound,
        volume: this.volume,
        sound_duration: this.sound_duration,
        battery_level: this.battery_level,
      })
    }
  }
}
module.exports = SmartSirenAlarm
