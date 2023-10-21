const db = require('../models/index')
const { User, Device, Scene } = require('../models/index')

User.hasMany(Device, { foreignKey: 'user_id' })
Device.hasMany(Scene, { foreignKey: 'exec_device_id' })

module.exports = db
