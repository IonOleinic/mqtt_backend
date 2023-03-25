const Device = require('./device')

class SmartDoorSensor extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartDoorSensor',
      true,
      true
    )
    if (img === '') {
      this.img =
        'https://www.expert4house.com/965-large_default/tuya-wifi-door-and-window-sensor.jpg'
    }
    this.status = 'Closed'
    this.battery_level = 0

    if (this.manufacter == 'tasmota') {
      this.receive_status_topic = `stat/${this.mqtt_name}/POWER`
    } else if (this.manufacter == 'openBeken') {
      this.receive_status_topic = `${this.mqtt_name}/1/get`
      this.receive_batt_topic = `${this.mqtt_name}/2/get`
    }
  }
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    this.subscribeToTopic(mqtt_client, this.receive_status_topic)
    this.get_device_info(mqtt_client)
    this.get_initial_state(mqtt_client)
  }
  get_initial_state(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/POWER`, '')
    } else {
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/1/set`, '')
    }
  }
  send_toggle_req(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/POWER`, 'TOGGLE')
    } else {
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/1/set`, 'TOGGLE')
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    if (topic === this.receive_status_topic) {
      let value = payload.toString()
      if (value == 'ON') {
        this.status = 'Opened'
      } else if (value == 'OFF') {
        this.status = 'Closed'
      }
    } else if (topic === this.receive_batt_topic) {
      this.battery_level = Number(payload.toString())
    }
    if (io) {
      io.emit('update_smart_door_sensor', {
        mqtt_name: this.mqtt_name,
        status: this.status,
        battery_level: this.battery_level,
      })
    }
  }
}
module.exports = SmartDoorSensor
