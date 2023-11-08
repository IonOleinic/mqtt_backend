const Scene = require('./scene')
class DeviceScene extends Scene {
  constructor({
    id,
    name,
    active,
    favorite,
    date,
    exec_device_id,
    executable_topic,
    executable_payload,
    executable_text,
    attributes = {},
  }) {
    super(
      id,
      name,
      'deviceScene',
      active,
      favorite,
      date,
      exec_device_id,
      executable_topic,
      executable_payload,
      executable_text
    )
    this.cond_device_id = attributes.cond_device_id
    this.cond_device_mqtt = attributes.cond_device_mqtt
    this.conditional_topic = attributes.conditional_topic
    this.conditional_payload = attributes.conditional_payload
    this.conditional_text = attributes.conditional_text
  }

  delete() {
    console.log(`Device Scene with id=${this.id} was deleted.`)
  }
}
module.exports = DeviceScene
