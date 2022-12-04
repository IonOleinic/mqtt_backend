const Device = require('./device')

class SmartSwitch extends Device {
  constructor(
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    nr_of_plugs
  ) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartSwitch',
      "STATUS5",
      'MAC',
      'IP',
      false
    )
    this.nr_of_plugs = nr_of_plugs
    this.cmnd_power_topics = []
    this.stat_power_topics = []
    this.power_status = []
    for (let i = 0; i < nr_of_plugs; i++) {
      this.cmnd_power_topics.push(
        `cmnd/${mqtt_name}/POWER${i + 1}`
      )
      if (this.manufacter === 'openBeken') {
        this.stat_power_topics.push(`${mqtt_name}/${i + 1}/get`)
      } else if (this.manufacter === 'tasmota') {
        if (nr_of_plugs == 1) {
          this.stat_power_topics.push(`stat/${mqtt_name}/POWER`)
        } else {
          this.stat_power_topics.push(
            `stat/${mqtt_name}/POWER${i + 1}`
          )
        }
      }
      this.power_status.push("OFF")
    }
  }
}
module.exports = SmartSwitch
