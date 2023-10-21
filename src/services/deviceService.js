const {
  filterDeviceList,
  getDeviceByMqttName,
  getAllGroups,
} = require('../helpers')
const { DeviceTypes } = require('../deviceTypes')
const DeviceCache = require('../cache/deviceCache')
const SceneCache = require('../cache/sceneCache')

class DeviceService {
  static getAllTempDevices() {
    return DeviceCache.getTempDevices()
  }
  static insertTempDevice(tempDevice) {
    return DeviceCache.insertTempDevice(tempDevice)
  }
  static deleteTempDevice(tempDeviceId) {
    return DeviceCache.deleteTempDevice(tempDeviceId)
  }
  static async getAllDevices(filter) {
    let devicesToReturn = await DeviceCache.getDevices()
    if (filter) {
      devicesToReturn = filterDeviceList(filter, devicesToReturn)
    }
    return devicesToReturn
  }
  static async getDeviceByID(deviceId) {
    return await DeviceCache.getDevice(deviceId)
  }
  static async insertDevice(deviceData) {
    return await DeviceCache.insertDevice(deviceData)
  }
  static async updateDevice(deviceId, deviceData) {
    return await DeviceCache.updateDevice(deviceId, deviceData)
  }
  static async deleteDevice(deviceId) {
    await SceneCache.deleteScenesCascade(deviceId)
    return await DeviceCache.deleteDevice(deviceId)
  }
  static async getMqttGroups() {
    let mqttGroups = getAllGroups(await DeviceService.getAllDevices())
    return mqttGroups
  }
  static getDeviceByMqttName(
    deviceId,
    listOfDevices = DeviceCache.getDevices()
  ) {
    return getDeviceByMqttName(listOfDevices, deviceId)
  }
  static getDeviceTypes() {
    return DeviceTypes
  }
}

module.exports = { DeviceService }
