const {
  getAllDevicesDB,
  deleteScenesCascade,
  filterDeviceList,
  updateDeviceLocaly,
  getDeviceByMqttName,
  getAllGroups,
  getObjectById,
} = require('../helpers')
const { insertDevice, updateDevice, deleteDevice } = require('../database')
const { DeviceTypes } = require('../deviceTypes')
const {
  getAllScenesLocaly,
  getAllDevicesLocaly,
  updateAllScenesLocaly,
  updateAllDevicesLocaly,
  updateAllTempDevices,
} = require('../localObjects')
class DeviceService {
  static getAllDevices(filter) {
    let devicesToReturn = getAllDevicesLocaly()
    if (filter) {
      devicesToReturn = filterDeviceList(filter, devicesToReturn)
    }
    return devicesToReturn
  }
  static getDeviceByID(deviceId) {
    let localDevices = getAllDevicesLocaly()
    return getObjectById(localDevices, deviceId)
  }
  static getDeviceByMqttName(deviceId) {
    let localDevices = getAllDevicesLocaly()
    return getDeviceByMqttName(localDevices, deviceId)
  }
  static async insertDevice(deviceData) {
    let returnedId = await insertDevice(deviceData)
    let devices = await getAllDevicesDB()
    updateAllTempDevices([])
    return devices
  }
  static async updateDevice(deviceId, deviceData) {
    let currentDevice = getObjectById(getAllDevicesLocaly(), deviceId)
    updateDeviceLocaly(currentDevice, deviceData)
    let returnedId = await updateDevice(deviceId, deviceData)
    return currentDevice
  }
  static async deleteDevice(deviceId) {
    let returnedId = await deleteDevice(deviceId)
    let devices = await getAllDevicesDB()
    let scenes = deleteScenesCascade(getAllScenesLocaly(), deviceId)
    updateAllScenesLocaly(scenes)
    updateAllDevicesLocaly(devices)
    return devices
  }
  static getMqttGroups() {
    let mqttGroups = getAllGroups(getAllDevicesLocaly())
    return mqttGroups
  }
  static getDeviceTypes() {
    return DeviceTypes
  }
}

module.exports = { DeviceService }
