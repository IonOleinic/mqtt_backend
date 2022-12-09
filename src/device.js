class Device {
  constructor(
    name,
    img,
    manufacter,
    mqtt_name,
    mqtt_group,
    device_type,
    device_info_topic,
    MAC,
    IP,
    battery
  ) {
    this.id = Math.random().toString(16).slice(3)
    this.manufacter = manufacter
    this.img =
      img === ''
        ? 'https://cdn-icons-png.flaticon.com/512/2948/2948319.png'
        : img
    this.battery = battery
    this.name = name
    this.mqtt_name = mqtt_name
    if (mqtt_group === '') {
      this.mqtt_group = []
    } else {
      this.mqtt_group = mqtt_group.replaceAll(',', ', ').split(',')
    }
    this.mqtt_group.splice(0, 0, 'General')
    this.device_type = device_type
    this.device_info_topic = `stat/${mqtt_name}/${device_info_topic}`
    this.MAC = MAC
    this.IP = IP
  }
}

module.exports = Device
