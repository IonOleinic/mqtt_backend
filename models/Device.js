// deviceModel.js

module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define(
    'Device',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      img: {
        type: DataTypes.STRING,
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
        unique: true,
      },
      mqtt_group: {
        type: DataTypes.STRING,
      },
      device_type: {
        type: DataTypes.STRING,
      },
      battery: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      read_only: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      attributes: {
        type: DataTypes.JSON, // Store attributes as JSON data
      },
    },
    { timestamps: false }
  )

  // Define a foreign key relationship to User
  // User.hasMany(Device, { foreignKey: 'user_id' })
  return Device
}
