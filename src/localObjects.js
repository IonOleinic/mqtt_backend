let scenes = []
let devices = []
let tempDevices = []

const toJSON = (object) => {
  var attrs = {}
  for (var attr in object) {
    if (typeof object[attr] != 'function') {
      try {
        attrs[attr] = String(object[attr]) // force to string
      } catch (error) {}
    }
  }
  return attrs
}
const getAllScenesLocaly = () => {
  return scenes
}
const convertScenesJSON = (scenes) => {
  let scenesToReturn = []
  for (let i = 0; i < scenes.length; i++) {
    scenesToReturn.push(toJSON(scenes[i]))
  }
  return scenesToReturn
}
const updateAllScenesLocaly = (newListOfScenes) => {
  scenes = newListOfScenes
  return newListOfScenes
}
const addSceneLocaly = (newScene) => {
  scenes.push(newScene)
  return scenes
}
const getAllDevicesLocaly = () => {
  return devices
}
const updateAllDevicesLocaly = (newListOfDevices) => {
  devices = newListOfDevices
  return newListOfDevices
}
const updateAllTempDevices = (newListOfTempDevices) => {
  tempDevices = newListOfTempDevices
  return newListOfTempDevices
}
const getAllTempDevices = () => {
  return tempDevices
}
module.exports = {
  getAllScenesLocaly,
  updateAllScenesLocaly,
  getAllDevicesLocaly,
  updateAllDevicesLocaly,
  updateAllTempDevices,
  getAllTempDevices,
  convertScenesJSON,
  addSceneLocaly,
}
