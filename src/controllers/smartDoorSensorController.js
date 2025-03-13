const { DeviceService } = require('../services/deviceService')

class SmartDoorSensorController {
  async toggleDoor(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
        req.query['device_id']
      )
      currentDevice.sendToggleReq()
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
}

module.exports = new SmartDoorSensorController()
