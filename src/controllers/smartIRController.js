const { mqttClient } = require('../mqtt/mqttClient.js')
const { subscribeToTopic } = require('../helpers/helpers.js')
const TempIR = require('../devices/tempIR.js')
const { DeviceService } = require('../services/deviceService')

class SmartIRController {
  async pressButton(req, res) {
    let currentDevice = await DeviceService.getDeviceById(
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
      res.status(201).json({ succes: true })
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
}
module.exports = new SmartIRController()
