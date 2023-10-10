const { mqttClient } = require('./mqttClient')
const { getDevices } = require('./database')
const SmartLed = require('./devices/smartLed.js')
const SmartMotionSensor = require('./devices/smartMotionSensor.js')
const SmartStrip = require('./devices/smartStrip.js')
const SmartIR = require('./devices/smartIR.js')
const SmartTempSensor = require('./devices/smartTempSensor.js')
const SmartDoorSensor = require('./devices/smartDoorSensor.js')
const SmartSirenAlarm = require('./devices/smartSirenAlarm.js')
const {
  updateAllTempDevices,
  getAllTempDevices,
  updateAllDevicesLocaly,
  updateAllScenesLocaly,
} = require('./localObjects')

const buildDeviceObj = (protoDevice) => {
  let device = {}
  if (protoDevice) {
    protoDevice.attributes = JSON.parse(protoDevice.attributes)
  }
  switch (protoDevice.device_type) {
    case 'smartPlug':
    case 'smartSwitch':
    case 'smartStrip':
      device = new SmartStrip(protoDevice)
      break
    case 'smartIR':
      let tempDevices = deleteObject(getAllTempDevices(), protoDevice.id)
      device = new SmartIR(protoDevice)
      updateAllTempDevices(tempDevices)
      break
    case 'smartLed':
      device = new SmartLed(protoDevice)
      break
    case 'smartDoorSensor':
      device = new SmartDoorSensor(protoDevice)
      break
    case 'smartTempSensor':
      device = new SmartTempSensor(protoDevice)
      break
    case 'smartMotionSensor':
      device = new SmartMotionSensor(protoDevice)
      break
    case 'smartSirenAlarm':
      device = new SmartSirenAlarm(protoDevice)
      break
    default:
      break
  }
  if (device.initDevice) {
    device.initDevice(mqttClient)
  }
  return device
}
const getAllDevicesDB = async () => {
  let protoDevices = await getDevices()
  let devices = []
  for (let i = 0; i < protoDevices.length; i++) {
    devices.push(buildDeviceObj(protoDevices[i]))
  }
  updateAllDevicesLocaly(devices)
  return devices
}
const checkIfInScene = (device, scenes, topic, payload) => {
  for (let i = 0; i < scenes.length; i++) {
    if (
      device.id == scenes[i].cond_device_id ||
      device.mqtt_name == scenes[i].cond_device_mqtt
    ) {
      if (scenes[i].conditional_topic == topic) {
        if (scenes[i].conditional_payload == payload) {
          scenes[i].execute(mqttClient)
        }
      }
    }
  }
}
const deleteScenesCascade = (scenes, deviceId) => {
  let tempScenes = scenes
  for (let i = 0; i < scenes.length; i++) {
    if (
      deviceId == scenes[i].cond_device_id ||
      deviceId == scenes[i].exec_device_id
    ) {
      if (scenes[i].delete) {
        scenes[i].delete()
      }
      tempScenes = deleteObject(tempScenes, scenes[i].id)
    }
  }
  return tempScenes
}
const deleteExpiredSchedules = (scenes) => {
  let tempScenes = scenes
  const dateNow = new Date()
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].scene_type == 'schedule') {
      if (scenes[i].isOnce()) {
        if (scenes[i].hour < dateNow.getHours()) {
          scenes[i].delete()
          tempScenes = deleteObject(tempScenes, scenes[i].id)
        } else if (
          scenes[i].hour == dateNow.getHours() &&
          scenes[i].minute < dateNow.getMinutes()
        ) {
          scenes[i].delete()
          tempScenes = deleteObject(tempScenes, scenes[i].id)
          updateAllScenesLocaly(tempScenes)
        }
      }
    }
  }
  return tempScenes
}
const toJSON = (object) => {
  var attrs = {}
  for (var attr in object) {
    if (typeof object[attr] != 'function') {
      try {
        attrs[attr] = String(object[attr]) // force to string
      } catch (error) {}
    }
  }
  return attrs
}
const getAllGroups = (devices) => {
  let mqttGroups = []
  for (let i = 0; i < devices.length; i++) {
    for (let j = 0; j < devices[i].mqtt_group.length; j++) {
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
const updateDeviceLocaly = (oldDevice, newDevice) => {
  oldDevice.name = newDevice.name
  oldDevice.mqtt_name = newDevice.mqtt_name
  oldDevice.mqtt_group = newDevice.mqtt_group
  oldDevice.favorite = newDevice.favorite
  oldDevice.img = newDevice.img
  oldDevice.manufacter = newDevice.manufacter
  // old_device = JSON.parse(JSON.stringify(new_device))
}
const updateSceneLocaly = (oldScene, newScene) => {
  oldScene.name = newScene.name
  oldScene.active = newScene.active
  oldScene.favorite = newScene.favorite
  oldScene.img = newScene.img
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
const getObjectById = (array, id) => {
  let filteredArray = array.filter((object) => object.id == id)
  return filteredArray[0]
}
const deleteObject = (array, objectId) => {
  let filteredArray = array.filter((object) => object.id != objectId)
  array = filteredArray
  return array
}

module.exports = {
  getAllDevicesDB,
  checkIfInScene,
  deleteScenesCascade,
  deleteExpiredSchedules,
  toJSON,
  getAllGroups,
  filterDeviceList,
  updateDeviceLocaly,
  updateSceneLocaly,
  subscribeToTopic,
  getDeviceByMqttName,
  getObjectById,
  deleteObject,
}
