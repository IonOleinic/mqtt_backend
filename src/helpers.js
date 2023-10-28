const checkIfInScene = (device, scenes, topic, payload) => {
  for (let i = 0; i < scenes.length; i++) {
    if (
      device.id == scenes[i].cond_device_id ||
      device.mqtt_name == scenes[i].cond_device_mqtt
    ) {
      if (scenes[i].conditional_topic == topic) {
        if (scenes[i].conditional_payload == payload) {
          scenes[i].execute()
        }
      }
    }
  }
}
const getAllGroups = (devices) => {
  let mqttGroups = []
  for (let i = 0; i < devices.length; i++) {
    let mqtt_group = devices[i].mqtt_group
    if (typeof mqtt_group == 'string') {
      mqtt_group = mqtt_group.split(',')
    }
    for (let j = 0; j < mqtt_group.length; j++) {
      if (!mqttGroups.includes(devices[i].mqtt_group[j])) {
        mqttGroups.push(devices[i].mqtt_group[j])
      }
    }
  }
  return mqttGroups
}
const filterDeviceList = (filter, devices) => {
  let filteredDevices = []
  for (let i = 0; i < devices.length; i++) {
    if (devices[i].mqtt_group.includes(filter)) {
      filteredDevices.push(devices[i])
    }
  }
  return filteredDevices
}
const subscribeToTopic = (mqttClient, topicToSubcribe) => {
  mqttClient.subscribe(`${topicToSubcribe}`, () => {
    console.log(`Client subscried on ${topicToSubcribe}`)
  })
}
const getDeviceByMqttName = (devices, mqttName) => {
  let filteredDevices = devices.filter((device) => device.mqtt_name == mqttName)
  return filteredDevices[0]
}

module.exports = {
  checkIfInScene,
  getAllGroups,
  filterDeviceList,
  subscribeToTopic,
  getDeviceByMqttName,
}
