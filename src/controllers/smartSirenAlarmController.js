const { DeviceService } = require('../services/deviceService')

class SmartSirenAlarmController {
  async changePowerState(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
        req.query['device_id']
      )
      currentDevice.changePowerState(1, req.query['status'])
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
  async updateOptions(req, res) {
    try {
      let currentDevice = await DeviceService.getDeviceById(
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
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
}

module.exports = new SmartSirenAlarmController()
