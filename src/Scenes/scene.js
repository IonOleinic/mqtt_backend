class Scene {
  constructor(name, scene_type, img) {
    this.name = name
    this.date = new Date()
    this.id = Math.random().toString(18).slice(3)
    this.favorite = false
    this.active = false
    this.scene_type = scene_type
    this.img = img
  }
}

module.exports = Scene
