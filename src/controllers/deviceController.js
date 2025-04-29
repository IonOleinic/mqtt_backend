const { mqttClient } = require('../mqtt/mqttClient')
const { DeviceService } = require('../services/deviceService')
const { mapDeviceToViewModel } = require('../mappers/deviceMapper')
class DeviceController {
  async createDevice(req, res) {
    let deviceData = req.body
    deviceData.user_id = Number(req.query['user_id'])
    try {
      const sameMqttNameDevice = await DeviceService.getDeviceByMqttName(
        deviceData.mqtt_name,
        true
      )
      const sameNameDevice = await DeviceService.getDeviceByName(
        deviceData.name,
        true
      )
      if (sameMqttNameDevice || sameNameDevice) {
        if (sameNameDevice) {
          res.status(409).json({
            msg: 'A device with same name or MQTT Name already exists!',
          })
        } else {
          if (deviceData.device_type === 'smartIR') {
            await DeviceService.insertDevice(deviceData)
            res.status(201).json({ msg: 'A device added with success' })
          } else {
            if (sameMqttNameDevice.is_deleted)
              res.status(409).json({
                msg: 'A device with same MQTT Name was found in your recycle bin!',
              })
            else
              res.status(409).json({
                msg: 'A device with same name or MQTT Name already exists!',
              })
          }
        }
      } else {
        await DeviceService.insertDevice(deviceData)
        res.status(201).json({ msg: 'Device added with success' })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async updateDevice(req, res) {
    let deviceData = req.body
    try {
      let updatedDevice = await DeviceService.updateDevice(
        req.params['id'],
        deviceData
      )
      res.json(mapDeviceToViewModel(updatedDevice))
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async getDevices(req, res) {
    try {
      let devices = await DeviceService.getDevices(
        req.query['user_id'],
        JSON.parse(req.query['filter'] || '{}'),
        req.query['order']
      )
      res.json(devices.map((device) => mapDeviceToViewModel(device)))
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async getDeletedDevices(req, res) {
    try {
      let devices = await DeviceService.getDeletedDevices(req.query['user_id'])
      devices = devices.map((device) => mapDeviceToViewModel(device))
      res.json(devices)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async loadDeviceCache(req, res) {
    try {
      const devices = await DeviceService.loadDeviceCache(req.query['user_id'])
      res.json(devices.map((device) => mapDeviceToViewModel(device)))
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async getDevice(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
        req.params['id'],
        true
      )
      if (currentDevice) {
        res.json(mapDeviceToViewModel(currentDevice))
      } else {
        res.status(404).json({ msg: 'Device not found!' })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async getSceneInvolvedDevices(req, res) {
    try {
      let devices = await DeviceService.getSceneInvolvedDevices(
        req.query['user_id']
      )
      devices = devices.map((device) => mapDeviceToViewModel(device))
      res.json(devices)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async recoverDevice(req, res) {
    try {
      let currentDevice = await DeviceService.recoverDevice(req.params['id'])
      if (currentDevice) {
        await DeviceService.loadDeviceCache(req.query['user_id'])
        res.json({ succes: true })
      } else {
        res.status(404).json({ msg: 'Device not found!' })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async recoverAllDevices(req, res) {
    try {
      const recoverList = req.query['recoverList'].split(',')
      let result = false
      for (const deviceId of recoverList) {
        result = await DeviceService.recoverDevice(deviceId)
        if (!result) throw `fail to recover device with id=${deviceId}`
      }
      if (result) {
        await DeviceService.loadDeviceCache(req.query['user_id'])
        res.json({ succes: true })
      } else {
        res.json({ succes: false })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async destroyDevice(req, res) {
    try {
      const result = await DeviceService.destroyDevice(req.params['id'])
      if (result) {
        await DeviceService.loadDeviceCache(req.query['user_id'])
        res.json({ succes: true })
      } else {
        res.json({ succes: false })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async destroyAllDevices(req, res) {
    try {
      const destroyList = req.query['destroyList'].split(',')
      let result = false
      for (const deviceId of destroyList) {
        result = await DeviceService.destroyDevice(deviceId)
        if (!result) throw `fail to destroy device with id=${deviceId}`
      }
      if (result) {
        await DeviceService.loadDeviceCache(req.query['user_id'])
        res.json({ succes: true })
      } else {
        res.json({ succes: false })
      }
    } catch (error) {
      console.log(error)
      res.json({ succes: false, msg: error.message })
    }
  }
  async deleteDevice(req, res) {
    try {
      const result = await DeviceService.deleteDevice(req.params['id'])
      if (result) res.json({ succes: true })
      else res.json({ succes: false })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async getInitState(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(req.params['id'])
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
  async getDeviceTypes(req, res) {
    try {
      let deviceTypes = await DeviceService.getDeviceTypes()
      res.json(deviceTypes)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
}

module.exports = new DeviceController()
