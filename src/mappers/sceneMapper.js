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

const mapSceneToViewModel = (scene) => {
  return toJSON(scene)
}

module.exports = {
  mapSceneToViewModel,
}
