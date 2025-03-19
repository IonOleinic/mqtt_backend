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
const filterDeviceList = (devices, filter) => {
  let filteredDevices = devices.filter((device) => {
    let toReturn = true
    if (filter) {
      if (filter.name != null && filter.name != undefined) {
        if (!device.name.toUpperCase().includes(filter.name.toUpperCase())) {
          toReturn = false
        }
      }
      if (filter.favorite !== null && filter.favorite !== undefined) {
        if (device.favorite !== filter.favorite) {
          toReturn = false
        }
      }
      if (
        filter.groups !== null &&
        filter.groups !== undefined &&
        filter.groups.length > 0
      ) {
        if (!filter.groups.includes(device.group_id)) {
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
      if (filter.name != null && filter.name != undefined) {
        if (!scene.name.toUpperCase().includes(filter.name.toUpperCase())) {
          toReturn = false
        }
      }
      if (filter.favorite !== null && filter.favorite !== undefined) {
        if (scene.favorite !== filter.favorite) {
          toReturn = false
        }
      }
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

const subscribeToTopic = (topicToSubcribe) => {
  mqttClient.subscribe(`${topicToSubcribe}`, () => {
    console.log(`Client subscried on ${topicToSubcribe}`)
  })
}

module.exports = {
  checkIfInScene,
  filterDeviceList,
  filterSceneList,
  sortListBy,
  extractSceneInvolvedDevices,
  subscribeToTopic,
}
