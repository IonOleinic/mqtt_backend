const { Device } = require('../../models')
const { GroupService } = require('../services/groupService.js')
const SmartLed = require('../devices/smartLed.js')
const SmartMotionSensor = require('../devices/smartMotionSensor.js')
const SmartIR = require('../devices/smartIR.js')
const SmartTempSensor = require('../devices/smartTempSensor.js')
const SmartDoorSensor = require('../devices/smartDoorSensor.js')
const SmartSirenAlarm = require('../devices/smartSirenAlarm.js')
const SmartSwitch = require('../Devices/smartSwitch.js')
const ZbHub = require('../Devices/zbHub.js')

class DeviceCache {
  static devices = new Map()
  static tempDevices = new Map()

  static async loadDeviceCache(userId) {
    try {
      for (const device of Array.from(this.devices.values())) {
        device.clearIntervals() //clear all devices (setInterval functions) from memory
      }

      let devicesFromDB = []
      this.tempDevices = new Map()

      if (userId) {
        devicesFromDB = await Device.findAll({ where: { user_id: userId } })
      } else {
        this.devices = new Map()
        devicesFromDB = await Device.findAll()
      }
      const groups = await GroupService.getGroupsAsMap(userId)
      for (const instance of devicesFromDB) {
        const deviceData = instance.dataValues
        const groupName = groups.get(deviceData.group_id)?.name || ''
        const deviceObj = await this.buildDeviceObj(
          { ...deviceData, group_name: groupName },
          false
        )
        this.devices.set(deviceData.id, deviceObj)
      }
    } catch (error) {
      console.log(error)
    }
    return await this.getDevices(userId)
  }
  static async getDevices(userId, includeDeleted) {
    let allDevices = Array.from(this.devices.values()).filter((device) => {
      return (
        (!userId || device.user_id == userId) &&
        (includeDeleted || !device.is_deleted)
      )
    })
    return allDevices
  }
  static async getDeletedDevices(userId) {
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
  static async getDeviceById(deviceId, includeDeleted) {
    try {
      let device = undefined
      if (this.devices.has(deviceId)) {
        device = this.devices.get(deviceId)
      }
      if (!device) {
        // If the device is not in the cache, load it from the database
        const deviceDB = await Device.findByPk(deviceId)
        if (deviceDB) {
          device = await this.buildDeviceObj(deviceDB.dataValues)
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
  static async getDeviceByMqttName(mqttName, includeDeleted) {
    try {
      let device = undefined
      let allDevices = Array.from(this.devices.values())
      device = allDevices.filter((device) => device.mqtt_name == mqttName)[0]
      if (!device) {
        // If the device is not in the cache, load it from the database
        const deviceDB = await Device.findOne({
          where: { mqtt_name: mqttName },
        })
        if (deviceDB) {
          device = await this.buildDeviceObj(deviceDB.dataValues)
          this.devices.set(deviceDB.id, device) //load it in cache
        }
      }
      if (!includeDeleted) {
        if (device?.is_deleted == false) return device
      } else return device
    } catch (error) {
      throw error
    }
  }
  static async getDeviceByName(deviceName, includeDeleted) {
    try {
      let device = undefined
      let allDevices = Array.from(this.devices.values())
      device = allDevices.filter((device) => device.name == deviceName)[0]
      if (!device) {
        // If the device is not in the cache, load it from the database
        const deviceDB = await Device.findOne({
          where: { name: deviceName },
        })
        if (deviceDB) {
          device = await this.buildDeviceObj(deviceDB.dataValues)
          this.devices.set(deviceDB.id, device) //load it in cache
        }
      }
      if (!includeDeleted) {
        if (device?.is_deleted == false) return device
      } else return device
    } catch (error) {
      throw error
    }
  }
  static async insertDevice(deviceData) {
    let deviceDB = undefined
    try {
      deviceDB = await Device.create(deviceData)
      const device = await this.buildDeviceObj(deviceDB.dataValues)
      this.devices.set(deviceDB.id, device)
      return device
    } catch (error) {
      if (deviceDB) deviceDB.destroy()
      throw error
    }
  }
  static async updateDevice(deviceId, deviceData) {
    let device = deviceData
    try {
      const deviceDB = await Device.findByPk(deviceId)
      if (deviceDB) {
        await deviceDB.update(deviceData)
        device = this.devices.get(deviceId)
        if (device.name != deviceData.name) {
          if (device.zbChangeName) device.zbChangeName(deviceData.name)
        }
        this.updateDeviceLocaly(device, deviceData)
        this.devices.set(deviceId, device)
      }
      return device
    } catch (error) {
      throw error
    }
  }
  static async recoverDevice(deviceId) {
    try {
      const deviceDB = await Device.findByPk(deviceId)
      if (deviceDB) {
        deviceDB.is_deleted = false
        await deviceDB.update(deviceDB.dataValues)
        let device = this.devices.get(deviceId) // update device in cache
        device.is_deleted = true
        this.devices.set(deviceId, device)
      }
      return true
    } catch (error) {
      throw error
    }
  }
  static async updateDeviceOnlyDB(deviceId, deviceData) {
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
  static async deleteDevice(deviceId) {
    try {
      const deviceDB = await Device.findByPk(deviceId)
      if (deviceDB) {
        // if (deviceDB.device_type == 'smartIR') {
        //   await this.destroyDevice(deviceId)
        // } else {
        deviceDB.is_deleted = true
        await deviceDB.update(deviceDB.dataValues)
        let device = this.devices.get(deviceId)
        device.is_deleted = true
        device.clearIntervals()
        this.devices.set(deviceId, device)
        // }
      }
      return true
    } catch (error) {
      throw error
    }
  }
  static async destroyDevice(deviceId) {
    try {
      const deviceDB = await Device.findByPk(deviceId)
      if (deviceDB) {
        await deviceDB.destroy()
        let device = this.devices.get(deviceId)
        device.destroy()
        this.devices.delete(deviceId)
      }
      return true
    } catch (error) {
      throw error
    }
  }
  static getTempDevices() {
    return Array.from(this.tempDevices.values())
  }
  static insertTempDevice(tempDevice) {
    this.tempDevices.set(tempDevice.id, tempDevice)
    return tempDevice
  }
  static deleteTempDevice(tempDeviceId) {
    this.tempDevices.delete(tempDeviceId)
    return Array.from(this.tempDevices.values())
  }
  static getTempDeviceByMqttName(mqttName) {
    let allTempDevices = Array.from(this.tempDevices.values())
    let device = allTempDevices.filter(
      (device) => device.mqtt_name == mqttName
    )[0]
    return device
  }
  static async buildDeviceObj(deviceData, addGroupName = true) {
    let device = {}
    if (addGroupName) {
      deviceData.group_name =
        (await GroupService.getGroupById(deviceData.group_id))?.name || ''
    }
    switch (deviceData.device_type) {
      case 'smartSwitch':
        device = new SmartSwitch(deviceData)
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
      case 'zbHub':
        device = new ZbHub(deviceData)
        break
      default:
        break
    }
    if (device.initDevice) {
      device.initDevice()
    }
    return device
  }
  static updateDeviceLocaly(oldDevice, newDevice) {
    oldDevice.name = newDevice.name
    oldDevice.mqtt_name = newDevice.mqtt_name
    oldDevice.group_id = newDevice.group_id
    oldDevice.group_name = newDevice.group_name
    oldDevice.favorite = newDevice.favorite
    oldDevice.is_deleted = newDevice.is_deleted
    oldDevice.manufacter = newDevice.manufacter
    oldDevice.available = newDevice.available
    oldDevice.attributes = newDevice.attributes
  }
}

module.exports = { DeviceCache }
