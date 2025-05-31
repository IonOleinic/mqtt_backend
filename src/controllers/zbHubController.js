const { DeviceService } = require('../services/deviceService')

class ZbHubController {
  async changePairingMode(req, res) {
    try {
      const currentDevice = await DeviceService.getDeviceById(
        req.query['hub_id']
      )
      currentDevice.sendChangePairingMode(JSON.parse(req.query['pairing_mode']))
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async destroyDevice(req, res) {
    try {
      const currentDevice = await DeviceService.getDeviceById(
        req.query['hub_id']
      )
      const mappedDevice = await DeviceService.getDeviceByMqttName(
        'zb_' + req.query['short_addr']
      )
      if (mappedDevice) {
        await DeviceService.destroyDevice(mappedDevice.id)
      }
      const connectedDevices = currentDevice.zbRemoveDevice(
        req.query['short_addr']
      )
      await DeviceService.updateDevice(currentDevice.id, currentDevice)
      return res.json({ connectedDevices })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
}
module.exports = new ZbHubController()
