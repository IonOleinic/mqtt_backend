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
  devices.forEach((device) => {
    let mqtt_group = device.mqtt_group
    if (typeof mqtt_group == 'string') {
      mqtt_group = mqtt_group.split(',')
    }
    mqtt_group.forEach((group) => {
      if (!mqttGroups.includes(group)) {
        mqttGroups.push(group)
      }
    })
  })
  return mqttGroups
}
const filterDeviceList = (filter, devices) => {
  let filteredDevices = devices.filter((device) =>
    device.mqtt_group.includes(filter)
  )
  return filteredDevices
}
const subscribeToTopic = (mqttClient, topicToSubcribe) => {
  mqttClient.subscribe(`${topicToSubcribe}`, () => {
    console.log(`Client subscried on ${topicToSubcribe}`)
  })
}

module.exports = {
  checkIfInScene,
  getAllGroups,
  filterDeviceList,
  subscribeToTopic,
}
