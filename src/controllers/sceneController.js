const { SceneService } = require('../services/sceneService')
const { mapSceneToViewModel } = require('../mappers/sceneMapper')
class SceneController {
  async getScenes(req, res) {
    try {
      let scenes = await SceneService.getAllScenes(req.query['user_id'])
      res.json(
        scenes.map((scene) => {
          return mapSceneToViewModel(scene)
        })
      )
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Error occured!' })
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
      res.status(500).json({ msg: 'Error occured!' })
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
      res.status(500).json({ msg: 'Error occured!' })
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
      res.json(sceneData)
    }
  }
  async deleteScene(req, res) {
    try {
      await SceneService.deleteScene(req.params['id'])
    } catch (error) {
      console.log(error)
    }
    let scenes = await SceneService.getAllScenes(req.query['user_id'])
    res.json(
      scenes.map((scene) => {
        return mapSceneToViewModel(scene)
      })
    )
  }
}

module.exports = new SceneController()
