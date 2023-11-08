const Device = require('./device')

class SmartDoorSensor extends Device {
  constructor({
    id,
    name,
    img,
    user_id,
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
      user_id,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartDoorSensor',
      true,
      true,
      favorite
    )
    this.status = attributes.status ? attributes.status : 'Closed'
    this.battery_level = attributes.status ? attributes.status : 0
    if (img === '') {
      this.img =
        'https://www.expert4house.com/965-large_default/tuya-wifi-door-and-window-sensor.jpg'
    }
    if (this.manufacter == 'tasmota') {
      this.receive_status_topic = `stat/${this.mqtt_name}/POWER`
      //Battery topic TODO
    } else if (this.manufacter == 'openBeken') {
      this.receive_status_topic = `${this.mqtt_name}/1/get`
      this.receive_batt_topic = `${this.mqtt_name}/2/get`
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.receive_status_topic)
    this.getDeviceInfo()
    this.getInitialState()
  }
  getInitialState() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
    } else {
      this.sendMqttReq(`${this.mqtt_name}/1/get`, '')
    }
  }
  sendToggleReq() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, 'TOGGLE')
    } else {
      this.sendMqttReq(`${this.mqtt_name}/1/set`, 'TOGGLE')
    }
  }
  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic === this.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.status = 'Opened'
      } else if (value == 'OFF' || value == '0') {
        this.status = 'Closed'
      }
    } else if (topic === this.receive_batt_topic) {
      this.battery_level = Number(value)
    }
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartDoorSensor
