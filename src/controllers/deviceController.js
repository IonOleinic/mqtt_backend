const { mqttClient } = require('../mqtt/mqttClient')
const { DeviceService } = require('../services/deviceService')

class DeviceController {
  async createDevice(req, res) {
    let deviceData = req.body
    deviceData.user_id = req.query['user_id']
    try {
      if (
        (await DeviceService.getDeviceByMqttName(deviceData.mqtt_name)) &&
        deviceData.device_type !== 'smartIR'
      ) {
        res.status(409).json({ msg: 'Device already exists!' })
      } else {
        await DeviceService.insertDevice(deviceData)
        res.status(201).json({ msg: 'Device added with success' })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ succes: false, msg: 'Error ocurred!' })
    }
  }
  async updateDevice(req, res) {
    let deviceData = req.body
    try {
      let updatedDevice = await DeviceService.updateDevice(
        req.params['id'],
        deviceData
      )
      res.json(updatedDevice)
    } catch (error) {
      console.log(error)
      res.json(deviceData)
    }
  }
  async getDevices(req, res) {
    try {
      let devicesToReturn = await DeviceService.getAllDevices(
        req.query['user_id'],
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
        res.status(404).json({ msg: 'Device not found!' })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async deleteDevice(req, res) {
    try {
      if (req.params['id']) {
        await DeviceService.deleteDevice(req.params['id'])
      }
    } catch (error) {
      console.log(error)
    }
    let devices = await DeviceService.getAllDevices(req.query['user_id'])
    res.json(devices)
  }
  async getInitState(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceByID(req.params['id'])
      if (currentDevice.getInitialState) {
        currentDevice.getInitialState(mqttClient)
        res.json({ succes: true })
      } else {
        res.status(404).json({ msg: "Device doesn't exist" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Error occured!' })
    }
  }
  async getMqttGroups(req, res) {
    try {
      let mqttGroups = await DeviceService.getMqttGroups(req.query['user_id'])
      res.json(mqttGroups)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Error occured!' })
    }
  }
  async getDeviceTypes(req, res) {
    try {
      let deviceTypes = await DeviceService.getDeviceTypes()
      res.json(deviceTypes)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Error occured!' })
    }
  }
}

module.exports = new DeviceController()
