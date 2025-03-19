const db = require('../models/index')
const { User, Device, Scene, Group } = require('../models/index')

User.hasMany(Device, { foreignKey: 'user_id' })
User.hasMany(Scene, { foreignKey: 'user_id' })
User.hasMany(Group, { foreignKey: 'user_id' })
Device.hasMany(Scene, { foreignKey: 'exec_device_id' })
Group.hasMany(Device, { foreignKey: 'group_id' })

module.exports = db
