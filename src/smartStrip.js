const Device = require('./device')

class SmartStrip extends Device {
  constructor(name, img, manufacter, mqtt_name, mqtt_group, nr_of_plugs) {
    super(
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartStrip',
      'STATUS5',
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
    this.nr_of_plugs = nr_of_plugs
    this.cmnd_power_topics = []
    this.stat_power_topics = []
    this.power_status = []

    for (let i = 0; i < nr_of_plugs; i++) {
      this.cmnd_power_topics.push(`cmnd/${mqtt_name}/POWER${i + 1}`)
      if (this.manufacter === 'openBeken') {
        this.cmnd_sensor_topic = `TODO`
        this.cmnd_sensor_payload = 'TODO'
        this.stat_sensor_topic = `TODO`
        this.stat_power_topics.push(`${mqtt_name}/${i + 1}/get`)
      } else if (this.manufacter === 'tasmota') {
        this.cmnd_sensor_topic = `cmnd/${mqtt_name}/STATUS`
        this.cmnd_sensor_payload = '8'
        this.stat_sensor_topic = `stat/${mqtt_name}/STATUS8`
        if (nr_of_plugs == 1) {
          this.stat_power_topics.push(`stat/${mqtt_name}/POWER`)
        } else {
          this.stat_power_topics.push(`stat/${mqtt_name}/POWER${i + 1}`)
        }
      }
      this.power_status.push('OFF')
    }
  }
  change_power_state(mqtt_client, socket, state) {
    mqtt_client.publish(
      `cmnd/${this.mqtt_name}/POWER${socket}`,
      `${state}`,
      { qos: 0, retain: false },
      (error) => {
        if (error) {
          console.log(error)
        }
      }
    )
  }
  send_sensor_req(mqtt_client) {
    mqtt_client.publish(
      this.cmnd_sensor_topic,
      this.cmnd_sensor_payload,
      { qos: 0, retain: false },
      (error) => {
        if (error) {
          console.log(error)
        }
      }
    )
  }
}
module.exports = SmartStrip
