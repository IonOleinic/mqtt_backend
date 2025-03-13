const { DeviceService } = require('../services/deviceService')

class SmartStripController {
  async changePowerState(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
        req.query['device_id']
      )
      currentDevice.changePowerState(
        req.query['socket_nr'],
        req.query['status']
      )
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
}
module.exports = new SmartStripController()
