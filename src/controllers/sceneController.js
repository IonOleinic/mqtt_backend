const { SceneService } = require('../services/sceneService')
const { mapSceneToViewModel } = require('../mappers/sceneMapper')
class SceneController {
  async getScenes(req, res) {
    try {
      let scenes = await SceneService.getScenes(
        req.query['user_id'],
        JSON.parse(req.query['filter'] || '{}'),
        req.query['order']
      )
      res.json(scenes.map((scene) => mapSceneToViewModel(scene)))
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async getScene(req, res) {
    try {
      let currentScene = await SceneService.getSceneById(req.params['id'])
      if (currentScene) {
        res.json(mapSceneToViewModel(currentScene))
      } else {
        res.status(404).json({ msg: 'Scene not found!' })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async createScene(req, res) {
    let sceneData = req.body
    sceneData.user_id = req.query['user_id']
    try {
      await SceneService.insertScene(sceneData)
      res.sendStatus(201)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async updateScene(req, res) {
    let sceneData = req.body
    try {
      let updatedScene = await SceneService.updateScene(
        req.params['id'],
        sceneData
      )
      res.json(mapSceneToViewModel(updatedScene))
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async deleteScene(req, res) {
    try {
      const result = await SceneService.deleteScene(req.params['id'])
      if (result) res.json({ succes: true })
      else res.json({ succes: false })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
}

module.exports = new SceneController()
