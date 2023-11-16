const { DeviceService } = require('../services/deviceService')

class SmartLedController {
  async changePower(req, res) {
    let current_device = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (current_device) {
      current_device.sendChangePower(req.query['status'])
      res.json({ succes: true })
    } else {
      res.json({ succes: false })
    }
  }
  async changeDimmer(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (currentDevice) {
      currentDevice.sendChangeDimmer(req.query['dimmer'])
      res.json({ succes: true })
    } else {
      res.json({ succes: false })
    }
  }
  async changeColor(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (currentDevice) {
      currentDevice.sendChangeColor(req.query['color'])
      res.json({ succes: true })
    } else {
      res.json({ succes: false })
    }
  }
  async changeSpeed(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (currentDevice) {
      currentDevice.sendChangeSpeed(req.query['speed'])
      res.json({ succes: true })
    } else {
      res.json({ succes: false })
    }
  }
  async changeScheme(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (currentDevice) {
      currentDevice.sendChangeScheme(req.query['scheme'])
      res.json({ succes: true })
    } else {
      res.json({ succes: false })
    }
  }
  async changePalette(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (currentDevice) {
      currentDevice.sendChangePalette(req.query['palette'])
      res.json({ succes: true })
    } else {
      res.json({ succes: false })
    }
  }
}

module.exports = new SmartLedController()
