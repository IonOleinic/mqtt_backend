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
    if (topic === this.receive_topic) {
      this.received_code = payload.toString()
      print(this.received_code)
      if (io) {
        io.emit('update_temp_ir', {
          mqtt_name: this.mqtt_name,
          received_code: this.received_code,
        })
      }
    }
  }
}
module.exports = TempIR
