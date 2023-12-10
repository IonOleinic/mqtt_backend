const { Device } = require('../../models')
const SmartLed = require('../devices/smartLed.js')
const SmartMotionSensor = require('../devices/smartMotionSensor.js')
const SmartStrip = require('../devices/smartStrip.js')
const SmartIR = require('../devices/smartIR.js')
const SmartTempSensor = require('../devices/smartTempSensor.js')
const SmartDoorSensor = require('../devices/smartDoorSensor.js')
const SmartSirenAlarm = require('../devices/smartSirenAlarm.js')
class DeviceCache {
  constructor() {
    this.devices = new Map()
    this.tempDevices = new Map()
    this.initDeviceCache()
  }
  async initDeviceCache() {
    try {
      let devicesFromDB = await Device.findAll()
      devicesFromDB.forEach((instance) => {
        let deviceDB = instance.dataValues
        this.devices.set(deviceDB.id.toString(), this.buildDeviceObj(deviceDB))
      })
    } catch (error) {
      console.log(error)
    }
    return this.getDevices()
  }
  getDevices(userId) {
    const allDevices = Array.from(this.devices.values())
    if (userId) {
      return allDevices.filter((device) => device.user_id == userId)
    }
    return allDevices
  }
  async getDevice(deviceId) {
    try {
      if (this.devices.has(deviceId)) {
        return this.devices.get(deviceId)
      }
      // If the device is not in the cache, load it from the database
      const deviceDB = await Device.findByPk(deviceId)
      let device = this.buildDeviceObj(deviceDB.dataValues)
      if (deviceDB) {
        this.devices.set(deviceId, device)
      }
      return device
    } catch (error) {
      throw error
    }
  }
  async insertDevice(deviceData) {
    let deviceDB = undefined
    deviceData.name = deviceData.name
      ? deviceData.name
      : 'Device ' + Math.random().toString(16).slice(2, 7)
    try {
      deviceDB = await Device.create(deviceData)
      let device = this.buildDeviceObj(deviceDB.dataValues)
      this.devices.set(deviceDB.id.toString(), device)
      return device
    } catch (error) {
      if (deviceDB) deviceDB.destroy()
      throw error
    }
  }
  async updateDevice(deviceId, deviceData) {
    let device = deviceData
    deviceData.mqtt_group = deviceData.mqtt_group.toString()
    // this.constructAttributes(deviceData)
    try {
      const deviceDB = await Device.findByPk(deviceId)
      if (deviceDB) {
        await deviceDB.update(deviceData)
        deviceData.mqtt_group = deviceData.mqtt_group.split(',')
        device = this.devices.get(deviceId.toString())
        this.updateDeviceLocaly(device, deviceData)
        this.devices.set(deviceId, device)
      }
      return device
    } catch (error) {
      throw error
    }
  }
  async updateDeviceOnlyDB(deviceId, deviceData) {
    deviceData.mqtt_group = deviceData.mqtt_group.toString()
    this.constructAttributes(deviceData)
    try {
      const deviceDB = await Device.findByPk(deviceId)
      if (deviceDB) {
        await deviceDB.update(deviceData)
      }
      return deviceData
    } catch (error) {
      throw error
    }
  }
  async deleteDevice(deviceId) {
    try {
      const deviceDB = await Device.findByPk(deviceId)
      if (deviceDB) {
        await deviceDB.destroy()
        this.devices.delete(deviceId)
      }
      return true
    } catch (error) {
      throw error
    }
  }
  getTempDevices() {
    return Array.from(this.tempDevices.values())
  }
  insertTempDevice(tempDevice) {
    this.tempDevices.set(tempDevice.id, tempDevice)
    return tempDevice
  }
  deleteTempDevice(tempDeviceId) {
    this.tempDevices.delete(tempDeviceId)
    return Array.from(this.tempDevices.values())
  }
  buildDeviceObj(deviceData) {
    let device = {}
    switch (deviceData.device_type) {
      case 'smartPlug':
      case 'smartSwitch':
      case 'smartStrip':
        device = new SmartStrip(deviceData)
        break
      case 'smartIR':
        this.tempDevices.clear()
        device = new SmartIR(deviceData)
        break
      case 'smartLed':
        device = new SmartLed(deviceData)
        break
      case 'smartDoorSensor':
        device = new SmartDoorSensor(deviceData)
        break
      case 'smartTempSensor':
        device = new SmartTempSensor(deviceData)
        break
      case 'smartMotionSensor':
        device = new SmartMotionSensor(deviceData)
        break
      case 'smartSirenAlarm':
        device = new SmartSirenAlarm(deviceData)
        break
      default:
        break
    }
    if (device.initDevice) {
      device.initDevice()
    }
    return device
  }
  updateDeviceLocaly(oldDevice, newDevice) {
    oldDevice.name = newDevice.name
    oldDevice.mqtt_name = newDevice.mqtt_name
    oldDevice.mqtt_group = newDevice.mqtt_group
    oldDevice.favorite = newDevice.favorite
    oldDevice.img = newDevice.img
    oldDevice.manufacter = newDevice.manufacter
    oldDevice.available = newDevice.available
  }
  constructAttributes(deviceData) {
    if (deviceData.device_type === 'smartTempSensor') {
      deviceData.attributes = {
        temperature: deviceData.temperature,
        humidity: deviceData.humidity,
        battery_level: deviceData.battery_level,
      }
    }
    if (deviceData.device_type === 'smartSirenAlarm') {
      deviceData.attributes = {
        status: deviceData.status,
        temperature: deviceData.temperature,
        humidity: deviceData.humidity,
        volume: deviceData.volume,
        sound: deviceData.sound,
        sound_duration: deviceData.sound_duration,
        battery_level: deviceData.battery_level,
      }
    }
    if (deviceData.device_type === 'smartDoorSensor') {
      deviceData.attributes = {
        status: deviceData.status,
        battery_level: deviceData.battery_level,
      }
    }
  }
}

module.exports = new DeviceCache()
