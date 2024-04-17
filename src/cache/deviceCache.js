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
    this.loadDeviceCache()
  }
  async loadDeviceCache(userId) {
    try {
      let devicesFromDB = []
      this.tempDevices = new Map()
      if (userId)
        devicesFromDB = await Device.findAll({ where: { user_id: userId } })
      else {
        this.devices = new Map()
        devicesFromDB = await Device.findAll()
      }
      devicesFromDB.forEach((instance) => {
        let deviceData = instance.dataValues
        this.devices.set(
          deviceData.id.toString(),
          this.buildDeviceObj(deviceData)
        )
      })
    } catch (error) {
      console.log(error)
    }
    return await this.getDevices()
  }

  async getDevices(userId, includeDeleted) {
    let allDevices = Array.from(this.devices.values())
    if (userId)
      allDevices = allDevices.filter((device) => device.user_id == userId)

    if (!includeDeleted)
      allDevices = allDevices.filter((device) => device.is_deleted == false)

    return allDevices
  }
  async getDeletedDevices(userId) {
    let devicesFromDB = []
    if (userId)
      devicesFromDB = await Device.findAll({
        where: { user_id: userId, is_deleted: true },
      })
    else
      devicesFromDB = await Device.findAll({
        where: { is_deleted: true },
      })
    return devicesFromDB.map((device) => device.dataValues)
  }
  async getDeviceById(deviceId, includeDeleted) {
    try {
      let device = undefined
      if (this.devices.has(deviceId)) {
        device = this.devices.get(deviceId)
      }
      if (!device) {
        // If the device is not in the cache, load it from the database
        const deviceDB = await Device.findByPk(deviceId)
        if (deviceDB) {
          device = this.buildDeviceObj(deviceDB.dataValues)
          this.devices.set(deviceId, device)
        }
      }
      if (!includeDeleted) {
        if (device.is_deleted == false) return device
      } else return device
    } catch (error) {
      throw error
    }
  }
  async getDeviceByMqttName(mqttName, includeDeleted) {
    try {
      let device = undefined
      let allDevices = Array.from(this.devices.values())
      device = allDevices.filter((device) => device.mqtt_name == mqttName)[0]
      if (!device) {
        // If the device is not in the cache, load it from the database
        const deviceDB = await Device.findAll({
          where: { mqtt_name: mqttName },
        })[0]
        if (deviceDB) {
          device = this.buildDeviceObj(deviceDB.dataValues)
          this.devices.set(deviceDB.id.toString(), device) //load it in cache
        }
      }
      if (!includeDeleted) {
        if (device?.is_deleted == false) return device
      } else return device
    } catch (error) {
      throw error
    }
  }
  async getDeviceByName(deviceName, includeDeleted) {
    try {
      let device = undefined
      let allDevices = Array.from(this.devices.values())
      device = allDevices.filter((device) => device.name == deviceName)[0]
      if (!device) {
        // If the device is not in the cache, load it from the database
        const deviceDB = await Device.findAll({
          where: { name: deviceName },
        })[0]
        if (deviceDB) {
          device = this.buildDeviceObj(deviceDB.dataValues)
          this.devices.set(deviceDB.id.toString(), device) //load it in cache
        }
      }
      if (!includeDeleted) {
        if (device?.is_deleted == false) return device
      } else return device
    } catch (error) {
      throw error
    }
  }
  async insertDevice(deviceData) {
    let deviceDB = undefined
    deviceData.name = deviceData.name
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
  async recoverDevice(deviceId, deviceData) {
    try {
      const deviceDB = await Device.findByPk(deviceId)
      if (deviceDB) {
        if (deviceData) {
          deviceData.is_deleted = false
          await deviceDB.update(deviceData)
        } else {
          deviceDB.is_deleted = false
          await await deviceDB.update(deviceDB.dataValues)
        }
        let device = this.devices.get(deviceId.toString())
        device.is_deleted = true
        this.devices.set(deviceId, device)
      }
      return true
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
        // if (deviceDB.device_type == 'smartIR') {
        //   await this.destroyDevice(deviceId)
        // } else {
        deviceDB.is_deleted = true
        await deviceDB.update(deviceDB.dataValues)
        let device = this.devices.get(deviceId.toString())
        device.is_deleted = true
        this.devices.set(deviceId, device)
        // }
      }
      return true
    } catch (error) {
      throw error
    }
  }
  async destroyDevice(deviceId) {
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
  getTempDeviceByMqttName(mqttName) {
    let allTempDevices = Array.from(this.tempDevices.values())
    let device = allTempDevices.filter(
      (device) => device.mqtt_name == mqttName
    )[0]
    return device
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
    oldDevice.is_deleted = newDevice.is_deleted
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
    if (deviceData.device_type === 'smartStrip') {
      deviceData.attributes = {
        sensor_data: deviceData.sensor_data,
        switch_type: deviceData.switch_type,
        nr_of_sockets: deviceData.nr_of_sockets,
      }
    }
    if (deviceData.device_type === 'smartLed') {
      deviceData.attributes = {
        status: deviceData.status,
        led_type: deviceData.led_type,
        sub_type: deviceData.sub_type,
        color: deviceData.color,
        scheme: deviceData.scheme,
        dimmer: deviceData.dimmer,
        speed: deviceData.speed,
        palette: deviceData.palette,
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
    if (deviceData.device_type === 'smartMotionSensor') {
      deviceData.attributes = {
        auto_off: deviceData.auto_off,
        status: deviceData.status,
        battery_level: deviceData.battery_level,
      }
    }
  }
}

module.exports = new DeviceCache()
