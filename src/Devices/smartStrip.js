const Device = require('./device')

class SmartStrip extends Device {
  constructor(deviceData) {
    deviceData.device_type = 'smartStrip'
    super(deviceData)
    const { switch_type, nr_of_sockets, sensor_data } = deviceData.attributes
    this.switch_type = switch_type || 'plug'
    this.nr_of_sockets = nr_of_sockets || 1
    this.cmnd_power_topic = `cmnd/${this.mqtt_name}/POWER`
    this.power_status = []
    this.stat_power_topics = []
    this.sensor_update_interval = 3000 //3 seconds
    this.sensor_update_interval_id = null
    if (this.switch_type == 'plug') {
      this.sensor_data = sensor_data || {
        Today: '---',
        Total: '--',
        Power: '--',
        Voltage: '--',
        Current: '--',
      }
      this.stat_sensor_topics = []
      if (this.manufacter === 'tasmota') {
        this.cmnd_sensor_topic = `cmnd/${this.mqtt_name}/STATUS`
        this.cmnd_sensor_payload = '8'
        this.stat_sensor_topics.push(`stat/${this.mqtt_name}/STATUS8`)
      } else if (this.manufacter === 'openBeken') {
        this.stat_sensor_topics.push(`${this.mqtt_name}/voltage/get`)
        this.stat_sensor_topics.push(`${this.mqtt_name}/power/get`)
        this.stat_sensor_topics.push(`${this.mqtt_name}/current/get`)
        this.stat_sensor_topics.push(`${this.mqtt_name}/voltage/get`)
        this.stat_sensor_topics.push(`${this.mqtt_name}/energycounter/get`)
        this.stat_sensor_topics.push(
          `${this.mqtt_name}/energycounter_last_hour/get`
        )
      }
    }
    for (let i = 0; i < this.nr_of_sockets; i++) {
      if (this.manufacter === 'openBeken') {
        this.stat_power_topics.push(`${this.mqtt_name}/${i + 1}/get`)
      } else if (this.manufacter === 'tasmota') {
        if (this.nr_of_sockets == 1) {
          this.stat_power_topics.push(`stat/${this.mqtt_name}/POWER`)
        } else {
          this.stat_power_topics.push(`stat/${this.mqtt_name}/POWER${i + 1}`)
        }
      }
      this.power_status.push('OFF')
    }
  }

  initDevice() {
    this.subscribeForDeviceInfo()
    for (let i = 0; i < this.stat_power_topics.length; i++) {
      this.subscribeToTopic(this.stat_power_topics[i])
    }
    if (this.switch_type == 'plug') {
      for (let i = 0; i < this.stat_sensor_topics.length; i++) {
        this.subscribeToTopic(this.stat_sensor_topics[i])
      }
    }
    this.getDeviceInfo()
    this.getInitialState()
    if (
      !this.sensor_update_interval_id &&
      !this.is_deleted &&
      this.manufacter == 'tasmota'
    ) {
      this.startSensorUpdateInterval()
    }
  }
  getInitialState() {
    for (let i = 0; i < this.nr_of_sockets; i++) {
      if (this.manufacter === 'tasmota') {
        this.changePowerState(i + 1, '')
      } else if (this.manufacter === 'openBeken') {
        this.sendMqttReq(`${this.mqtt_name}/${i + 1}/get`, '')
      }
    }
  }
  changePowerState(socket, state) {
    this.sendMqttReq(`${this.cmnd_power_topic}${socket}`, state)
  }
  sensorUpdateReq() {
    if (this.switch_type == 'plug') {
      if (this.manufacter === 'tasmota')
        this.sendMqttReq(this.cmnd_sensor_topic, this.cmnd_sensor_payload)
    }
  }
  startSensorUpdateInterval() {
    clearInterval(this.sensor_update_interval_id)
    this.sensor_update_interval_id = setInterval(() => {
      if (this.available) {
        this.sensorUpdateReq()
        console.log('\nsensor update ' + this.name + '\n')
      }
    }, this.sensor_update_interval)
  }
  stopSensorUpdateInterval() {
    clearInterval(this.sensor_update_interval_id)
    this.sensor_update_interval_id = null
  }
  clearIntervals() {
    this.stopSensorUpdateInterval()
  }
  destroy() {
    console.log('\ndestroy smart strip ' + this.name + '\n')
    this.clearIntervals()
  }

  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    for (let i = 0; i < this.stat_power_topics.length; i++) {
      if (topic === this.stat_power_topics[i]) {
        if (value == 'ON' || value == '1') {
          this.power_status[i] = 'ON'
        } else if (value == 'OFF' || value == '0') {
          this.power_status[i] = 'OFF'
        }
      }
    }
    if (this.stat_sensor_topics?.includes(topic)) {
      if (this.manufacter == 'tasmota') {
        let sensor_energy = JSON.parse(value)
        this.sensor_data.Voltage = sensor_energy.StatusSNS?.ENERGY?.Voltage
        this.sensor_data.Current = sensor_energy.StatusSNS?.ENERGY?.Current
        this.sensor_data.Power = sensor_energy.StatusSNS?.ENERGY?.Power
        this.sensor_data.Today = sensor_energy.StatusSNS?.ENERGY?.Today
        this.sensor_data.Total = sensor_energy.StatusSNS?.ENERGY?.Total
      } else if (this.manufacter == 'openBeken') {
        let buffer = topic.split('/')
        switch (buffer[1]) {
          case 'voltage':
            this.sensor_data.Voltage = payload
            break
          case 'power':
            this.sensor_data.Power = payload
            break
          case 'current':
            this.sensor_data.Current = payload
            break
          case 'energycounter_today':
            this.sensor_data.Today = payload
            break
          case 'energycounter':
            this.sensor_data.Total = payload
            break

          default:
            break
        }
      }
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartStrip
