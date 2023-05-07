const Device = require('./device')

class SmartMotionSensor extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartMotionSensor',
      true,
      true
    )
    if (img === '') {
      this.img =
        'https://images.tuyacn.com/ecommerce/15900673368e2805e115e.png?x-oss-process=image/resize,w_510'
    }
    this.status = 'No Motion'
    this.battery_level = 0

    if (this.manufacter == 'tasmota') {
      this.receive_status_topic = `stat/${this.mqtt_name}/POWER`
    } else if (this.manufacter == 'openBeken') {
      this.receive_status_topic = `${this.mqtt_name}/1/get`
      this.receive_batt_topic = `${this.mqtt_name}/4/get`
    }
  }
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    this.subscribeToTopic(mqtt_client, this.receive_status_topic)
    this.subscribeToTopic(mqtt_client, this.receive_batt_topic)
    this.get_device_info(mqtt_client)
    this.get_initial_state(mqtt_client)
  }
  get_initial_state(mqtt_client) {
    if (this.manufacter == 'tasmota') {
      this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/POWER`, '')
      //Battery topic TODO
    } else {
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/1/get`, '')
      this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/4/get`, '')
    }
  }

  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    if (topic === this.receive_status_topic) {
      let value = payload.toString()
      if (value == 'ON' || value == '1') {
        this.status = 'Motion'
        setTimeout(() => {
          if (this.status == 'Motion') {
            this.status = 'No Motion'
            if (io) {
              io.emit('update_device', {
                device: this,
              })
            }
          }
        }, 30000)
      } else if (value == 'OFF' || value == '0') {
        this.status = 'No Motion'
      }
    } else if (topic === this.receive_batt_topic) {
      let level = Number(payload.toString())
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
