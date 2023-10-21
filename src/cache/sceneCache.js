// sceneCache.js
const { Scene } = require('../../models') // Sequelize Scene model
const Horizon_IR = require('../devices/IRPresets.js')
const Schedule = require('../scenes/schedule.js')
const DeviceScene = require('../scenes/deviceScene.js')
const WeatherScene = require('../scenes/weatherScene.js')

class SceneCache {
  constructor() {
    this.scenes = new Map()
    this.initSceneCache()
  }
  async initSceneCache() {
    try {
      let scenesFromDB = await Scene.findAll()
      scenesFromDB.forEach((instance) => {
        let sceneDB = instance.dataValues
        this.scenes.set(sceneDB.id.toString(), this.buildSceneObj(sceneDB))
      })
    } catch (error) {
      console.log(error)
    }
  }
  async getScenes() {
    return await this.deleteExpiredSchedules()
  }
  async getScene(sceneId) {
    sceneId = sceneId.toString()
    try {
      if (this.scenes.has(sceneId)) {
        return this.scenes.get(sceneId)
      }
      // If the scene is not in the cache, load it from the database
      const sceneDB = await Scene.findByPk(sceneId)
      let scene = this.buildSceneObj(sceneDB.dataValues)
      if (sceneDB) {
        this.scenes.set(sceneId, scene)
      }
      return scene
    } catch (error) {
      console.log(error)
      return undefined
    }
  }
  async insertScene(sceneData) {
    sceneData.date = new Date()
    sceneData.name = sceneData.name
      ? sceneData.name
      : 'Scene ' + Math.random().toString(16).slice(2, 7)
    try {
      const sceneDB = await Scene.create(sceneData)
      sceneData.id = sceneDB.id
      let scene = this.buildSceneObj(sceneDB.dataValues)
      this.scenes.set(sceneDB.id.toString(), scene)
      return scene
    } catch (error) {
      console.log(error)
      return sceneData
    }
  }
  async updateScene(sceneId, sceneData) {
    sceneId = sceneId.toString()
    try {
      const sceneDB = await Scene.findByPk(sceneId)
      let scene = this.scenes.get(sceneId)
      this.updateSceneLocaly(scene, sceneData)
      if (sceneDB) {
        await sceneDB.update(sceneData)
        this.scenes.set(sceneId, scene)
      }
      return scene
    } catch (error) {
      console.log(error)
      return sceneData
    }
  }
  async deleteScene(sceneId) {
    sceneId = sceneId.toString()
    try {
      const sceneDB = await Scene.findByPk(sceneId)
      if (sceneDB) {
        await sceneDB.destroy()
        let scene = this.scenes.get(sceneId)
        if (scene.delete) {
          scene.delete()
        }
        this.scenes.delete(sceneId)
      }
    } catch (error) {
      console.log(error)
    }

    return Array.from(this.scenes.values())
  }
  async deleteExpiredSchedules() {
    let copyOfScenes = Array.from(this.scenes.values())
    try {
      for (let i = 0; i < copyOfScenes.length; i++) {
        if (copyOfScenes[i].scene_type == 'schedule') {
          if (copyOfScenes[i].isExpired()) {
            await this.deleteScene(copyOfScenes[i].id)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }

    return Array.from(this.scenes.values())
  }
  buildSceneObj(sceneData) {
    let scene = {}
    switch (sceneData.scene_type) {
      case 'schedule':
        scene = new Schedule(sceneData)
        break
      case 'weather':
        scene = new WeatherScene(sceneData)
        break
      case 'deviceScene':
        scene = new DeviceScene(sceneData)
        break

      default:
        break
    }

    if (scene.initScene) {
      scene.initScene()
    }
    return scene
  }
  updateSceneLocaly(oldScene, newScene) {
    oldScene.name = newScene.name
    oldScene.active = newScene.active
    oldScene.favorite = newScene.favorite
    oldScene.img = newScene.img
  }
  async deleteScenesCascade(deviceId) {
    let copyOfScenes = Array.from(this.scenes.values())
    try {
      for (let i = 0; i < copyOfScenes.length; i++) {
        if (
          deviceId == copyOfScenes[i].cond_device_id ||
          deviceId == copyOfScenes[i].exec_device_id
        ) {
          await this.deleteScene(copyOfScenes[i].id)
        }
      }
    } catch (error) {
      console.log(error)
    }

    return Array.from(this.scenes.values())
  }
}

module.exports = new SceneCache()
