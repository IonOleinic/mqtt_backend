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
  getDevices() {
    return Array.from(this.devices.values())
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
    deviceData.name = deviceData.name
      ? deviceData.name
      : 'Device ' + Math.random().toString(16).slice(2, 7)
    try {
      const deviceDB = await Device.create(deviceData)
      let device = this.buildDeviceObj(deviceDB.dataValues)
      this.devices.set(deviceDB.id.toString(), device)
      return device
    } catch (error) {
      throw error
    }
  }
  async updateDevice(deviceId, deviceData) {
    let device = deviceData
    deviceData.mqtt_group = deviceData.mqtt_group.toString()
    try {
      const deviceDB = await Device.findByPk(deviceId)
      if (deviceDB) {
        await deviceDB.update(deviceData)
        device = this.devices.get(deviceId)
        this.updateDeviceLocaly(device, deviceData)
        this.devices.set(deviceId, device)
      }
      return device
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
      return Array.from(this.devices.values())
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
}

module.exports = new DeviceCache()
