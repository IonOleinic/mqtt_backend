const Device = require('./device')

class SmartSwitch extends Device {
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
      'smartSwitch',
      'STATUS5',
      'MAC',
      'IP',
      false,
      favorite
    )
    if (img === '') {
      if (nr_of_sockets == 1) {
        this.img =
          'https://s13emagst.akamaized.net/products/50754/50753334/images/res_23e98f0d367e75ffbc82c216338f2309.jpg'
      } else if (nr_of_sockets == 2) {
        this.img =
          'https://cf.shopee.com.my/file/2f6c3b0298147dbf5f2fcd505d8aa412_tn'
      } else if (nr_of_sockets == 3) {
        this.img =
          'https://images-na.ssl-images-amazon.com/images/I/21KApqangYL._SL500_._AC_SL500_.jpg'
      } else if (nr_of_sockets >= 4) {
        this.img =
          'https://static-01.daraz.pk/p/28ed77f055ace4967a10d2a0b93e8c95.jpg'
      }
    }
    this.nr_of_sockets = nr_of_sockets
    this.cmnd_power_topics = []
    this.stat_power_topics = []
    this.power_status = []
    for (let i = 0; i < nr_of_sockets; i++) {
      this.cmnd_power_topics.push(`cmnd/${mqtt_name}/POWER${i + 1}`)
      if (this.manufacter === 'openBeken') {
        this.stat_power_topics.push(`${mqtt_name}/${i + 1}/get`)
      } else if (this.manufacter === 'tasmota') {
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
}
module.exports = SmartSwitch
