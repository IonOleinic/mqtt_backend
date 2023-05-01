const Scene = require('./scene')
class DeviceScene extends Scene {
  constructor(
    name,
    cond_device_mqtt,
    cond_device_id,
    exec_device_id,
    conditional_topic,
    conditional_payload,
    executable_topic,
    executable_payload,
    conditional_text = '',
    executable_text = ''
  ) {
    super(
      name,
      'deviceScene',
      'https://cdn-icons-png.flaticon.com/512/4396/4396090.png'
    )
    this.conditional_topic = conditional_topic
    this.conditional_payload = conditional_payload
    this.executable_topic = executable_topic
    this.executable_payload = executable_payload
    this.cond_device_mqtt = cond_device_mqtt
    this.cond_device_id = cond_device_id
    this.exec_device_id = exec_device_id
    this.conditional_text = conditional_text
    this.executable_text = executable_text
  }
  execute(mqtt_client) {
    try {
      if (this.active) {
        mqtt_client.publish(
          this.executable_topic,
          this.executable_payload,
          { qos: 0, retain: false },
          (error) => {
            if (error) {
              console.log(error)
            }
          }
        )
      }
    } catch (error) {
      console.log(error)
    }
  }
}
module.exports = DeviceScene