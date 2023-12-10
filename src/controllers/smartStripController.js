const { DeviceService } = require('../services/deviceService')

class SmartStripController {
  async updateReq(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceByID(
        req.query['device_id']
      )
      currentDevice.updateReq(req.query['req_topic'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
  async changePowerState(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceByID(
        req.query['device_id']
      )
      currentDevice.changePowerState(
        req.query['socket_nr'],
        req.query['status']
      )
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
}
module.exports = new SmartStripController()
