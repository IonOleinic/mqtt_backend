const SceneCache = require('../cache/sceneCache')
const { filterSceneList, sortListBy } = require('../helpers/helpers')

class SceneService {
  static async getScenes(userId, filter, order) {
    let scenes = await SceneCache.getScenes(userId)
    if (filter) {
      scenes = filterSceneList(scenes, filter)
    }
    if (order) {
      scenes = sortListBy(scenes, order)
    }
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
