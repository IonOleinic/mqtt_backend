const { DeviceService } = require('../services/deviceService')

class SmartDoorSensorController {
  async toggleDoor(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceByID(
        req.query['device_id']
      )
      currentDevice.sendToggleReq()
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
}

module.exports = new SmartDoorSensorController()
