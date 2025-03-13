const {
  filterDeviceList,
  getAllGroups,
  extractSceneInvolvedDevices,
  sortListBy,
} = require('../helpers/helpers')
const { DeviceTypes } = require('../helpers/deviceTypes')
const { DeviceCache } = require('../cache/deviceCache')
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
  static getTempDeviceByMqttName(mqttName) {
    return DeviceCache.getTempDeviceByMqttName(mqttName)
  }
  static async loadDeviceCache(userId) {
    console.log('\nLoading devices from database\n')
    let devicesToReturn = await DeviceCache.loadDeviceCache(userId)
    return devicesToReturn
  }
  static async getDevices(userId, filter, order, includeDeleted) {
    let devices = await DeviceCache.getDevices(userId, includeDeleted)
    if (filter) {
      devices = filterDeviceList(devices, filter)
    }
    if (order) {
      devices = sortListBy(devices, order)
    }
    return devices
  }
  static async getDeletedDevices(userId) {
    let devices = await DeviceCache.getDeletedDevices(userId)
    return devices
  }
  static async getSceneInvolvedDevices(userId) {
    let devices = await DeviceCache.getDevices(userId)
    let scenes = await SceneCache.getScenes(userId)
    return extractSceneInvolvedDevices(devices, scenes)
  }
  static async getDeviceById(deviceId, includeDeleted) {
    return await DeviceCache.getDeviceById(deviceId, includeDeleted)
  }
  static async getDeviceByMqttName(mqttName, includeDeleted) {
    return await DeviceCache.getDeviceByMqttName(mqttName, includeDeleted)
  }
  static async getDeviceByName(deviceName, includeDeleted) {
    return await DeviceCache.getDeviceByName(deviceName, includeDeleted)
  }
  static async insertDevice(deviceData) {
    return await DeviceCache.insertDevice(deviceData)
  }
  static async updateDeviceOnlyDB(deviceId, deviceData) {
    return await DeviceCache.updateDeviceOnlyDB(deviceId, deviceData)
  }
  static async updateDevice(deviceId, deviceData) {
    return await DeviceCache.updateDevice(deviceId, deviceData)
  }
  static async deleteDevice(deviceId) {
    await SceneCache.deleteScenesCascade(deviceId)
    return await DeviceCache.deleteDevice(deviceId)
  }
  static async destroyDevice(deviceId) {
    return await DeviceCache.destroyDevice(deviceId)
  }
  static async recoverDevice(deviceId) {
    return await DeviceCache.recoverDevice(deviceId)
  }
  static async getMqttGroups(userId) {
    let mqttGroups = getAllGroups(await DeviceService.getDevices(userId))
    return mqttGroups
  }
  static getDeviceTypes() {
    return DeviceTypes
  }
}

module.exports = { DeviceService }
