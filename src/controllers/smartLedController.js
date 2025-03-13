const { DeviceService } = require('../services/deviceService')

class SmartLedController {
  async changePower(req, res) {
    try {
      let current_device = await DeviceService.getDeviceById(
        req.query['device_id']
      )
      current_device.sendChangePower(req.query['status'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async changeDimmer(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
        req.query['device_id']
      )
      currentDevice.sendChangeDimmer(req.query['dimmer'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async changeColor(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
        req.query['device_id']
      )
      currentDevice.sendChangeColor(req.query['color'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async changeSpeed(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
        req.query['device_id']
      )
      currentDevice.sendChangeSpeed(req.query['speed'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async changeScheme(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
        req.query['device_id']
      )
      currentDevice.sendChangeScheme(req.query['scheme'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async changePalette(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
        req.query['device_id']
      )
      currentDevice.sendChangePalette(req.query['palette'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
}

module.exports = new SmartLedController()
