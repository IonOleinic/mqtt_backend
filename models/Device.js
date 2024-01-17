// deviceModel.js
const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    manufacter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mqtt_name: {
      type: DataTypes.STRING,
    },
    mqtt_group: {
      type: DataTypes.STRING,
    },
    device_type: {
      type: DataTypes.STRING,
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    attributes: {
      type: DataTypes.JSON, // Store attributes as JSON data
    },
  })
  return Device
}
