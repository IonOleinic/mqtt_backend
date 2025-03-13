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
const filterDeviceList = (devices, filter) => {
  let filteredDevices = devices.filter((device) => {
    let toReturn = true
    if (filter) {
      if (filter.group !== null && filter.group !== undefined) {
        if (!device.mqtt_group.includes(filter.group)) {
          toReturn = false
        }
      }
      if (filter.favorite !== null && filter.favorite !== undefined) {
        if (device.favorite !== filter.favorite) {
          toReturn = false
        }
      }
      if (filter.name != null && filter.name != undefined) {
        if (!device.name.toUpperCase().includes(filter.name.toUpperCase())) {
          toReturn = false
        }
      }
    }
    return toReturn
  })
  return filteredDevices
}
const filterSceneList = (scenes, filter) => {
  let filteredScenes = scenes.filter((scene) => {
    let toReturn = true
    if (filter) {
      if (
        filter.devices !== null &&
        filter.devices !== undefined &&
        filter.devices.length > 0
      ) {
        if (
          !filter.devices.includes(scene.cond_device_id) &&
          !filter.devices.includes(scene.exec_device_id)
        ) {
          toReturn = false
        }
      }
      if (filter.favorite !== null && filter.favorite !== undefined) {
        if (scene.favorite !== filter.favorite) {
          toReturn = false
        }
      }
      if (filter.name != null && filter.name != undefined) {
        if (!scene.name.toUpperCase().includes(filter.name.toUpperCase())) {
          toReturn = false
        }
      }
    }
    return toReturn
  })
  return filteredScenes
}

const sortListBy = (list, order = 'DATE') => {
  if (order.toUpperCase() === 'NAME') {
    list = list.sort((a, b) => (a.name > b.name ? 1 : -1))
  } else if (order.toUpperCase() === 'DATE') {
    list = list.sort((a, b) =>
      new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1
    )
  }
  return list
}

const extractSceneInvolvedDevices = (devices, scenes) => {
  let involvedDevices = []
  devices.forEach((device) => {
    scenes.forEach((scene) => {
      if (
        device.id == scene.cond_device_id ||
        device.id == scene.exec_device_id
      ) {
        if (!involvedDevices.includes(device)) {
          involvedDevices.push(device)
        }
      }
    })
  })
  return involvedDevices
}

const subscribeToTopic = (
  mqttextractSceneInvolvedDevicesClient,
  topicToSubcribe
) => {
  mqttClient.subscribe(`${topicToSubcribe}`, () => {
    console.log(`Client subscried on ${topicToSubcribe}`)
  })
}

module.exports = {
  checkIfInScene,
  getAllGroups,
  filterDeviceList,
  filterSceneList,
  sortListBy,
  extractSceneInvolvedDevices,
  subscribeToTopic,
}
