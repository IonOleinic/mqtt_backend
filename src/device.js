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
    this.manufacter = manufacter
    this.img = img
    this.battery = battery
    this.name = name
    this.mqtt_name = mqtt_name
    this.mqtt_group = mqtt_group
    this.device_type = device_type
    this.device_info_topic = `stat/${mqtt_name}/${device_info_topic}`
    this.MAC = MAC
    this.IP = IP
  }
}

module.exports = Device
