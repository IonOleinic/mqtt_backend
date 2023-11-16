const { DeviceService } = require('../services/deviceService')

class SmartDoorSensorController {
  async toggleDoor(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (currentDevice) {
      currentDevice.sendToggleReq()
    }
    res.json({ succes: true })
  }
}

module.exports = new SmartDoorSensorController()
