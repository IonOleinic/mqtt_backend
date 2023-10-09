const Device = require('./device')

class SmartStrip extends Device {
  constructor({
    id,
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    favorite,
    attributes = {},
  }) {
    super(
      id,
      name,
      img,
      manufacter,
      mqtt_name,
      mqtt_group,
      'smartStrip',
      false,
      false,
      favorite
    )
    this.switch_type = attributes.switch_type ? attributes.switch_type : 'plug'
    this.nr_of_sockets = attributes.nr_of_sockets ? attributes.nr_of_sockets : 1
    this.cmnd_power_topics = []
    this.stat_power_topics = []
    this.power_status = []
    if (img === '') {
      switch (this.switch_type) {
        case 'plug':
          if (this.nr_of_sockets == 1) {
            this.img =
              'https://s13emagst.akamaized.net/products/41611/41610854/images/res_d0e3e75338d6c66ce67fb30eb262ba18.png?width=300&height=300&hash=27432531CE4D755B47A28FB1B0327F48'
          } else if (this.nr_of_sockets == 2) {
            this.img =
              'https://www.calibereurope.com/wp-content/uploads/2022/09/e98075d2cfa89ca060bb9bda48cd624d6df51a3b_HWP121E-8.jpg'
          } else if (this.nr_of_sockets >= 3) {
            this.img =
              'https://ae01.alicdn.com/kf/H4fdb76beb6d44535b8cff5ffe43a53bfj/Gosund-16A-Eu-Tuya-Wifi-Smart-Power-Strip-Met-3-Usb-poorten-Onafhankelijke-Schakelaar-multi-Plug.jpg_Q90.jpg_.webp'
          }
          break
        case 'switch':
          if (this.nr_of_sockets == 1) {
            this.img =
              'https://avatars.mds.yandex.net/get-mpic/5251231/img_id5497564110416717005.jpeg/orig'
          } else if (this.nr_of_sockets == 2) {
            this.img =
              'https://images.tuyacn.com/ecommerce/16373901148f4e2815df2.jpg?x-oss-process=image/resize,w_510'
          } else if (this.nr_of_sockets == 3) {
            this.img =
              'https://images.tuyacn.com/ecommerce/1617240656aed309a7530.png?x-oss-process=image/resize,w_750'
          } else if (this.nr_of_sockets >= 4) {
            this.img =
              'https://5.imimg.com/data5/ECOM/Default/2022/12/RJ/VU/EF/26206366/166989386526574-gang-tuya-wifi-switch-250x250.jpg'
          }
          break
        case 'wall_switch':
          if (this.nr_of_sockets == 1) {
            this.img =
              'https://ae01.alicdn.com/kf/H1e624a7f7aec456e9f5b0401a1d99e4cS/ATHOM-Homekit-no-Neutral-Needed-WiFi-EU-Standard-Smart-Switch-Touch-key-1-gang-2-gang.jpg'
          } else if (this.nr_of_sockets == 2) {
            this.img =
              'https://cf.shopee.com.my/file/2f6c3b0298147dbf5f2fcd505d8aa412_tn'
          } else if (this.nr_of_sockets == 3) {
            this.img =
              'https://images-na.ssl-images-amazon.com/images/I/21KApqangYL._SL500_._AC_SL500_.jpg'
          } else if (this.nr_of_sockets >= 4) {
            this.img =
              'https://static-01.daraz.pk/p/28ed77f055ace4967a10d2a0b93e8c95.jpg'
          }
          break
        default:
          break
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
    for (let i = 0; i < this.nr_of_sockets; i++) {
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
        if (this.nr_of_sockets == 1) {
          this.stat_power_topics.push(`stat/${mqtt_name}/POWER`)
        } else {
          this.stat_power_topics.push(`stat/${mqtt_name}/POWER${i + 1}`)
        }
      }
      this.power_status.push('OFF')
    }
  }
  change_power_state(mqtt_client, socket, state) {
    this.send_mqtt_req(
      mqtt_client,
      `cmnd/${this.mqtt_name}/POWER${socket}`,
      state
    )
  }
  initDevice(mqtt_client) {
    this.subscribe_for_device_info(mqtt_client)
    for (let i = 0; i < this.stat_power_topics.length; i++) {
      this.subscribeToTopic(mqtt_client, this.stat_power_topics[i])
    }
    if (this.switch_type == 'plug') {
      this.subscribeToTopic(mqtt_client, this.stat_sensor_topic)
    }
    this.get_device_info(mqtt_client)
    this.get_initial_state(mqtt_client)
  }
  update_req(mqtt_client, req_topic) {
    if (this.manufacter === 'openBeken') {
      if (req_topic === 'STATUS') {
        //TODO
      }
    } else if (this.manufacter === 'tasmota') {
      if (req_topic === 'STATUS') {
        this.send_mqtt_req(mqtt_client, `cmnd/${this.mqtt_name}/STATUS`, '8')
      }
    }
  }
  get_initial_state(mqtt_client) {
    for (let i = 0; i < this.cmnd_power_topics.length; i++) {
      if (this.manufacter === 'tasmota') {
        this.change_power_state(mqtt_client, i + 1, '')
      } else if (this.manufacter === 'openBeken') {
        this.send_mqtt_req(mqtt_client, `${this.mqtt_name}/${i + 1}/get`, '')
      }
    }
    this.update_req(mqtt_client, 'STATUS')
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
    if (topic === this.stat_sensor_topic) {
      this.sensor_status = JSON.parse(value)
    }
    if (io) {
      io.emit('update_device', {
        device: this,
      })
    }
  }
}
module.exports = SmartStrip
