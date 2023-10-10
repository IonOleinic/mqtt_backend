const express = require('express')
const deviceRoutes = express.Router()
const { mqttClient } = require('../mqttClient')
const {
  getAllDevicesDB,
  deleteScenesCascade,
  filterDeviceList,
  updateDeviceLocaly,
  getDeviceByMqttName,
  getAllGroups,
  getObjectById,
} = require('../helpers')
const { insertDevice, updateDevice, deleteDevice } = require('../database')
const { DeviceTypes } = require('../deviceTypes')
const {
  getAllScenesLocaly,
  getAllDevicesLocaly,
  updateAllScenesLocaly,
  updateAllDevicesLocaly,
} = require('../localObjects')
deviceRoutes.post('/device', async (req, res) => {
  let arrived = req.body
  let result = { succes: false, msg: 'ERROR' }
  try {
    if (
      getDeviceByMqttName(getAllDevicesLocaly(), arrived.mqtt_name) &&
      arrived.device_type !== 'smartIR'
    ) {
      result = { succes: false, msg: 'Device already exists!' }
    } else {
      let returnedId = await insertDevice(arrived)
      let devices = await getAllDevicesDB()
      tempDevices = []
      result = { succes: true, msg: 'Device added with succes' }
    }
  } catch (error) {
    console.log(error)
    result = { succes: false, msg: 'Error ocurred!' }
  }

  res.json(result)
})
deviceRoutes.put('/device/:id', async (req, res) => {
  let updatedDevice = req.body
  let currentDevice = getObjectById(getAllDevicesLocaly(), req.params['id'])
  try {
    let returnedId = await updateDevice(req.params['id'], updatedDevice)
    // devices = await get_all_devices_db()
    updateDeviceLocaly(currentDevice, updatedDevice)
    res.json(currentDevice)
  } catch (error) {
    console.log(error)
    res.json(currentDevice)
  }
})
deviceRoutes.get('/devices', (req, res) => {
  const filter = decodeURIComponent(req.query['filter'])
  let devicesToReturn = getAllDevicesLocaly()
  if (filter) {
    devicesToReturn = filterDeviceList(filter, getAllDevicesLocaly())
  }
  res.json(devicesToReturn)
})
deviceRoutes.delete('/device/:id', async (req, res) => {
  let deviceId = req.params['id']
  if (deviceId) {
    let returnedId = await deleteDevice(deviceId)
    let devices = await getAllDevicesDB()
    let scenes = deleteScenesCascade(getAllScenesLocaly(), deviceId)
    updateAllScenesLocaly(scenes)
    updateAllDevicesLocaly(devices)
    res.json(devices)
  } else {
    res.json(devices)
  }
})
deviceRoutes.get('/device/:id', (req, res) => {
  let currentDevice = getObjectById(getAllDevicesLocaly(), req.params['id'])
  if (currentDevice) {
    res.json(currentDevice)
  } else {
    res.json({ succes: false, msg: "Device doesn't exist" })
  }
})
deviceRoutes.get('/device/getInitState/:id', (req, res) => {
  let current_device = getObjectById(getAllDevicesLocaly(), req.params['id'])
  if (current_device.get_initial_state) {
    current_device.get_initial_state(mqttClient)
    res.json({ succes: true })
  } else {
    res.json({ succes: false, msg: "Device doesn't exist" })
  }
})
deviceRoutes.get('/mqttGroups', (req, res) => {
  let mqttGroups = getAllGroups(getAllDevicesLocaly())
  res.json(mqttGroups)
})
deviceRoutes.get('/deviceTypes', (req, res) => {
  res.json(DeviceTypes)
})
module.exports = {
  deviceRoutes,
}
