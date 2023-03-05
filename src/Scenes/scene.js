class Scene {
  constructor(name, scene_type, img) {
    this.name = name
    this.date = new Date()
    this.id = new Date().getTime()
    this.favorite = false
    this.active = true
    this.scene_type = scene_type
    this.img = img
  }
}

module.exports = Scene
