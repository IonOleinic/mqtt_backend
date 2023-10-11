const {
  deleteExpiredSchedules,
  toJSON,
  getObjectById,
  deleteObject,
  updateSceneLocaly,
  buildSceneObj,
} = require('../helpers')
const {
  getAllScenesLocaly,
  updateAllScenesLocaly,
  convertScenesJSON,
} = require('../localObjects')
class SceneService {
  static getAllScenes(json = false) {
    let scenes = deleteExpiredSchedules(getAllScenesLocaly())
    if (json) {
      return convertScenesJSON(scenes)
    }
    return scenes
  }
  static getSceneByID(sceneId, json = false) {
    let currentScene = getObjectById(getAllScenesLocaly(), sceneId)
    if (json) {
      return toJSON(currentScene)
    }
    return currentScene
  }

  static async insertScene(sceneData) {
    buildSceneObj(sceneData)
    return getAllScenesLocaly()
  }
  static async updateScene(sceneId, sceneData) {
    let currentScene = getObjectById(getAllScenesLocaly(), sceneId)
    if (currentScene) {
      updateSceneLocaly(currentScene, sceneData)
    }
    return toJSON(currentScene)
  }
  static async deleteScene(sceneId) {
    let currentScene = getObjectById(getAllScenesLocaly(), sceneId)
    if (currentScene.delete) {
      currentScene.delete()
    }
    let scenes = deleteObject(getAllScenesLocaly(), sceneId)
    scenes = updateAllScenesLocaly(scenes)
    return convertScenesJSON(scenes)
  }
}

module.exports = { SceneService }
