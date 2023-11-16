const { mqttClient } = require('../mqttClient')
const { subscribeToTopic } = require('../helpers')
const TempIR = require('../devices/tempIR.js')
const { DeviceService } = require('../services/deviceService')

class SmartIRController {
  async pressButton(req, res) {
    let currentDevice = await DeviceService.getDeviceByID(
      req.query['device_id']
    )
    if (currentDevice) {
      try {
        currentDevice.pressButton(req.query['btn_code'])
        res.json({ succes: true })
      } catch (error) {
        console.log(error)
        res.json({ succes: false })
      }
    }
  }
  createTempDevice(req, res) {
    try {
      let tempIR = new TempIR(req.query['manufacter'], req.query['mqtt_name'])
      DeviceService.insertTempDevice(tempIR)
      subscribeToTopic(mqttClient, tempIR.receive_topic)
    } catch (error) {
      console.log(error)
      res.json({ Succes: false })
    }
    res.json({ Succes: true })
  }
}
module.exports = new SmartIRController()
