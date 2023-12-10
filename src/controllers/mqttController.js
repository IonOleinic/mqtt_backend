const { SceneService } = require('../services/sceneService')
const { DeviceService } = require('../services/deviceService')
const { checkIfInScene } = require('../helpers/helpers')
const io = require('../servers/socketServer')
let connected = false
class MqttController {
  onConnect = () => {
    connected = true
    console.log('MQTT Client connected.')
    DeviceService.getAllDevicesDB()
  }
  onClose = () => {
    if (connected) {
      console.log('MQTT Client disconnected.')
      connected = false
    }
  }
  onError = (error) => {
    console.log('MQTT Client error:', error)
  }

  onMessage = async (topic, payload) => {
    let buffer = topic.split('/')
    payload = payload.toString()
    let currentDevice = undefined
    if (buffer[0] === 'stat' || buffer[0] === 'tele') {
      currentDevice = DeviceService.getDeviceByMqttName(
        buffer[1],
        DeviceService.getAllTempDevices()
      )
    } else {
      currentDevice = DeviceService.getDeviceByMqttName(
        buffer[0],
        DeviceService.getAllTempDevices()
      )
    }
    if (!currentDevice) {
      if (buffer[0] === 'stat' || buffer[0] === 'tele') {
        currentDevice = DeviceService.getDeviceByMqttName(buffer[1])
      } else {
        currentDevice = DeviceService.getDeviceByMqttName(buffer[0])
      }
    }
    try {
      if (currentDevice) {
        currentDevice.processIncomingMessage(topic, payload, io)
        if (currentDevice.battery) {
          DeviceService.updateDeviceOnlyDB(currentDevice.id, currentDevice)
        }
        checkIfInScene(
          currentDevice,
          await SceneService.getAllScenes(),
          topic,
          payload
        )
      }
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = new MqttController()
