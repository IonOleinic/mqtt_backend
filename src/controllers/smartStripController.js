const { DeviceService } = require('../services/deviceService')

class SmartStripController {
  async updateReq(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (currentDevice) {
      currentDevice.updateReq(req.query['req_topic'])
    }
    res.json(currentDevice)
  }
  async changePowerState(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (currentDevice) {
      currentDevice.changePowerState(
        req.query['socket_nr'],
        req.query['status']
      )
      res.json({ succes: true })
    } else {
      res.json({ succes: false })
    }
  }
}
module.exports = new SmartStripController()
