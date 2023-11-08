const Device = require('./device')
class SmartMotionSensor extends Device {
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
      'smartMotionSensor',
      true,
      true,
      favorite
    )
    this.auto_off = attributes.auto_off ? attributes.auto_off : false
    this.status = attributes.status ? attributes.status : 'No Motion'
    this.battery_level = attributes.battery_level ? attributes.battery_level : 0
    if (this.manufacter == 'tasmota') {
      this.receive_status_topic = `stat/${this.mqtt_name}/POWER`
    } else if (this.manufacter == 'openBeken') {
      this.receive_status_topic = `${this.mqtt_name}/1/get`
      this.receive_batt_topic = `${this.mqtt_name}/4/get`
    }
    if (img === '') {
      this.img =
        'https://images.tuyacn.com/ecommerce/15900673368e2805e115e.png?x-oss-process=image/resize,w_510'
    }
  }
  initDevice() {
    this.subscribeForDeviceInfo()
    this.subscribeToTopic(this.receive_status_topic)
    this.subscribeToTopic(this.receive_batt_topic)
    this.getDeviceInfo()
    this.getInitialState()
  }
  getInitialState() {
    if (this.manufacter == 'tasmota') {
      this.sendMqttReq(`cmnd/${this.mqtt_name}/POWER`, '')
      //Battery topic TODO
    } else {
      this.sendMqttReq(`${this.mqtt_name}/1/get`, '')
      this.sendMqttReq(`${this.mqtt_name}/4/get`, '')
    }
  }

  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    if (topic === this.receive_status_topic) {
      if (value == 'ON' || value == '1') {
        this.status = 'Motion'
        if (this.auto_off == false) {
          clearTimeout(this.timeout_instance)
          setTimeout(() => {
            if (this.status == 'Motion') {
              this.status = 'No Motion'
              if (io) {
                io.emit('update_device', {
                  device: this,
                })
              }
            }
          }, 40000)
          this.auto_off = true
        }
      } else if (value == 'OFF' || value == '0') {
        this.status = 'No Motion'
        this.auto_off = false
      }
    } else if (topic === this.receive_batt_topic) {
      let level = Number(value)
      if (level > 75) {
        this.battery_level = 3
      } else if (level < 75 && level > 50) {
        this.battery_level = 2
      } else if (level < 50 && level > 0) {
        this.battery_level = 1
      } else {
        this.battery_level = 0
      }
    }
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartMotionSensor
