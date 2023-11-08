const SceneCache = require('../cache/sceneCache')

const toJSON = (object) => {
  var attrs = {}
  for (var attr in object) {
    if (typeof object[attr] != 'function') {
      try {
        if (['number', 'boolean', 'array'].includes(typeof object[attr])) {
          attrs[attr] = object[attr]
        } else {
          attrs[attr] = String(object[attr])
        } // force to string
      } catch (error) {}
    }
  }
  return attrs
}

class SceneService {
  static async getAllScenes(json = false) {
    let scenes = await SceneCache.getScenes()
    if (json) {
      return scenes.map((scene) => {
        return toJSON(scene)
      })
    }
    return scenes
  }
  static async getSceneByID(sceneId, json = false) {
    let currentScene = await SceneCache.getScenes(sceneId)
    if (json) {
      return toJSON(currentScene)
    }
    return currentScene
  }
  static async insertScene(sceneData) {
    return await SceneCache.insertScene(sceneData)
  }
  static async updateScene(sceneId, sceneData) {
    let currentScene = await SceneCache.updateScene(sceneId, sceneData)
    return toJSON(currentScene)
  }
  static async deleteScene(sceneId) {
    let scenes = await SceneCache.deleteScene(sceneId)
    return scenes.map((scene) => {
      return toJSON(scene)
    })
  }
}

module.exports = { SceneService }
