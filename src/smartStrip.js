const Device = require('./device')

class SmartStrip extends Device {
  constructor(
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    cmnd_power_topic,
    nr_of_plugs,
    power_status,
    sensor_topic,
    device_info_topic
  ) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartStrip',
      device_info_topic,
      'MAC',
      'IP',
      false
    )
    this.sensor_status = {
      StatusSNS: {
        Time: '0000-00-00T00:00:00',
        ENERGY: {
          TotalStartTime: '2022-10-13T16:13:07',
          Total: '-:-',
          Yesterday: '-:-',
          Today: '-:-',
          Power: '-:-',
          ApparentPower: '-:-',
          ReactivePower: '-:-',
          Factor: '-:-',
          Voltage: '-:-',
          Current: '-:-',
        },
      },
    }
    this.manufacter = manufacter
    this.nr_of_plugs = nr_of_plugs
    this.cmnd_power_topics = []
    this.stat_power_topics = []
    this.power_status = []

    for (let i = 0; i < nr_of_plugs; i++) {
      this.cmnd_power_topics.push(
        `cmnd/${mqtt_name}/${cmnd_power_topic}${i + 1}`
      )
      if (this.manufacter === 'openBeken') {
        this.stat_power_topics.push(`${mqtt_name}/${i + 1}/get`)
      } else if (this.manufacter === 'tasmota') {
        if (nr_of_plugs == 1) {
          this.stat_power_topics.push(`stat/${mqtt_name}/${cmnd_power_topic}`)
        } else {
          this.stat_power_topics.push(
            `stat/${mqtt_name}/${cmnd_power_topic}${i + 1}`
          )
        }
      }
      this.power_status.push(power_status)
    }
    this.sensor_topic = `stat/${mqtt_name}/${sensor_topic}`
  }
}
module.exports = SmartStrip
