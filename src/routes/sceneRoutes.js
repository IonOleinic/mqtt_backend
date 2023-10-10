const express = require('express')
const sceneRoutes = express.Router()
const { mqttClient } = require('../mqttClient')
const Horizon_IR = require('../devices/IRPresets.js')
const Schedule = require('../scenes/schedule.js')
const DeviceScene = require('../scenes/deviceScene.js')
const WeatherScene = require('../scenes/weatherScene.js')
const {
  deleteExpiredSchedules,
  toJSON,
  getObjectById,
  deleteObject,
  updateSceneLocaly,
} = require('../helpers')
const {
  getAllScenesLocaly,
  getAllDevicesLocaly,
  updateAllScenesLocaly,
  convertScenesJSON,
  addSceneLocaly,
} = require('../localObjects')

sceneRoutes.get('/scenes', (req, res) => {
  let scenes = deleteExpiredSchedules(getAllScenesLocaly())
  res.json(convertScenesJSON(scenes))
})
sceneRoutes.post('/schedule', (req, res) => {
  try {
    let currentDevice = getObjectById(
      getAllDevicesLocaly(),
      req.query['device_id']
    )
    const dayOfWeek = req.query['dayOfWeek'].split(',')
    const hour = req.query['hour']
    const minute = req.query['minute']
    const name = req.query['name']
    const executableTopic = req.query['executable_topic']
    const executablePayload = req.query['executable_payload']
    const executableText = req.query['executable_text']
    let schedule = new Schedule(name, currentDevice, dayOfWeek, hour, minute)
    const func = () => {
      if (schedule.active) {
        currentDevice.send_mqtt_req(
          mqttClient,
          executableTopic,
          executablePayload
        )
      }
    }
    schedule.active = true
    schedule.repeatedly(func, executableText)
    addSceneLocaly(schedule)
    res.json({ succes: true })
  } catch (error) {
    console.log(error)
    res.json({ succes: false })
  }
})
sceneRoutes.post('/deviceScene', (req, res) => {
  try {
    let deviceScene = new DeviceScene(
      req.query['name'],
      req.query['cond_device_mqtt'],
      req.query['cond_device_id'],
      req.query['exec_device_id'],
      req.query['conditional_topic'],
      req.query['conditional_payload'],
      req.query['executable_topic'],
      req.query['executable_payload'],
      req.query['conditional_text'],
      req.query['executable_text']
    )
    deviceScene.active = true
    addSceneLocaly(deviceScene)
    res.json({ succes: true })
  } catch (error) {
    console.log(error)
    res.json({ succes: false })
  }
})
sceneRoutes.post('/weatherScene', (req, res) => {
  try {
    let weatherScene = new WeatherScene(
      req.query['name'],
      req.query['target_temperature'],
      req.query['executable_topic'],
      req.query['executable_payload'],
      req.query['exec_device_id'],
      req.query['executable_text'],
      req.query['comparison_sign']
    )
    weatherScene.active = true
    weatherScene.initScene(mqttClient)
    addSceneLocaly(weatherScene)
    res.json({ succes: true })
  } catch (error) {
    console.log(error)
    res.json({ succes: false })
  }
})
sceneRoutes.put('/scene/:id', (req, res) => {
  try {
    let currentScene = getObjectById(getAllScenesLocaly(), req.params['id'])
    if (currentScene) {
      let updatedScene = req.body
      updateSceneLocaly(currentScene, updatedScene)
    }
    res.json(toJSON(currentScene))
  } catch (error) {
    console.log(error)
    res.json(toJSON(current_scene))
  }
})
sceneRoutes.delete('/scene/:id', (req, res) => {
  try {
    let currentScene = getObjectById(getAllScenesLocaly(), req.params['id'])
    if (currentScene.delete) {
      currentScene.delete()
    }
    let scenes = deleteObject(getAllScenesLocaly(), req.params['id'])
    updateAllScenesLocaly(scenes)
    res.json(convertScenesJSON(scenes))
  } catch (error) {
    console.log(error)
    res.json(convertScenesJSON(getAllScenesLocaly()))
  }
})
sceneRoutes.get('/scene/:id', (req, res) => {
  try {
    let currentScene = getObjectById(
      getAllScenesLocaly(),
      req.query['scene_id']
    )
    res.json(toJSON(currentScene))
  } catch (error) {
    res.json({ succes: false, msg: "Scene doesn't exist" })
  }
})

module.exports = { sceneRoutes }
