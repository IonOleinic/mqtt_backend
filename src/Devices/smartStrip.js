const Device = require('./device')

class SmartStrip extends Device {
  constructor(
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    nr_of_sockets,
    favorite = false
  ) {
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
      false,
      false,
      favorite
    )
    if (img === '') {
      if (nr_of_sockets == 1) {
        this.img =
          'https://s13emagst.akamaized.net/products/41611/41610854/images/res_d0e3e75338d6c66ce67fb30eb262ba18.png?width=300&height=300&hash=27432531CE4D755B47A28FB1B0327F48'
      } else if (nr_of_sockets == 2) {
        this.img =
          'https://www.calibereurope.com/wp-content/uploads/2022/09/e98075d2cfa89ca060bb9bda48cd624d6df51a3b_HWP121E-8.jpg'
      } else if (nr_of_sockets >= 3) {
        this.img =
          'https://ae01.alicdn.com/kf/H4fdb76beb6d44535b8cff5ffe43a53bfj/Gosund-16A-Eu-Tuya-Wifi-Smart-Power-Strip-Met-3-Usb-poorten-Onafhankelijke-Schakelaar-multi-Plug.jpg_Q90.jpg_.webp'
      }
    }
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
    this.nr_of_sockets = nr_of_sockets
    this.cmnd_power_topics = []
    this.stat_power_topics = []
    this.power_status = []

    for (let i = 0; i < nr_of_sockets; i++) {
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
        if (nr_of_sockets == 1) {
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
  change_on_interval(mqtt_client, miliseconds, socket, state) {}
}
module.exports = SmartStrip
