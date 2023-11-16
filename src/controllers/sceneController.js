const { SceneService } = require('../services/sceneService')

class SceneController {
  async getScenes(req, res) {
    let scenes = await SceneService.getAllScenes(true)
    res.json(scenes)
  }
  async getScene(req, res) {
    try {
      let currentScene = await SceneService.getSceneByID(
        req.params['id'],
        (json = true)
      )
      res.json(currentScene)
    } catch (error) {
      res.json({ succes: false, msg: "Scene doesn't exist" })
    }
  }
  async createScene(req, res) {
    let sceneData = req.body
    try {
      await SceneService.insertScene(sceneData)
      res.json({ succes: true })
    } catch (error) {
      console.log(error)
      res.json({ succes: false })
    }
  }
  async updateScene(req, res) {
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
  }
  async deleteScene(req, res) {
    try {
      let scenes = await SceneService.deleteScene(req.params['id'])
      res.json(scenes)
    } catch (error) {
      console.log(error)
      let scenes = await SceneService.getAllScenes()
      res.json(scenes)
    }
  }
}

module.exports = new SceneController()
