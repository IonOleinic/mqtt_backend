const Device = require('./device')

class SmartSwitch extends Device {
  constructor(deviceData) {
    deviceData.device_type = 'smartSwitch'
    super(deviceData)
    const devDataAttr = deviceData.attributes || {}
    this.attributes = devDataAttr
    this.attributes.power_monitor = devDataAttr.power_monitor
    this.attributes.nr_of_sockets = devDataAttr.nr_of_sockets || 1

    this.attributes.power_status = devDataAttr.power_status || []
    this.attributes.cmnd_power_topics = devDataAttr.cmnd_power_topics || []
    this.attributes.stat_power_topics = devDataAttr.stat_power_topics || []

    if (this.attributes.power_monitor == true) {
      this.attributes.stat_sensor_topics = devDataAttr.stat_sensor_topics || []
      this.attributes.sensor_data = devDataAttr.sensor_data || {
        Total: '--',
        Today: '--',
        Power: '--',
        Voltage: '--',
        Current: '--',
      }

      //tasmota specific only
      this.sensor_update_interval = 3000 //3 seconds
      this.sensor_update_interval_id = null

      if (this.attributes.stat_sensor_topics?.length == 0) {
        let stat_sensor_topics = []
        if (this.manufacter === 'tasmota') {
          this.attributes.cmnd_sensor_topic = `cmnd/${this.mqtt_name}/STATUS`
          this.attributes.cmnd_sensor_payload = '8'
          stat_sensor_topics.push(`stat/${this.mqtt_name}/STATUS8`)
        } else if (this.manufacter === 'openBeken') {
          stat_sensor_topics.push(`${this.mqtt_name}/voltage/get`)
          stat_sensor_topics.push(`${this.mqtt_name}/power/get`)
          stat_sensor_topics.push(`${this.mqtt_name}/current/get`)
          stat_sensor_topics.push(`${this.mqtt_name}/voltage/get`)
          stat_sensor_topics.push(`${this.mqtt_name}/energycounter/get`)
          stat_sensor_topics.push(
            `${this.mqtt_name}/energycounter_last_hour/get`
          )
        }
        this.attributes.stat_sensor_topics = stat_sensor_topics
      }
    }
    if (this.attributes.stat_power_topics?.length == 0) {
      let cmnd_power_topics = []
      let stat_power_topics = []
      let power_status = []
      for (let i = 0; i < this.attributes.nr_of_sockets; i++) {
        if (this.manufacter === 'tasmota') {
          if (this.attributes.nr_of_sockets == 1) {
            cmnd_power_topics.push(`cmnd/${this.mqtt_name}/POWER`)
            stat_power_topics.push(`stat/${this.mqtt_name}/POWER`)
          } else {
            cmnd_power_topics.push(`cmnd/${this.mqtt_name}/POWER${i + 1}`)
            stat_power_topics.push(`stat/${this.mqtt_name}/POWER${i + 1}`)
          }
        } else if (this.manufacter === 'openBeken') {
          cmnd_power_topics.push(`cmnd/${this.mqtt_name}/POWER${i + 1}`)
          stat_power_topics.push(`${this.mqtt_name}/${i + 1}/get`)
        }
        power_status.push('OFF')
      }
      this.attributes.cmnd_power_topics = cmnd_power_topics
      this.attributes.stat_power_topics = stat_power_topics
      this.attributes.power_status = power_status
    }
  }

  initDevice() {
    this.subscribeForDeviceInfo()
    for (let i = 0; i < this.attributes.stat_power_topics?.length; i++) {
      this.subscribeToTopic(this.attributes?.stat_power_topics[i])
    }
    if (this.attributes.power_monitor == true) {
      for (let i = 0; i < this.attributes.stat_sensor_topics?.length; i++) {
        this.subscribeToTopic(this.attributes.stat_sensor_topics[i])
      }
    }
    this.getDeviceInfo()
    this.getInitialState()
    if (
      this.sensor_update_interval_id === null &&
      !this.is_deleted &&
      this.manufacter == 'tasmota'
    ) {
      this.startSensorUpdateInterval()
    }
  }
  getInitialState() {
    for (let i = 0; i < this.attributes.nr_of_sockets; i++) {
      if (this.manufacter === 'tasmota') {
        this.sendMqttReq(this.attributes.cmnd_power_topics[i], '')
      } else if (this.manufacter === 'openBeken') {
        this.sendMqttReq(this.attributes.stat_power_topics[i], '')
      }
    }
  }
  changePowerState(socket, state) {
    this.sendMqttReq(this.attributes.cmnd_power_topics[socket - 1], state)
  }
  sensorUpdateReq() {
    if (this.attributes.power_monitor == true) {
      if (this.manufacter === 'tasmota')
        this.sendMqttReq(
          this.attributes.cmnd_sensor_topic,
          this.attributes.cmnd_sensor_payload
        )
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
    console.log('\ndestroy smart switch ' + this.name + '\n')
    this.clearIntervals()
  }

  processIncomingMessage(topic, payload, io) {
    this.processDeviceInfoMessage(topic, payload)
    let value = payload.toString()
    for (let i = 0; i < this.attributes.stat_power_topics?.length; i++) {
      if (topic === this.attributes.stat_power_topics[i]) {
        if (value == 'ON' || value == '1') {
          this.attributes.power_status[i] = 'ON'
        } else if (value == 'OFF' || value == '0') {
          this.attributes.power_status[i] = 'OFF'
        }
      }
    }
    if (this.attributes.stat_sensor_topics?.includes(topic)) {
      if (this.manufacter == 'tasmota') {
        let sensor_energy = JSON.parse(value)
        this.attributes.sensor_data.Voltage =
          sensor_energy.StatusSNS?.ENERGY?.Voltage
        this.attributes.sensor_data.Current =
          sensor_energy.StatusSNS?.ENERGY?.Current
        this.attributes.sensor_data.Power =
          sensor_energy.StatusSNS?.ENERGY?.Power
        this.attributes.sensor_data.Today =
          sensor_energy.StatusSNS?.ENERGY?.Today
        this.attributes.sensor_data.Total =
          sensor_energy.StatusSNS?.ENERGY?.Total
      } else if (this.manufacter == 'openBeken') {
        let buffer = topic.split('/')
        switch (buffer[1]) {
          case 'voltage':
            this.attributes.sensor_data.Voltage = payload
            break
          case 'power':
            this.attributes.sensor_data.Power = payload
            break
          case 'current':
            this.attributes.sensor_data.Current = payload
            break
          case 'energycounter_today':
            this.attributes.sensor_data.Today = payload
            break
          case 'energycounter':
            this.attributes.sensor_data.Total = payload
            break

          default:
            break
        }
      }
    }
    this.sendWithSocket(io)
  }
}
module.exports = SmartSwitch
