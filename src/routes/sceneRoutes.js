const express = require('express')
const sceneRoutes = express.Router()
const { SceneService } = require('../services/sceneService')

sceneRoutes.get('/scenes', async (req, res) => {
  let scenes = await SceneService.getAllScenes((json = true))
  res.json(scenes)
})
sceneRoutes.get('/scene/:id', async (req, res) => {
  try {
    let currentScene = await SceneService.getSceneByID(
      req.params['id'],
      (json = true)
    )
    res.json(currentScene)
  } catch (error) {
    res.json({ succes: false, msg: "Scene doesn't exist" })
  }
})
sceneRoutes.post('/scene', async (req, res) => {
  let sceneData = req.body
  try {
    await SceneService.insertScene(sceneData)
    res.json({ succes: true })
  } catch (error) {
    console.log(error)
    res.json({ succes: false })
  }
})
sceneRoutes.put('/scene/:id', async (req, res) => {
  try {
    let updatedScene = await SceneService.updateScene(
      req.params['id'],
      req.body
    )
    res.json(updatedScene)
  } catch (error) {
    console.log(error)
    let currentScene = await SceneService.getSceneByID(req.params['id'])
    res.json(currentScene)
  }
})
sceneRoutes.delete('/scene/:id', async (req, res) => {
  try {
    let scenes = await SceneService.deleteScene(req.params['id'])
    res.json(scenes)
  } catch (error) {
    console.log(error)
    let scenes = await SceneService.getAllScenes()
    res.json(scenes)
  }
})

module.exports = { sceneRoutes }
