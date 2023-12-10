const { mqttClient } = require('../mqtt/mqttClient')
class Scene {
  constructor(
    id,
    name,
    user_id,
    scene_type,
    active,
    favorite,
    date,
    exec_device_id,
    executable_topic,
    executable_payload,
    executable_text
  ) {
    this.id = id
    this.name = name
    this.user_id = user_id
    this.exec_device_id = exec_device_id
    this.executable_topic = executable_topic
    this.executable_payload = executable_payload
    this.executable_text = executable_text
    this.date = new Date(date)
    this.favorite = favorite
    this.active = active
    this.scene_type = scene_type
  }
  execute() {
    try {
      if (this.active) {
        mqttClient.publish(
          this.executable_topic,
          this.executable_payload,
          { qos: 0, retain: false },
          (error) => {
            if (error) {
              console.log(error)
            }
          }
        )
        if (this.scene_type === 'weather') this.active = false
      }
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = Scene
