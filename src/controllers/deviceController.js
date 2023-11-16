const { mqttClient } = require('../mqttClient')
const { DeviceService } = require('../services/deviceService')

class DeviceController {
  async createDevice(req, res) {
    let deviceData = req.body
    let result = { succes: false, msg: 'ERROR' }
    try {
      if (
        (await DeviceService.getDeviceByMqttName(deviceData.mqtt_name)) &&
        deviceData.device_type !== 'smartIR'
      ) {
        result = { succes: false, msg: 'Device already exists!' }
      } else {
        await DeviceService.insertDevice(deviceData)
        result = { succes: true, msg: 'Device added with succes' }
      }
    } catch (error) {
      console.log(error)
      result = { succes: false, msg: 'Error ocurred!' }
    }

    res.json(result)
  }
  async updateDevice(req, res) {
    let deviceData = req.body
    let currentDevice = DeviceService.getDeviceByID(req.params['id'])
    try {
      let updatedDevice = await DeviceService.updateDevice(
        req.params['id'],
        deviceData
      )
      res.json(updatedDevice)
    } catch (error) {
      console.log(error)
      res.json(currentDevice)
    }
  }
  async getDevices(req, res) {
    try {
      let devicesToReturn = await DeviceService.getAllDevices(
        req.query['filter']
      )
      res.json(devicesToReturn)
    } catch (error) {
      console.log(error)
      res.json({ succes: false, msg: 'Server error' })
    }
  }
  async getDevice(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceByID(req.params['id'])
      if (currentDevice) {
        res.json(currentDevice)
      } else {
        res.json({ succes: false, msg: "Device doesn't exist" })
      }
    } catch (error) {
      console.log(error)
      res.json({ succes: false, msg: 'Server error' })
    }
  }
  async deleteDevice(req, res) {
    let devices = await DeviceService.getAllDevices()
    try {
      if (req.params['id']) {
        devices = await DeviceService.deleteDevice(req.params['id'])
      }
    } catch (error) {
      console.log(error)
    }
    res.json(devices)
  }
  async getInitState(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(req.params['id'])
    if (currentDevice.getInitialState) {
      currentDevice.getInitialState(mqttClient)
      res.json({ succes: true })
    } else {
      res.json({ succes: false, msg: "Device doesn't exist" })
    }
  }
  async getMqttGroups(req, res) {
    let mqttGroups = await DeviceService.getMqttGroups()
    res.json(mqttGroups)
  }
  async getDeviceTypes(req, res) {
    let deviceTypes = await DeviceService.getDeviceTypes()
    res.json(deviceTypes)
  }
}

module.exports = new DeviceController()
