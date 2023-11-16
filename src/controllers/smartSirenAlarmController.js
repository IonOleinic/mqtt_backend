const { DeviceService } = require('../services/deviceService')

class SmartSirenAlarmController {
  async changePowerState(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    currentDevice.changePowerState(1, req.query['status'])
    res.json({ succes: true })
  }
  async updateOptions(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    currentDevice.updateOptions(
      req.query['new_sound'],
      req.query['new_volume'],
      req.query['new_duration']
    )
    res.json({
      succes: true,
    })
  }
}

module.exports = new SmartSirenAlarmController()
