const SceneCache = require('../cache/sceneCache')

class SceneService {
  static async getAllScenes(userId) {
    let scenes = await SceneCache.getScenes(userId)
    return scenes
  }
  static async getSceneById(sceneId) {
    let currentScene = await SceneCache.getScene(sceneId)
    return currentScene
  }
  static async insertScene(sceneData) {
    return await SceneCache.insertScene(sceneData)
  }
  static async updateScene(sceneId, sceneData) {
    let currentScene = await SceneCache.updateScene(sceneId, sceneData)
    return currentScene
  }
  static async deleteScene(sceneId) {
    let scenes = await SceneCache.deleteScene(sceneId)
    return scenes
  }
}

module.exports = { SceneService }
