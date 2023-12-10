// deviceModel.js
const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  const Scene = sequelize.define(
    'Scene',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      scene_type: {
        type: DataTypes.STRING,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      exec_device_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      executable_topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      executable_payload: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      executable_text: {
        type: DataTypes.STRING,
      },
      attributes: {
        type: DataTypes.JSON, // Store attributes as JSON data
      },
    },
    { timestamps: false }
  )
  return Scene
}
