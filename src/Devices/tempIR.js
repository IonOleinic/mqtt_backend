class TempIR {
  constructor(manufacter, mqtt_name) {
    this.id = Math.random().toString(16).slice(3)
    this.device_type = 'tempIR'
    this.manufacter = manufacter
    this.code = ''
    this.bits = ''
    this.protocol = ''
    this.mqtt_name = mqtt_name
    if (this.manufacter == 'tasmota') {
      this.receive_topic = `tele/${mqtt_name}/RESULT`
    } else if (this.manufacter == 'openBeken') {
      this.receive_topic = `${mqtt_name}/ir/get`
    }
  }
  processIncomingMessage(topic, payload, io) {
    if (topic === this.receive_topic) {
      let received = payload.toString()
      if (this.manufacter == 'tasmota') {
        let irReceived = JSON.parse(received).IrReceived
        this.protocol = irReceived.Protocol
        this.bits = irReceived.Bits
        this.code = irReceived.Data
      } else if (this.manufacter == 'openBeken') {
        let buffer = received.split(' ')
        this.protocol = buffer[0].replace('IR_', '')
        this.bits = buffer[1]
        this.code = buffer[2]
      }
      if (io) {
        io.emit('update_temp_ir', {
          mqtt_name: this.mqtt_name,
          IR_info: {
            protocol: this.protocol,
            bits: this.bits,
            code: this.code,
          },
        })
      }
    }
  }
}
module.exports = TempIR
