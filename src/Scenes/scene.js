class Scene {
  constructor(name, scene_type, img) {
    if (name === '') {
      this.name = 'Scene ' + Math.random().toString(16).slice(2, 7)
    } else {
      this.name = name
    }
    this.date = new Date().toString()
    this.id = Math.random().toString(18).slice(3)
    this.favorite = false
    this.active = false
    this.scene_type = scene_type
  }
}

module.exports = Scene
