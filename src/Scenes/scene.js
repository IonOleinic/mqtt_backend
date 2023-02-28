class Scene {
  constructor(name) {
    this.name = name
    this.date = new Date()
    this.id = new Date().getTime()
  }
}

module.exports = Scene
