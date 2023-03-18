const Device = require('./device')

class TempIR {
  constructor(manufacter, mqtt_name) {
    this.id = Math.random().toString(16).slice(3)
    this.receive_topic = `${mqtt_name}/ir/get`
    this.device_type = 'tempIR'
    this.manufacter = manufacter
    this.received_code = ''
    this.mqtt_name = mqtt_name
  }
  processIncomingMessage(topic, payload, io) {
    current_device.received_code = payload.toString()
    if (io) {
      io.emit('update_temp_ir', {
        mqtt_name: current_device.mqtt_name,
        received_code: current_device.received_code,
      })
    }
  }
}
module.exports = TempIR
