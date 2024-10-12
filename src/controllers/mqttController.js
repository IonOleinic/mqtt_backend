const { SceneService } = require('../services/sceneService')
const { DeviceService } = require('../services/deviceService')
const { checkIfInScene } = require('../helpers/helpers')
const io = require('../servers/socketServer')
let connected = false
class MqttController {
  onConnect = async () => {
    connected = true
    console.log('MQTT Client connected.')
    await DeviceService.loadDeviceCache()
  }
  onClose = async () => {
    if (connected) {
      console.log('MQTT Client disconnected.')
      connected = false
      await DeviceService.loadDeviceCache()
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
      currentDevice = await DeviceService.getTempDeviceByMqttName(buffer[1])
    } else {
      currentDevice = await DeviceService.getTempDeviceByMqttName(buffer[0])
    }
    if (!currentDevice) {
      if (buffer[0] === 'stat' || buffer[0] === 'tele') {
        currentDevice = await DeviceService.getDeviceByMqttName(buffer[1])
      } else {
        currentDevice = await DeviceService.getDeviceByMqttName(buffer[0])
      }
    }
    try {
      if (currentDevice) {
        currentDevice.processIncomingMessage(topic, payload, io)
        if (!currentDevice.device_type.includes('temp')) {
          await DeviceService.updateDeviceOnlyDB(
            currentDevice.id,
            currentDevice
          )
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
