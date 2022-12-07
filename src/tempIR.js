const Device = require('./device')

class TempIR {
  constructor(manufacter, mqtt_name) {
    this.receive_topic = `${mqtt_name}/ir/get`
    this.device_type = 'tempIR'
    this.manufacter = manufacter
    this.received_code = ''
    this.mqtt_name = mqtt_name
  }
}
module.exports = TempIR
